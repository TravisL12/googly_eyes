import {
  throttle,
  getFullAngle,
  generateElement,
  getFace,
  stripPixels,
  randomImgId,
} from './helper';

import {
  THROTTLE_DELAY,
  EYE_MIN,
  EYE_SIZE_FACTOR,
  IMG_ID_ATTR,
  EYELID_MAX_PERC,
  PICTURE_LIMIT,
} from './constants';

const googlyContainer = generateElement({
  tag: 'div',
  className: 'googly-eyes',
});
document.body.appendChild(googlyContainer);

export default class EyesController {
  constructor(intersectObserver) {
    this.throttledEyes = [];
    this.intersectObserver = intersectObserver;
  }

  initialLoad() {
    const startImages = document.querySelectorAll('img');
    startImages.forEach((image) => {
      this.intersectObserver.observe(image);
    });
  }

  async drawEyes(image) {
    const faceCoordinates = await getFace(image);
    const isOverMax =
      this.throttledEyes.length + faceCoordinates.length > PICTURE_LIMIT;

    if (!faceCoordinates || isOverMax) {
      return;
    }

    const imgId = randomImgId();
    image.setAttribute(IMG_ID_ATTR, imgId);
    faceCoordinates.forEach((faceData) => {
      const eye = new Face(image, faceData);
      googlyContainer.append(eye.face);
      const throttleEye = {
        imgId,
        throttleCb: throttle(eye.moveEyes.bind(eye), THROTTLE_DELAY),
      };

      this.throttledEyes.push(throttleEye);
    });
  }

  undraw(image) {
    const imageId = image.getAttribute(IMG_ID_ATTR);
    const existingFaces = document.querySelectorAll(
      `.face[${IMG_ID_ATTR}=${imageId}]`
    );
    if (existingFaces) {
      this.throttledEyes = this.throttledEyes.filter(
        (eye) => eye.imgId !== imageId
      );
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
    this.throttledEyes = [];
  }
}

class Face {
  constructor(image, faceData) {
    const imgDimensions = image.getBoundingClientRect();
    const computed = getComputedStyle(image);
    const width = computed.width;
    const imageId = image.getAttribute(IMG_ID_ATTR);

    const docTop = document.documentElement.scrollTop;
    this.eyes = [];
    this.face = generateElement({
      tag: 'div',
      className: 'face',
      attributes: [{ attr: IMG_ID_ATTR, value: imageId }],
    });
    this.face.style.top = `${imgDimensions.top + docTop}px`;
    this.face.style.left = `${imgDimensions.left}px`;

    const { face, eye1, eye2 } = faceData;

    // eye size based on size of face (face[2])
    const scale = stripPixels(width) / image.naturalWidth;
    const eyeSize = face[2] * EYE_SIZE_FACTOR * scale;
    if (eyeSize > EYE_MIN) {
      const leftEye = new Eye(eyeSize, eye1, scale, false);
      const rightEye = new Eye(eyeSize, eye2, scale, false);

      this.eyes = [leftEye, rightEye];
      this.face.append(leftEye.eye);
      this.face.append(rightEye.eye);
    }
  }

  moveEyes(event) {
    for (let i = 0; i < this.eyes.length; i++) {
      const eyeObj = this.eyes[i];
      if (!eyeObj) continue;

      const { eye, inner, lid } = eyeObj;

      const eyeBound = eye.getBoundingClientRect();
      const innerBound = inner.getBoundingClientRect();

      const innerRadius = innerBound.width / 2;
      const radius = eyeBound.width / 2;

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

        const eyeTop = deltaRadius - yMax;
        const eyeLeft = deltaRadius + xMax;

        lid.style.height = `${Math.min(
          EYELID_MAX_PERC,
          100 * ((eyeTop + eyeTop - 0.1) / stripPixels(eye.style.height))
        )}%`;

        inner.style['top'] = `${eyeTop}px`;
        inner.style['left'] = `${eyeLeft}px`;
      }
    }
  }
}

class Eye {
  constructor(eyeSize, eyeData, scale, hasEyeLids = true) {
    this.eye = generateElement({ tag: 'div', className: `eye` });
    const halfEye = eyeSize / 2;
    const [posTop, posLeft] = eyeData;

    this.eye.style.height = `${eyeSize}px`;
    this.eye.style.width = `${eyeSize}px`;
    this.eye.style.top = `${scale * (posTop - halfEye)}px`;
    this.eye.style.left = `${scale * (posLeft - halfEye)}px`;

    this.inner = generateElement({ tag: 'div', className: `inner` });

    this.lid = generateElement({ tag: 'div', className: `eye-lid` });
    this.lid.style.height = `${EYELID_MAX_PERC}%`;

    if (hasEyeLids) {
      this.eye.appendChild(this.lid);
    }

    this.eye.appendChild(this.inner);
  }
}
