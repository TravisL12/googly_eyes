import GooglyEyes from './modules/application';
import { loadDeps } from './modules/helper';

console.log('This is the ApplicationJS');

const EYE_MOVE_EVENTS = ['mousemove', 'wheel'];

chrome.runtime.sendMessage(
  {
    type: 'image',
  },
  (response) => {
    loadDeps(response);
    const eyes = new GooglyEyes();
    eyes.init();

    window.addEventListener('resize', () => {
      eyes.removePreviousFaceElements();
      eyes.init();
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
