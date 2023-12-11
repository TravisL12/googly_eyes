import pico from "picojs";

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

export const generateEye = (eyeSize, side) => {
  const eye = generateElement({ tag: "div", className: `eye ${side}` });
  eye.style.height = `${eyeSize}px`;
  eye.style.width = `${eyeSize}px`;
  eye.innerHTML = '<div class="inner"></div>';
  return eye;
};

let classifyRegion;
export const getFace = async (image) => {
  const cascadeurl =
    "https://raw.githubusercontent.com/nenadmarkus/pico/c2e81f9d23cc11d1a612fd21e4f9de0921a5d0d9/rnt/cascades/facefinder";
  const data = await fetch(cascadeurl);
  const buffer = await data.arrayBuffer();
  const bytes = new Int8Array(buffer);
  classifyRegion = pico.unpack_cascade(bytes);
  console.log("* cascade loaded");

  const ctx = document.createElement("canvas").getContext("2d");

  ctx.drawImage(image, 0, 0);
  return buttonCallback(ctx, image);
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

// https://github.com/nenadmarkus/picojs/blob/master/examples/image.html

const buttonCallback = (ctx, img) => {
  ctx.drawImage(img, 0, 0);
  const rgba = ctx.getImageData(0, 0, 480, 360).data;
  const imageData = {
    pixels: rgba_to_grayscale(rgba, 360, 480),
    nrows: 360,
    ncols: 480,
    ldim: 480,
  };
  const params = {
    shiftfactor: 0.1, // move the detection window by 10% of its size
    minsize: 20, // minimum size of a face (not suitable for real-time detection, set it to 100 in that case)
    maxsize: 10000, // maximum size of a face
    scalefactor: 1.1, // for multiscale processing: resize the detection window by 10% when moving to the higher scale
  };

  let dets = pico.run_cascade(imageData, classifyRegion, params);
  dets = pico.cluster_detections(dets, 0.2); // set IoU threshold to 0.2
  const qthresh = 5.0; // this constant is empirical: other cascades might require a different one

  const output = [];
  for (let i = 0; i < dets.length; ++i) {
    if (dets[i][3] > qthresh) {
      output.push(dets[i]);
      // ctx.beginPath();
      // ctx.arc(dets[i][1], dets[i][0], dets[i][2] / 2, 0, 2 * Math.PI, false);
      // ctx.lineWidth = 3;
      // ctx.strokeStyle = "red";
      // ctx.stroke();
    }
  }
  return output;
};
