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

const calcShadow = (event) => {
  for (let i = 0; i < eyes.length; i++) {
    const eye = eyes[i];
    const inner = eye.querySelector(".inner");
    const eyeBound = eye.getBoundingClientRect();
    const innerBound = inner.getBoundingClientRect();

    const innerRadius = innerBound.width / 2;
    const radius = eyeBound.width / 2;
    const deltaRadius = radius - innerRadius;

    const y = event.pageY - innerRadius;
    const x = event.pageX - innerRadius;

    // solve trig
    const opposite = eyeBound.top + deltaRadius - y;
    const adjacent = x - (eyeBound.left + deltaRadius);
    const angle = Math.atan(opposite / adjacent);
    const angleRads = Math.round(angle * (180 / Math.PI));

    const yMax = deltaRadius * Math.sin(angle);
    const xMax = deltaRadius * Math.cos(angle);

    // closer!
    debug.textContent = `x ${Math.round(xMax)} - y ${Math.round(
      yMax
    )} angle ${angleRads}deg`;

    const maxHeight = eyeBound.height - innerBound.height - BORDER_OFFSET;
    const isMaxHeight = y > eyeBound.bottom - innerBound.height;
    const isMinHeight = y < eyeBound.top;

    const maxWidth = eyeBound.width - innerBound.width - BORDER_OFFSET;
    const isMaxWidth = x > eyeBound.right - innerBound.width;
    const isMinWidth = x < eyeBound.left;

    // need to keep the inner within the eye's border radius
    const eyeHeightPosition = eyeBound.height - (eyeBound.bottom - y);
    const eyeWidthPosition = eyeBound.width - (eyeBound.right - x);

    const eyeTop = isMaxHeight
      ? maxHeight
      : isMinHeight
      ? -BORDER_OFFSET
      : eyeHeightPosition;

    const eyeLeft = isMaxWidth
      ? maxWidth
      : isMinWidth
      ? -BORDER_OFFSET
      : eyeWidthPosition;

    inner.style["top"] = `${eyeTop}px`;
    inner.style["left"] = `${eyeLeft}px`;
  }
};

document.body.addEventListener(
  "mousemove",
  throttle(calcShadow, THROTTLE_DELAY)
);
