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
const EYE_SIZE = 40;

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
    this.container = container;
    console.log(faceData);
    this.face = generateElement({ tag: "div", className: "face" });

    const leftEye = generateEye(EYE_SIZE, "left");
    const rightEye = generateEye(EYE_SIZE, "right");
    const imgDimensions = image.getBoundingClientRect();

    const { face, eye1, eye2 } = faceData;
    this.face.style.top = `${imgDimensions.top + face[0] - face[2] / 2}px`;
    this.face.style.left = `${face[1] - face[2] / 2}px`;
    this.face.style.gap = `${Math.abs(eye1[1] - eye2[1])}px`;
    this.face.style.height = `${face[2]}px`;
    this.face.style.width = `${face[2]}px`;

    this.face.append(leftEye);
    this.face.append(rightEye);
    this.container.append(this.face);
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
