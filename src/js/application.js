import {
  throttle,
  getFullAngle,
  generateElement,
  generateEye,
  getFace,
  loadCascade,
  loadPupil,
} from "./helper";

const THROTTLE_DELAY = 10;
const EYE_SIZE = 20; // min size should be 15

export const initMouseListener = async (container) => {
  await loadCascade();
  await loadPupil();
  const images = document.querySelectorAll("img");
  const imgData = [...images].map(async (image) => {
    const img = await getFace(image);
    return img;
  });
  const faceCoordinates = await Promise.all(imgData);

  const googleEyes = [...images].map((image, idx) =>
    faceCoordinates[idx].map((faceData) => {
      return new GooglyEyes(image, container, faceData);
    })
  );

  document.body.addEventListener("mousemove", (event) => {
    googleEyes.flat().forEach((eye) => {
      const throttleEye = throttle(eye.moveEyes.bind(eye), THROTTLE_DELAY);
      throttleEye(event);
    });
  });
};

class GooglyEyes {
  constructor(image, container, faceData) {
    const imgDimensions = image.getBoundingClientRect();

    this.face = generateElement({ tag: "div", className: "face" });
    this.face.style.top = `${imgDimensions.top}px`;
    this.face.style.left = `${imgDimensions.left}px`;
    this.face.style.height = `${imgDimensions.height}px`;
    this.face.style.width = `${imgDimensions.width}px`;

    const { face, eye1, eye2 } = faceData;

    const eyeSize = face[2] * 0.2;
    if (eyeSize > 15) {
      const leftEye = generateEye(eyeSize, eye1);
      const rightEye = generateEye(eyeSize, eye2);

      this.face.append(leftEye);
      this.face.append(rightEye);
      container.append(this.face);
    }
  }

  moveEyes(event) {
    const eyes = this.face.querySelectorAll(".eye");

    for (let i = 0; i < eyes.length; i++) {
      const eye = eyes[i];
      const inner = eye.querySelector(".inner");
      const eyeBound = eye.getBoundingClientRect();
      const innerBound = inner.getBoundingClientRect();

      const innerRadius = innerBound.width / 2;
      const radius = eyeBound.width / 2;

      const x = event.pageX - innerRadius;
      const y = event.pageY - innerRadius;

      const mouseX = x - eyeBound.left - innerRadius;
      const mouseY = y - eyeBound.top - innerRadius;
      const mouseRadius = Math.sqrt(mouseX ** 2 + mouseY ** 2);

      const deltaRadius = radius - innerRadius;

      if (deltaRadius > mouseRadius) {
        inner.style["left"] = `${mouseX + innerRadius}px`;
        inner.style["top"] = `${mouseY + innerRadius}px`;
      } else {
        const opposite = eyeBound.top + deltaRadius - y;
        const adjacent = x - (eyeBound.left + deltaRadius);

        let angle = Math.atan(opposite / adjacent);
        angle = getFullAngle(adjacent, opposite, angle);

        const yMax = deltaRadius * Math.sin(angle);
        const xMax = deltaRadius * Math.cos(angle);

        const eyeTop = deltaRadius - yMax;
        const eyeLeft = deltaRadius + xMax;

        inner.style["top"] = `${eyeTop}px`;
        inner.style["left"] = `${eyeLeft}px`;
      }
    }
  }
}

export default GooglyEyes;
