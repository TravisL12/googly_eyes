import EyesController from './modules/application';
import {
  EYE_TYPE_IDX,
  HAS_EYELIDS,
  IS_GOOGLY_ON,
  PICTURE_LIMIT,
  PICTURE_LIMIT_SETTING,
} from './modules/constants';
import {
  getEyeType,
  getEyeTypeFromIdx,
  loadDeps,
  shuffle,
} from './modules/helper';
import { getStorage } from './modules/storageHelper';

const EYE_MOVE_EVENTS = ['mousemove', 'wheel'];
let resizeTimeout;

const startEyes = () => {
  chrome.runtime.sendMessage(
    {
      type: 'loadFaceModels',
    },
    (response) => {
      loadDeps(response);

      const intersectObserver = new IntersectionObserver(
        (entries) => {
          const inter = entries.filter((e) => e.isIntersecting);
          shuffle(inter).forEach((entry) => {
            eyesControl.drawEyes(entry.target);
          });

          const notInter = entries.filter((e) => !e.isIntersecting);
          notInter.forEach((entry) => {
            eyesControl.undraw(entry.target);
          });
        },
        { threshold: 0.2 }
      );

      const mutationObserver = new MutationObserver((mutationList) => {
        mutationList.forEach((listItem) => {
          const imageMap = Array.from(listItem.addedNodes).reduce(
            (accum, node) => {
              if (!node?.querySelectorAll) {
                return accum;
              }
              const imgs = node.querySelectorAll('img');
              return accum.concat(Array.from(imgs));
            },
            []
          );

          imageMap.flat().forEach((image) => {
            intersectObserver.observe(image);
          });
        });
      });
      mutationObserver.observe(document.body, {
        subtree: true,
        childList: true,
      });

      const eyesControl = new EyesController(intersectObserver);
      getStorage((options) => {
        eyesControl.initialLoad(options);
      });

      chrome.storage.onChanged.addListener((changes) => {
        if (changes[IS_GOOGLY_ON]) {
          eyesControl[IS_GOOGLY_ON] = changes[IS_GOOGLY_ON].newValue;
          eyesControl.toggleEnabled();
        }

        if (changes[PICTURE_LIMIT_SETTING]) {
          eyesControl[PICTURE_LIMIT] = changes[PICTURE_LIMIT_SETTING].newValue;
        }

        if (changes[HAS_EYELIDS]) {
          const isOn = changes[HAS_EYELIDS].newValue;
          eyesControl[HAS_EYELIDS] = isOn;
          eyesControl.faces.forEach(({ face }) => {
            const [leftEye, rightEye] = face.eyes;
            leftEye.toggleEyeLids(isOn);
            rightEye.toggleEyeLids(isOn);
          });
        }

        if (changes[EYE_TYPE_IDX]) {
          const eyeType = getEyeTypeFromIdx(changes[EYE_TYPE_IDX].newValue);
          eyesControl.eyeType = eyeType;
          eyesControl.faces.forEach(({ face }) => {
            const [leftEye, rightEye] = face.eyes;
            const type = getEyeType(eyeType);
            leftEye.changeEyeType(type);
            rightEye.changeEyeType(type);
          });
        }
      });

      window.addEventListener('resize', () => {
        eyesControl.removePreviousFaceElements();
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          eyesControl.initialLoad();
        }, 150);
      });

      EYE_MOVE_EVENTS.forEach((item) => {
        window.addEventListener(item, (event) => {
          eyesControl.faces.forEach(({ throttleCb }) => {
            throttleCb(event);
          });
        });
      });
    }
  );
};

startEyes();
