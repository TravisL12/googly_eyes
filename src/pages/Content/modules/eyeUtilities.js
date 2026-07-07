import {
  MAX_EYE_ROTATE,
  EYE_TYPES,
  RANDOM_EYE,
  FETCH_IMAGE,
} from './constants';
import { randomizer, b64toBlob, angle2Deg } from './utilities';

// face-api.js is injected as a separate content script (see manifest.json),
// so it lives on the shared isolated-world global rather than being imported.
const getFaceApi = () => window.faceapi;

export const getEyeAngle = (eye1, eye2) => {
  const [eye1top, eye1left] = eye1;
  const [eye2top, eye2left] = eye2;

  const eyeX = eye2left - eye1left;
  const eyeY = eye2top - eye1top;

  const angleRads = Math.atan(eyeY / eyeX);
  const angle = angle2Deg(angleRads);

  return Math.min(MAX_EYE_ROTATE, Math.abs(angle)) * Math.sign(angle);
};

const drawEyelid = (eyeType, openAmount, ctx, radius) => {
  const halfW = radius;
  const halfH = radius;

  ctx.reset();
  ctx.beginPath();
  ctx.ellipse(halfW, halfH, radius, radius, 0, 0, Math.PI, true);

  const gradient = ctx.createRadialGradient(
    halfW,
    halfH,
    0,
    halfW,
    halfH,
    radius
  );

  if (eyeType) {
    gradient.addColorStop(0, eyeType.colors[0]);
    gradient.addColorStop(1, eyeType.colors[1] || 'black');
    ctx.fillStyle = gradient;
  }

  if (openAmount < radius) {
    // look down
    ctx.ellipse(halfW, halfH, radius, radius - openAmount, 0, 0, Math.PI);
  } else {
    // look up
    ctx.closePath();
    ctx.fill();

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.ellipse(
      halfW,
      halfH * 1.05, // remove subtle ghosting on small eyelids
      radius,
      openAmount - radius,
      0,
      0,
      Math.PI,
      true
    );
  }

  ctx.closePath();
  ctx.fill();
};

export const moveEye = ({ moveEvent, eye, inner, eyelid }) => {
  const eyeBound = eye.getBoundingClientRect();
  const innerBound = inner.getBoundingClientRect();
  const radius = eyeBound.width / 2;
  const innerRadius = innerBound.width / 2;
  const maxOffset = radius - innerRadius; // how far the pupil center may travel

  // Vector from the eye center to the cursor, in viewport space.
  const dx = moveEvent.clientX - (eyeBound.left + radius);
  const dy = moveEvent.clientY - (eyeBound.top + radius);
  const dist = Math.hypot(dx, dy) || 1; // guard divide-by-zero at dead center

  // Shrink the vector onto the travel ring; inside the ring this is a no-op
  // (scale === 1) so the pupil sits directly under the cursor.
  const scale = Math.min(dist, maxOffset) / dist;
  const left = maxOffset + dx * scale;
  const top = maxOffset + dy * scale;

  inner.style.left = `${left}px`;
  inner.style.top = `${top}px`;

  if (eyelid) {
    const ctx = eyelid.getContext('2d');
    const eyeType = [...EYE_TYPES, RANDOM_EYE].find(
      ({ name }) => name === Array.from(eye.classList)[1]
    );
    const eyeOverlap = eyeType?.overlap ? eyeBound.width * eyeType.overlap : 0;
    // `top` is 0 (looking up) to 2*maxOffset (looking down), same as before.
    drawEyelid(eyeType, eyeBound.width - top - eyeOverlap, ctx, radius);
  }
};

// Detection uses the face-api.js TinyFaceDetector for the face box and the
// tiny 68-point landmark model for precise eye positions. The models are
// loaded once from loadFaceApiModels() in ../index.js before detection runs.
const DETECTOR_OPTIONS = { inputSize: 416, scoreThreshold: 0.5 };

// Cross-origin images taint a canvas, which breaks tfjs pixel reads, so the
// background service worker proxies the image and returns it as base64. We draw
// it onto a canvas at its natural pixel size — the same space the renderer
// scales from (see the `scale` calc in application.js Face).
const imageToCanvas = (image) =>
  new Promise((resolve, reject) => {
    const build = () => {
      chrome.runtime.sendMessage(
        { type: FETCH_IMAGE, url: image.src },
        (data) => {
          if (!data?.blob64) {
            reject(new Error('no image data returned from background'));
            return;
          }
          const urlObj = URL.createObjectURL(b64toBlob(data.blob64));
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d').drawImage(img, 0, 0);
            URL.revokeObjectURL(urlObj);
            resolve(canvas);
          };
          img.onerror = () => {
            URL.revokeObjectURL(urlObj);
            reject(new Error('proxied image failed to load'));
          };
          img.src = urlObj;
        }
      );
    };

    if (image.complete) {
      build();
    } else {
      image.onload = build;
    }
  });

// Average a set of {x, y} landmark points into a [top, left] pair, matching the
// [posTop, posLeft] ordering the renderer expects for each eye.
const eyeCenter = (points) => {
  const sum = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 }
  );
  return [sum.y / points.length, sum.x / points.length];
};

export const getFace = async (image) => {
  const faceapi = getFaceApi();
  if (!faceapi) {
    return [];
  }
  try {
    const canvas = await imageToCanvas(image);
    const detections = await faceapi
      .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions(DETECTOR_OPTIONS))
      .withFaceLandmarks(true); // true => use the lightweight tiny landmark model

    return detections.map(({ detection, landmarks }) => {
      const { box } = detection;
      // The renderer only reads face[2] (a face-size measure used to scale the
      // eyes); face[0]/face[1] are kept for parity with the old shape.
      const face = [box.x, box.y, box.width];
      return {
        face,
        eye1: eyeCenter(landmarks.getLeftEye()),
        eye2: eyeCenter(landmarks.getRightEye()),
      };
    });
  } catch (err) {
    console.log(err, 'face-api detection error');
    return [];
  }
};

export const getEyeTypeFromIdx = (idx) => {
  const eyeTypeIdx = idx !== undefined ? idx : undefined;
  return EYE_TYPES[eyeTypeIdx] ?? RANDOM_EYE;
};

export const getRandomEye = () => EYE_TYPES[randomizer(EYE_TYPES.length - 1)];

export const getEyeType = (eyeType) => {
  return eyeType.name === RANDOM_EYE.name ? getRandomEye() : eyeType;
};
