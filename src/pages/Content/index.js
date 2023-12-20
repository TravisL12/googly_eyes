import GooglyEyes from './modules/application';
import { IS_GOOGLY_ATTR } from './modules/constants';
import { loadDeps } from './modules/helper';

const EYE_MOVE_EVENTS = ['mousemove', 'wheel'];
let resizeTimeout;

const startEyes = () => {
  chrome.runtime.sendMessage(
    {
      type: 'loadFaceModels',
    },
    (response) => {
      loadDeps(response);
      const eyes = new GooglyEyes();

      const intersectObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const { isIntersecting, target } = entry;
            if (isIntersecting && !target.hasAttribute(IS_GOOGLY_ATTR)) {
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
              accum = accum.concat(Array.from(imgs));
              return accum;
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

      eyes.initialLoad(intersectObserver);

      window.addEventListener('resize', () => {
        eyes.removePreviousFaceElements();
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          eyes.initialLoad(intersectObserver);
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
