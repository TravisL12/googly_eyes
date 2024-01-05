export const generateElement = (
  { tag, className, attributes, styles } = { tag: 'div' }
) => {
  const el = document.createElement(tag);
  if (className) {
    el.className = className;
  }
  if (styles) {
    Object.entries(styles).forEach(
      ([style, value]) => (el.style[style] = value)
    );
  }
  attributes?.forEach(({ attr, value }) => el.setAttribute(attr, value));
  return el;
};

export function randomizer(max = 1, min = 0) {
  return Math.round(Math.random() * (max - min) + min);
}

export const shuffle = (array) => {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

const letters = 'abcdefghijklmnopqrstuvwxyz';
export const randomImgId = () => {
  let word = '';
  for (let i = 0; i < 10; i++) {
    word += letters[Math.floor(Math.random() * letters.length)];
  }
  return word;
};

// https://codeburst.io/throttling-and-debouncing-in-javascript-b01cad5c8edf
export const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return (...args) => {
    if (!lastRan) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if (Date.now() - lastRan >= limit) {
          func.apply(this, args);
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

export const getFullAngle = (x, y) => {
  const angle = Math.atan(y / x);
  const angleDeg = angle2Deg(angle);

  if (x > 0 && y > 0) {
    return angle;
  }
  if (x <= 0 && y > 0) {
    return angle2Rads(180 + angleDeg);
  }
  if (x <= 0 && y <= 0) {
    return angle2Rads(180 + angleDeg);
  }

  return angle2Rads(360 + angleDeg);
};

// https://stackoverflow.com/a/16245768
export const b64toBlob = (data, sliceSize = 512) => {
  const [contentType, b64Data] = data.split(';base64,');

  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType.slice(5) });
};

export const stripPixels = (value) => {
  return +value.replace('px', '');
};
