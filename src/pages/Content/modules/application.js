import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
  generateElement,
  stripPixels,
  randomImgId,
  throttle,
  shuffle,
} from './utilities';

import {
  getFace,
  moveEye,
  getEyeType,
  getEyeTypeFromIdx,
} from './eyeUtilities';

import {
  THROTTLE_DELAY,
  EYE_MIN,
  EYE_SIZE_FACTOR,
  IMG_ID_ATTR,
  PICTURE_LIMIT,
  HAS_EYELIDS,
  PICTURE_LIMIT_SETTING,
  IS_GOOGLY_ON,
  EYE_TYPE_IDX,
} from './constants';

const googlyContainer = generateElement({
  tag: 'div',
  className: 'googly-eyes',
});
document.body.appendChild(googlyContainer);

const root = createRoot(googlyContainer); // createRoot(container!) if you use TypeScript
root.render(<EyesContainer />);

const EyesContainer = () => {
  const [faces, setFaces] = useState([]);

  const intersectObserver = useMemo(() => {
    return new IntersectionObserver(
      (entries) => {
        const inter = entries.filter((e) => e.isIntersecting);
        shuffle(inter).forEach((entry) => {
          drawEyes(entry.target);
        });

        const notInter = entries.filter((e) => !e.isIntersecting);
        notInter.forEach((entry) => {
          undraw(entry.target);
        });
      },
      { threshold: 0.2 }
    );
  }, []);

  const mutationObserver = useMemo(() => {
    return new MutationObserver((mutationList) => {
      mutationList.forEach((listItem) => {
        const imageMap = Array.from(listItem.addedNodes).reduce(
          (accum, node) => {
            if (!node?.querySelectorAll) {
              return accum;
            }
            const imgs = node.querySelectorAll('img');
            return accum.concat(Array.from(imgs));
          },
          []
        );

        imageMap.flat().forEach((image) => {
          intersectObserver.observe(image);
        });
      });
    });
  }, []);

  useEffect(() => {
    if (mutationObserver) {
      mutationObserver.observe(document.body, {
        subtree: true,
        childList: true,
      });
    }
  }, [mutationObserver]);

  return faces;
};

export default class EyesController {
  constructor(intersectObserver) {
    this.faces = [];
    this.intersectObserver = intersectObserver;
    this[IS_GOOGLY_ON] = true;
    this[HAS_EYELIDS] = false;
    this[PICTURE_LIMIT] = PICTURE_LIMIT;
  }

  toggleEnabled() {
    if (!this[IS_GOOGLY_ON]) {
      this.removePreviousFaceElements();
      this.intersectObserver.disconnect();
      return;
    } else {
      this.initialLoad();
    }
  }

  initialLoad(options) {
    this[IS_GOOGLY_ON] = options?.[IS_GOOGLY_ON] || this[IS_GOOGLY_ON];
    if (!this[IS_GOOGLY_ON]) {
      this.removePreviousFaceElements();
      return;
    }
    const isEyelidsOn = options?.[HAS_EYELIDS];
    this[HAS_EYELIDS] = isEyelidsOn || this[HAS_EYELIDS];

    const pictureLimit = options?.[PICTURE_LIMIT_SETTING];
    this[PICTURE_LIMIT] = pictureLimit || this[PICTURE_LIMIT];

    this.eyeType = getEyeTypeFromIdx(options?.[EYE_TYPE_IDX]);

    const startImages = document.querySelectorAll('img');
    startImages.forEach((image) => {
      this.intersectObserver.observe(image);
    });
  }

  async drawEyes(image) {
    if (!this[IS_GOOGLY_ON]) {
      this.removePreviousFaceElements();
      return;
    }

    const faceCoordinates = await getFace(image);
    const isOverMax =
      this.faces.length + faceCoordinates.length > this[PICTURE_LIMIT];
    if (!faceCoordinates || isOverMax) {
      return;
    }

    const imgId = randomImgId();
    image.setAttribute(IMG_ID_ATTR, imgId);
    faceCoordinates.forEach((faceData) => {
      const face = new Face(image, faceData, this[HAS_EYELIDS], this.eyeType);
      googlyContainer.append(face.container);
      const faceItem = {
        imgId,
        face,
        throttleCb: throttle(face.moveEyes.bind(face), THROTTLE_DELAY),
      };

      this.faces.push(faceItem);
    });
  }

  undraw(image) {
    const imageId = image.getAttribute(IMG_ID_ATTR);
    const existingFaces = document.querySelectorAll(
      `.face[${IMG_ID_ATTR}=${imageId}]`
    );
    if (existingFaces) {
      this.faces = this.faces.filter((eye) => eye.imgId !== imageId);
      image.removeAttribute(IMG_ID_ATTR);
      Array.from(existingFaces).forEach((face) => {
        face.remove();
      });
    }
  }

  removePreviousFaceElements() {
    const existingGooglyImages = document.querySelectorAll(
      `img[${IMG_ID_ATTR}]`
    );
    Array.from(existingGooglyImages).forEach((image) => {
      this.undraw(image);
    });
    this.faces = [];
  }
}

export class Face {
  constructor(image, faceData, hasEyeLids, eyeType) {
    const imgDimensions = image.getBoundingClientRect();
    const computed = getComputedStyle(image);
    const width = computed.width;
    const imageId = image.getAttribute(IMG_ID_ATTR);

    const docTop = document.documentElement.scrollTop;
    this.eyes = [];
    this.container = generateElement({
      tag: 'div',
      className: 'face',
      attributes: [{ attr: IMG_ID_ATTR, value: imageId }],
      styles: {
        top: `${imgDimensions.top + docTop}px`,
        left: `${imgDimensions.left}px`,
      },
    });

    const { face, eye1, eye2 } = faceData;

    // eye size based on size of face (face[2])
    const scale = stripPixels(width) / image.naturalWidth;
    const eyeSize = face[2] * EYE_SIZE_FACTOR * scale;
    if (eyeSize > EYE_MIN) {
      const type = getEyeType(eyeType);
      const leftEye = new Eye(eyeSize, eye1, scale, type, hasEyeLids);
      const rightEye = new Eye(eyeSize, eye2, scale, type, hasEyeLids);

      this.eyes = [leftEye, rightEye];
      this.container.append(leftEye.eye);
      this.container.append(rightEye.eye);
    }
  }

  moveEyes(event) {
    for (let i = 0; i < this.eyes.length; i++) {
      const eyeObj = this.eyes[i];
      if (!eyeObj) continue;

      const { eye, inner, lid } = eyeObj;
      moveEye({ moveEvent: event, eye, inner, eyelid: lid });
    }
  }
}

class Eye {
  constructor(eyeSize, eyeData, scale, eyeType, hasEyeLids = true) {
    this.eyeType = eyeType || '';
    const halfEye = eyeSize / 2;
    const [posTop, posLeft] = eyeData;

    this.eye = generateElement({
      tag: 'div',
      className: `eye ${this.eyeType.name}`,
      styles: {
        height: `${eyeSize}px`,
        width: `${eyeSize}px`,
        top: `${scale * (posTop - halfEye)}px`,
        left: `${scale * (posLeft - halfEye)}px`,
      },
    });

    this.inner = generateElement({
      tag: 'div',
      className: `inner`,
      styles: { background: eyeType.innerColor },
    });

    const lidClass = hasEyeLids ? '' : 'none';
    const lidContainer = generateElement({
      tag: 'div',
      styles: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        zIndex: 2,
      },
    });

    this.lid = generateElement({
      tag: 'canvas',
      className: `eyelid ${lidClass}`,
    });

    // canvas height/width floors (rounds) value down
    this.lid.height = eyeSize * 1.1;
    this.lid.width = eyeSize * 1.1;

    lidContainer.appendChild(this.lid);

    this.eye.appendChild(this.inner);
    this.eye.appendChild(lidContainer);
  }

  changeEyeType(newType) {
    this.eye.classList = `eye ${newType.name}`;
    this.inner.style.background = newType.innerColor;
  }

  // toggling "none" is the `true` case, so set opposite of `true` (i.e. `false`)
  // to represent showing the eyelids
  toggleEyeLids(isOn) {
    this.lid.classList.toggle('none', !isOn);
  }
}
