// Test import of styles
import "@/styles/index.scss";
import GooglyEyes from "./js/application";

(function () {
  const eyes = new GooglyEyes();
  eyes.init();

  window.addEventListener("resize", () => {
    eyes.removePreviousFaceElements();
    eyes.init();
  });
})();
