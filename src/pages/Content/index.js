import GooglyEyes from './modules/application';
import { IMG_ID_ATTR } from './modules/constants';
import { loadDeps, shuffle } from './modules/helper';

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
          shuffle(entries).forEach((entry) => {
            const { isIntersecting, target } = entry;
            if (isIntersecting && !target.hasAttribute(IMG_ID_ATTR)) {
              eyes.drawEyes(target);
            } else {
              eyes.undraw(target);
            }
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

      const eyes = new GooglyEyes(intersectObserver);
      eyes.initialLoad();

      window.addEventListener('resize', () => {
        eyes.removePreviousFaceElements();
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          eyes.initialLoad();
        }, 150);
      });

      EYE_MOVE_EVENTS.forEach((item) => {
        window.addEventListener(item, (event) => {
          eyes.throttledEyes.forEach(({ throttleCb }) => {
            throttleCb(event);
          });
        });
      });
    }
  );
};

startEyes();
