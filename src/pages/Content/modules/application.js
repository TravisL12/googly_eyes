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
  IS_GOOGLY_ATTR,
  IMG_ID_ATTR,
} from './constants';

const googlyContainer = generateElement({
  tag: 'div',
  className: 'googly-eyes',
});
document.body.appendChild(googlyContainer);

export default class GooglyEyes {
  constructor() {
    this.throttledEyes = [];
  }

  initialLoad(intersectObserver) {
    const startImages = document.querySelectorAll('img');
    startImages.forEach((image) => {
      intersectObserver.observe(image);
    });
  }

  async drawEyes(image) {
    const imgId = randomImgId();
    image.setAttribute(IS_GOOGLY_ATTR, true);
    image.setAttribute(IMG_ID_ATTR, imgId);

    const faceCoordinates = await getFace(image);
    if (!faceCoordinates) {
      return;
    }
    faceCoordinates.forEach((faceData) => {
      const eye = new Face(image, faceData);
      googlyContainer.append(eye.face);
      const throttleEye = throttle(eye.moveEyes.bind(eye), THROTTLE_DELAY);
      this.throttledEyes.push(throttleEye);
    });
  }

  undraw(image) {
    const imageId = image.getAttribute(IMG_ID_ATTR);
    const existingFaces = document.querySelectorAll(
      `.face[${IMG_ID_ATTR}=${imageId}]`
    );
    if (existingFaces) {
      image.removeAttribute(IS_GOOGLY_ATTR);
      image.removeAttribute(IMG_ID_ATTR);
      Array.from(existingFaces).forEach((face) => {
        face.remove();
      });
    }
  }

  removePreviousFaceElements() {
    const faces = document.querySelectorAll('.face');
    faces.forEach((face) => face.remove()); // delete eyes

    const existingGooglyImages = document.querySelectorAll(
      `img[${IS_GOOGLY_ATTR}="true"]`
    );
    Array.from(existingGooglyImages).forEach((image) => {
      image.removeAttribute(IS_GOOGLY_ATTR); // reset image element
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
    this.face = generateElement({ tag: 'div', className: 'face' });
    this.face.setAttribute(IMG_ID_ATTR, imageId); // associate with image
    this.face.style.top = `${imgDimensions.top + docTop}px`;
    this.face.style.left = `${imgDimensions.left}px`;

    const { face, eye1, eye2 } = faceData;

    // eye size based on size of face (face[2])
    const scale = stripPixels(width) / image.naturalWidth;
    const eyeSize = face[2] * EYE_SIZE_FACTOR * scale;
    if (eyeSize > EYE_MIN) {
      const leftEye = this.buildEye(eyeSize, eye1, scale);
      const rightEye = this.buildEye(eyeSize, eye2, scale);

      this.eyes = [leftEye, rightEye];
      this.face.append(leftEye);
      this.face.append(rightEye);
    }
  }

  buildEye(eyeSize, eyeData, scale) {
    const eye = generateElement({ tag: 'div', className: `eye` });
    const halfEye = eyeSize / 2;
    const [posTop, posLeft] = eyeData;

    eye.style.height = `${eyeSize}px`;
    eye.style.width = `${eyeSize}px`;
    eye.style.top = `${scale * (posTop - halfEye)}px`;
    eye.style.left = `${scale * (posLeft - halfEye)}px`;
    eye.innerHTML = `<div class="inner"></div>`;
    // <div class="eye-lid" style="height: ${eyeSize / 2}px"></div>
    return eye;
  }

  moveEyes(event) {
    for (let i = 0; i < this.eyes.length; i++) {
      const eye = this.eyes[i];
      if (!eye) continue;

      const inner = eye.querySelector('.inner');
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

        inner.style['top'] = `${eyeTop}px`;
        inner.style['left'] = `${eyeLeft}px`;
      }
    }
  }
}
