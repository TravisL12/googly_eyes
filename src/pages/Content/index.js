import GooglyEyes from './modules/application';
import { loadDeps } from './modules/helper';

console.log('This is the ApplicationJS');
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
  }
);
