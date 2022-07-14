import { throttle, getFullAngle, generateElement, generateEye } from "./helper";

const THROTTLE_DELAY = 10;

export const initMouseListener = (container) => {
  const images = document.querySelectorAll("img");
  const googleEyes = [...images].map(
    (image) => new GooglyEyes(image, container)
  );
  document.body.addEventListener("mousemove", (event) => {
    googleEyes.forEach((eye) => {
      const throttleEye = throttle(eye.calcShadow.bind(eye), THROTTLE_DELAY);
      throttleEye(event);
    });
  });
};

class GooglyEyes {
  constructor(image, container) {
    this.image = image;
    this.container = container;
    this.face = generateElement({ tag: "div", className: "face" });
    const leftEye = generateEye("left");
    const rightEye = generateEye("right");

    this.face.append(this.image);
    this.face.append(leftEye);
    this.face.append(rightEye);
    this.container.append(this.face);
  }

  calcShadow(event) {
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
