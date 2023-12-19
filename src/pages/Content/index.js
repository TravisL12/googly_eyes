import GooglyEyes from './modules/application';
import { loadDeps } from './modules/helper';

console.log('This is the ApplicationJS');

const EYE_MOVE_EVENTS = ['mousemove', 'wheel'];
let resizeTimeout;

chrome.runtime.sendMessage(
  {
    type: 'loadFaceModels',
  },
  (response) => {
    loadDeps(response);
    const eyes = new GooglyEyes();
    eyes.addImages();

    const callback = (mutationList) => {
      for (const listItem of mutationList) {
        const images = Array.from(listItem.addedNodes).filter(
          (node) => node.nodeName === 'IMG'
        );
        if (images && images.length > 0) {
          eyes.addImages(images);
        }
      }
    };

    const observer = new MutationObserver(callback);
    observer.observe(document.body, { subtree: true, childList: true });

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        eyes.removePreviousFaceElements();
        eyes.addImages();
      }, 150);
    });

    EYE_MOVE_EVENTS.forEach((item) => {
      window.addEventListener(item, (event) => {
        eyes.throttledEyes.forEach((throttleEye) => {
          throttleEye(event);
        });
      });
    });
  }
);
