import pico from 'picojs';
import { EYELID_MAX_PERC, EYE_TYPES, RANDOM_EYE } from './constants';
import lploc from './lploc';

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

export const moveEye = ({ moveEvent, eye, inner, lidOpen }) => {
  const eyeBound = eye.getBoundingClientRect();
  const innerBound = inner.getBoundingClientRect();

  const radius = eyeBound.width / 2;
  const innerRadius = innerBound.width / 2;

  const x = moveEvent.clientX - innerRadius;
  const y = moveEvent.clientY - innerRadius;

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

    const eyeLeft = deltaRadius + xMax;

    const isAtBottom = yMax === -1 * deltaRadius;
    const isAtTop = yMax === deltaRadius;
    const eyeTop = isAtBottom
      ? 0
      : isAtTop
      ? 2 * deltaRadius
      : deltaRadius - yMax;

    if (lidOpen) {
      const lidHeight = 100 * (eyeTop / eyeBound.height);
      const openPerc = Math.min(100, lidHeight);
      lidOpen.style.height = `${EYELID_MAX_PERC - openPerc}%`;
      lidOpen.style.top = `${openPerc}%`;
    }

    inner.style['top'] = `${eyeTop}px`;
    inner.style['left'] = `${eyeLeft}px`;
  }
};

export const generateElement = (
  { tag, className, attributes } = { tag: 'div' }
) => {
  const el = document.createElement(tag);
  el.className = className;
  attributes?.forEach(({ attr, value }) => el.setAttribute(attr, value));
  return el;
};

export const loadDeps = ({ cascBytes, pupBytes }) => {
  loadCascade(Object.values(cascBytes));
  loadPupil(Object.values(pupBytes));
  return true;
};

let classifyRegion;
const loadCascade = (bytes) => {
  classifyRegion = pico.unpack_cascade(bytes);
  console.log('* cascade loaded');
  return true;
};

let pupilLocation;
const loadPupil = (bytes) => {
  pupilLocation = lploc.unpack_localizer(bytes);
  console.log('* puploc loaded');
  return true;
};

// https://stackoverflow.com/a/16245768
const b64toBlob = (data, sliceSize = 512) => {
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

export const getFace = async (image) => {
  let width, height;
  try {
    const prom = new Promise(async (resolve) => {
      const makeCanvas = () => {
        chrome.runtime.sendMessage(
          {
            type: 'fetch',
            url: image.src,
          },
          (data) => {
            const computed = getComputedStyle(image);
            width = stripPixels(computed.width);
            height = stripPixels(computed.height);

            const blob = b64toBlob(data.blob64);
            const urlObj = URL.createObjectURL(blob);

            const img = new Image();
            img.src = urlObj;

            img.onload = function () {
              const canvas = document.createElement('canvas');
              canvas.height = height;
              canvas.width = width;
              URL.revokeObjectURL(img.src);
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              resolve(ctx);
            };
          }
        );
      };

      if (image.complete) {
        makeCanvas();
      } else {
        image.onload = () => {
          makeCanvas();
        };
      }
    });
    const respCtx = await prom;
    const imgData = respCtx.getImageData(0, 0, width, height).data;
    return findFaceData(imgData, width, height);
  } catch (err) {
    console.log(err, 'canvas loading error');
    return Promise.resolve([]); // I need typescript
  }
};

const rgbaToGrayscale = (rgba, nrows, ncols) => {
  var gray = new Uint8Array(nrows * ncols);
  for (let r = 0; r < nrows; ++r)
    for (let c = 0; c < ncols; ++c)
      gray[r * ncols + c] =
        (2 * rgba[r * 4 * ncols + 4 * c + 0] +
          7 * rgba[r * 4 * ncols + 4 * c + 1] +
          1 * rgba[r * 4 * ncols + 4 * c + 2]) /
        10;
  return gray;
};

const getEye = (r, s, c, imageData) => {
  const [retina, center] = pupilLocation(r, c, s, 63, imageData);
  if (retina >= 0 && center >= 0) {
    return [retina, center];
  }
  return;
};

const findFaceData = (imgData, width, height) => {
  try {
    const imageData = {
      pixels: rgbaToGrayscale(imgData, height, width),
      nrows: height,
      ncols: width,
      ldim: width,
    };
    const params = {
      shiftfactor: 0.1, // move the detection window by 10% of its size
      minsize: 50, // minimum size of a face (not suitable for real-time detection, set it to 100 in that case)
      maxsize: 2500, // maximum size of a face
      scalefactor: 1.1, // for multiscale processing: resize the detection window by 10% when moving to the higher scale
    };

    let dets = pico.run_cascade(imageData, classifyRegion, params);
    dets = pico.cluster_detections(dets, 0.2); // set IoU threshold to 0.2
    const qthresh = 5.0; // this constant is empirical: other cascades might require a different one

    const output = [];
    for (let i = 0; i < dets.length; ++i) {
      const face = dets[i];
      if (face[3] > qthresh) {
        const r = face[0] - 0.075 * face[2];
        const s = 0.35 * face[2];
        const eye1 = getEye(r, s, face[1] - 0.175 * face[2], imageData);
        const eye2 = getEye(r, s, face[1] + 0.175 * face[2], imageData);
        output.push({ face, eye1, eye2 });
      }
    }
    return output;
  } catch (err) {
    console.log(err, 'cant load image');
  }
};

export const getEyeTypeFromIdx = (idx) => {
  const eyeTypeIdx = idx !== undefined ? idx : undefined;
  return EYE_TYPES[eyeTypeIdx] ?? RANDOM_EYE;
};

export const getEyeType = (eyeType) => {
  return eyeType === RANDOM_EYE
    ? EYE_TYPES[randomizer(EYE_TYPES.length - 1)]
    : eyeType;
};
