import { throttle, getFullAngle, generateElement, getFace } from './helper';

const THROTTLE_DELAY = 30;
const EYE_MIN = 10;
const EYE_SIZE_FACTOR = 0.23;

export default class GooglyEyes {
  constructor() {
    this.container = document.body;
    this.throttledEyes = [];
  }

  removePreviousFaceElements() {
    const faces = document.querySelectorAll('.face');
    faces.forEach((face) => face.remove());
    this.throttledEyes = [];
  }

  drawEyes(images, faceCoordinates) {
    [...images].forEach((image, idx) => {
      faceCoordinates[idx].forEach((faceData) => {
        const eye = new Face(image, faceData);
        this.container.append(eye.face);
        const throttleEye = throttle(eye.moveEyes.bind(eye), THROTTLE_DELAY);
        this.throttledEyes.push(throttleEye);
      });
    });
  }

  async generateFaceCoordinates(images) {
    const faceData = [...images].map((image) => getFace(image));
    return await Promise.all(faceData);
  }

  async addImages(addedImages) {
    const images = Array.from(addedImages || document.querySelectorAll('img'));
    const faceCoordinates = await this.generateFaceCoordinates(images);
    if (faceCoordinates) {
      this.drawEyes(images, faceCoordinates);
    }
  }
}

class Face {
  constructor(image, faceData) {
    const imgDimensions = image.getBoundingClientRect();

    const docTop = document.documentElement.scrollTop;
    this.face = generateElement({ tag: 'div', className: 'googly-eyes face' });
    this.face.style.top = `${imgDimensions.top + docTop}px`;
    this.face.style.left = `${imgDimensions.left}px`;
    this.face.style.height = `${imgDimensions.height}px`;
    this.face.style.width = `${imgDimensions.width}px`;

    const { face, eye1, eye2 } = faceData;

    // eye size based on size of face (face[2])
    const eyeSize = face[2] * EYE_SIZE_FACTOR;
    if (eyeSize > EYE_MIN) {
      const leftEye = this.buildEye(eyeSize, eye1);
      const rightEye = this.buildEye(eyeSize, eye2);

      this.eyes = [leftEye, rightEye];
      this.face.append(leftEye);
      this.face.append(rightEye);
    }
  }

  buildEye(eyeSize, eyeData) {
    const eye = generateElement({ tag: 'div', className: `eye` });
    const halfEye = eyeSize / 2;
    const [posTop, posLeft] = eyeData;

    eye.style.height = `${eyeSize}px`;
    eye.style.width = `${eyeSize}px`;
    eye.style.top = `${posTop - halfEye}px`;
    eye.style.left = `${posLeft - halfEye}px`;
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
