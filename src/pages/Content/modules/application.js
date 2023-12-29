import {
  throttle,
  getFullAngle,
  generateElement,
  getFace,
  stripPixels,
  randomImgId,
  randomizer,
} from './helper';

import {
  THROTTLE_DELAY,
  EYE_MIN,
  EYE_SIZE_FACTOR,
  IMG_ID_ATTR,
  EYELID_MAX_PERC,
  PICTURE_LIMIT,
  EYE_TYPES,
  HAS_EYELIDS,
  PICTURE_LIMIT_SETTING,
  IS_GOOGLY_ON,
} from './constants';

const googlyContainer = generateElement({
  tag: 'div',
  className: 'googly-eyes',
});
document.body.appendChild(googlyContainer);

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
      const face = new Face(image, faceData, this[HAS_EYELIDS]);
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
  constructor(image, faceData, hasEyeLids) {
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
    });
    this.container.style.top = `${imgDimensions.top + docTop}px`;
    this.container.style.left = `${imgDimensions.left}px`;

    const { face, eye1, eye2 } = faceData;

    // eye size based on size of face (face[2])
    const scale = stripPixels(width) / image.naturalWidth;
    const eyeSize = face[2] * EYE_SIZE_FACTOR * scale;
    if (eyeSize > EYE_MIN) {
      const type = EYE_TYPES[0]; // EYE_TYPES[randomizer(EYE_TYPES.length - 1)];
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

      const { eye, inner, lidOpen } = eyeObj;

      const eyeBound = eye.getBoundingClientRect();
      const innerBound = inner.getBoundingClientRect();

      const radius = eyeBound.width / 2;
      const innerRadius = innerBound.width / 2;

      const x = event.clientX - innerRadius;
      const y = event.clientY - innerRadius;

      const mouseX = x - eyeBound.left - innerRadius;
      const mouseY = y - eyeBound.top - innerRadius;
      const mouseRadius = Math.sqrt(mouseX ** 2 + mouseY ** 2);

      const deltaRadius = radius - innerRadius;

      const isInsideEye = deltaRadius > mouseRadius;
      if (isInsideEye) {
        inner.style['left'] = `${mouseX + innerRadius}px`;
        inner.style['top'] = `${mouseY + innerRadius}px`;
      } else {
        const opposite = eyeBound.top + deltaRadius - y;
        const adjacent = x - (eyeBound.left + deltaRadius);

        const angle = getFullAngle(adjacent, opposite);

        const yMax = deltaRadius * Math.sin(angle);
        const xMax = deltaRadius * Math.cos(angle);

        const eyeLeft = deltaRadius + xMax;

        const isAtBottom = yMax === -1 * deltaRadius;
        const isAtTop = yMax === deltaRadius;
        const eyeTop = isAtBottom
          ? 0
          : isAtTop
          ? 2 * deltaRadius
          : deltaRadius - yMax;

        const lidHeight = 100 * (eyeTop / eyeBound.height);

        const openPerc = Math.min(100, lidHeight);
        lidOpen.style.height = `${EYELID_MAX_PERC - openPerc}%`;
        lidOpen.style.top = `${openPerc}%`;

        inner.style['top'] = `${eyeTop}px`;
        inner.style['left'] = `${eyeLeft}px`;
      }
    }
  }
}

class Eye {
  constructor(eyeSize, eyeData, scale, eyeType, hasEyeLids = true) {
    this.type = eyeType || '';
    this.eye = generateElement({ tag: 'div', className: `eye ${this.type}` });
    const halfEye = eyeSize / 2;
    const [posTop, posLeft] = eyeData;

    this.eye.style.height = `${eyeSize}px`;
    this.eye.style.width = `${eyeSize}px`;
    this.eye.style.top = `${scale * (posTop - halfEye)}px`;
    this.eye.style.left = `${scale * (posLeft - halfEye)}px`;

    this.inner = generateElement({
      tag: 'div',
      className: `inner`,
    });

    const lidClass = hasEyeLids ? '' : 'none';
    this.lid = generateElement({
      tag: 'div',
      className: `eye-lid ${lidClass}`,
    });
    this.lid.style.height = `${EYELID_MAX_PERC - 1}%`;
    this.lid.style.borderRadius = `${eyeSize}px ${eyeSize}px 0 0`;

    this.lidOpen = generateElement({
      tag: 'div',
      className: `eye-lid-open ${lidClass}`,
    });
    this.lidOpen.style.height = `${EYELID_MAX_PERC}%`;
    this.lidOpen.style.borderRadius = `${eyeSize}px ${eyeSize}px 0 0`;

    this.eye.appendChild(this.inner);

    this.eye.appendChild(this.lid);
    this.eye.appendChild(this.lidOpen);
  }

  // toggling "none" is the `true` case, so set opposite of `true` (i.e. `false`)
  // to represent showing the eyelids
  toggleEyeLids(isOn) {
    this.lid.classList.toggle('none', !isOn);
    this.lidOpen.classList.toggle('none', !isOn);
  }
}
