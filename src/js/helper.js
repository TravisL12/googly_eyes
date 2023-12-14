import pico from "picojs";
import lploc from "./lploc";

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

export const generateEye = (eyeSize, eyeData) => {
  const eye = generateElement({ tag: "div", className: `eye` });
  const halfEye = eyeSize / 2;
  const [posTop, posLeft] = eyeData;
  const docTop = document.documentElement.scrollTop;

  eye.style.height = `${eyeSize}px`;
  eye.style.width = `${eyeSize}px`;
  eye.style.top = `${docTop + posTop - halfEye}px`;
  eye.style.left = `${posLeft - halfEye}px`;
  eye.innerHTML = `<div class="inner"></div>`;
  // <div class="eye-lid" style="height: ${eyeSize / 2}px"></div>
  return eye;
};

// https://github.com/nenadmarkus/picojs/blob/master/examples/image.html
// everything below is basically from this example

const cascadeurl =
  "https://raw.githubusercontent.com/nenadmarkus/pico/c2e81f9d23cc11d1a612fd21e4f9de0921a5d0d9/rnt/cascades/facefinder";
const puplocurl = "https://drone.nenadmarkus.com/data/blog-stuff/puploc.bin";
export const loadDeps = async () => {
  const cascadeFetch = fetch(cascadeurl);
  const pupilFetch = fetch(puplocurl);
  const [cascResp, pupResp] = await Promise.all([cascadeFetch, pupilFetch]);

  const cascData = loadCascade(cascResp);
  const pupData = loadPupil(pupResp);
  await Promise.all([cascData, pupData]);
  return true;
};

let classifyRegion;
const loadCascade = async (data) => {
  const buffer = await data.arrayBuffer();
  const bytes = new Int8Array(buffer);
  classifyRegion = pico.unpack_cascade(bytes);
  console.log("* cascade loaded");
  return true;
};

let pupilLocation; // previously 'do_puploc'
const loadPupil = async (data) => {
  const buffer = await data.arrayBuffer();

  const bytes = new Int8Array(buffer);
  pupilLocation = lploc.unpack_localizer(bytes);
  console.log("* puploc loaded");
  return true;
};

export const getFace = async (image) => {
  const canvas = document.createElement("canvas");
  canvas.height = image.height;
  canvas.width = image.width;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(image, 0, 0);
  return findFaceData(ctx, image); // previously 'button_callback'
};

const rgba_to_grayscale = (rgba, nrows, ncols) => {
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

const findFaceData = (ctx, img) => {
  const height = img.height;
  const width = img.width;
  ctx.drawImage(img, 0, 0);
  const rgba = ctx.getImageData(0, 0, width, height).data;
  const imageData = {
    pixels: rgba_to_grayscale(rgba, height, width),
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
};
