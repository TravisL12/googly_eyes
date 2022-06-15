// https://codeburst.io/throttling-and-debouncing-in-javascript-b01cad5c8edf
const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function () {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

const eyes = document.querySelectorAll(".eye");
const debug = document.querySelector(".debug");
const THROTTLE_DELAY = 10;
const SHADOW_LENGTH = 50;
const SHADOW_COLOR = "rgba(0, 0, 0, 0.75)";

const BORDER_OFFSET = 1;

const angle2Deg = (angle) => {
  return angle * (180 / Math.PI);
};

const angle2Rads = (angle) => {
  return angle / (180 / Math.PI);
};

const getFullAngle = (x, y, angle) => {
  const ang = angle2Deg(angle);

  if (x > 0 && y > 0) {
    return angle;
  }
  if (x <= 0 && y > 0) {
    return angle2Rads(180 + ang);
  }
  if (x <= 0 && y <= 0) {
    return angle2Rads(180 + ang);
  }

  return angle2Rads(360 + ang);
};

const calcShadow = (event) => {
  for (let i = 0; i < eyes.length; i++) {
    const eye = eyes[i];
    const inner = eye.querySelector(".inner");
    const eyeBound = eye.getBoundingClientRect();
    const innerBound = inner.getBoundingClientRect();

    const innerRadius = innerBound.width / 2;
    const radius = eyeBound.width / 2;

    const y = event.pageY - innerRadius;
    const x = event.pageX - innerRadius;
    const mouseRadius = Math.sqrt(
      (y - eyeBound.top + radius) ** 2 + (x - eyeBound.left + radius) ** 2
    );

    const deltaRadius = Math.min(radius - innerRadius, mouseRadius);

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
};

document.body.addEventListener(
  "mousemove",
  throttle(calcShadow, THROTTLE_DELAY)
);
