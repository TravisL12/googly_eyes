import {
  throttle,
  getFullAngle,
  generateElement,
  getFace,
  stripPixels,
} from './helper';

const THROTTLE_DELAY = 30;
const EYE_MIN = 10;
const EYE_SIZE_FACTOR = 0.23;

const googlyContainer = generateElement({
  tag: 'div',
  className: 'googly-eyes',
});
document.body.appendChild(googlyContainer);

export default class GooglyEyes {
  constructor() {
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
        googlyContainer.append(eye.face);
        const throttleEye = throttle(eye.moveEyes.bind(eye), THROTTLE_DELAY);
        this.throttledEyes.push(throttleEye);
      });
    });
  }

  async generateFaceCoordinates(images) {
    const faceData = [...images].map((image) => getFace(image));
    const faces = await Promise.all(faceData);
    return faces;
  }

  async addImages(addedImages) {
    const images = Array.from(addedImages || document.querySelectorAll('img'));
    const faceCoordinates = await this.generateFaceCoordinates(images);
    if (faceCoordinates) {
      console.log('drawing faces');
      this.drawEyes(images, faceCoordinates);
    }
  }
}

class Face {
  constructor(image, faceData) {
    const imgDimensions = image.getBoundingClientRect();
    const computed = getComputedStyle(image);
    const width = computed.width;

    const docTop = document.documentElement.scrollTop;
    this.eyes = [];
    this.face = generateElement({ tag: 'div', className: 'face' });
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
    } else {
      console.log(eyeSize, image.src, 'eyes too small to draw');
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
