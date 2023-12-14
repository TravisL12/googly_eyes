import {
  throttle,
  getFullAngle,
  generateElement,
  generateEye,
  getFace,
  loadDeps,
} from "./helper";

const THROTTLE_DELAY = 10;
const EYE_MIN = 10;
const EYE_SIZE_FACTOR = 0.2;

const container = document.querySelector(".container");
const images = document.querySelectorAll("img");

const removePreviousFaceElements = () => {
  const faces = document.querySelectorAll(".face");
  faces.forEach((face) => face.remove());
};

const drawEyes = (images, faceCoordinates) => {
  [...images].forEach((image, idx) =>
    faceCoordinates[idx].forEach((faceData) => {
      const eye = new GooglyEyes(image, faceData);
      window.addEventListener("mousemove", (event) => {
        const throttleEye = throttle(eye.moveEyes.bind(eye), THROTTLE_DELAY);
        throttleEye(event);
      });
    })
  );
};

let deps;
const generateFaceCoordinates = async (images) => {
  if (!deps) {
    deps = await loadDeps();
  }
  const faceData = [...images].map((image) => getFace(image));
  return await Promise.all(faceData);
};

let faceCoordinates;
export const initGooglyEyes = async () => {
  console.time("loadEyes");
  faceCoordinates = await generateFaceCoordinates(images);
  console.timeEnd("loadEyes");
  if (faceCoordinates) {
    drawEyes(images, faceCoordinates);
  }
};

window.addEventListener("resize", () => {
  removePreviousFaceElements();
  initGooglyEyes();
});

class GooglyEyes {
  constructor(image, faceData) {
    const imgDimensions = image.getBoundingClientRect();

    this.face = generateElement({ tag: "div", className: "face" });
    this.face.style.top = `${imgDimensions.top}px`;
    this.face.style.left = `${imgDimensions.left}px`;
    this.face.style.height = `${imgDimensions.height}px`;
    this.face.style.width = `${imgDimensions.width}px`;

    const { face, eye1, eye2 } = faceData;

    const eyeSize = face[2] * EYE_SIZE_FACTOR;
    if (eyeSize > EYE_MIN) {
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

      const x = event.clientX - innerRadius;
      const y = event.clientY - innerRadius;

      const mouseX = x - eyeBound.left - innerRadius;
      const mouseY = y - eyeBound.top - innerRadius;
      const mouseRadius = Math.sqrt(mouseX ** 2 + mouseY ** 2);

      const deltaRadius = radius - innerRadius;

      const isInsideEye = deltaRadius > mouseRadius;
      if (isInsideEye) {
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
