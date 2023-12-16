import GooglyEyes from './modules/application';

(function () {
  const eyes = new GooglyEyes();
  eyes.init();

  window.addEventListener('resize', () => {
    eyes.removePreviousFaceElements();
    eyes.init();
  });
})();
