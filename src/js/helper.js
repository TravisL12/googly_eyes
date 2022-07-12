// https://codeburst.io/throttling-and-debouncing-in-javascript-b01cad5c8edf
export const throttle = (func, limit) => {
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

const angle2Deg = (angle) => {
  return angle * (180 / Math.PI);
};

const angle2Rads = (angle) => {
  return angle / (180 / Math.PI);
};

export const getFullAngle = (x, y, angle) => {
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

export const generateElement = ({ tag, className } = { tag: "div" }) => {
  const el = document.createElement(tag);
  el.className = className;
  return el;
};

export const generateEye = (side) => {
  const eye = generateElement({ tag: "div", className: `eye ${side}` });
  eye.innerHTML = '<div class="inner"></div>';
  return eye;
};
