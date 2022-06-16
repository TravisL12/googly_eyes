// Test import of styles
import "@/styles/index.scss";
import { initMouseListener } from "./js/application";

const heading = document.createElement("h1");
heading.textContent = "Googly Eyes";

// Test a background image url in CSS
const container = document.createElement("div");
container.innerHTML = `
    <div class="container">
      <div class="face">
        <div class="eyes">
          <div class="eye">
            <div class="inner"></div>
          </div>
          <div class="eye">
            <div class="inner"></div>
          </div>
        </div>
      </div>
    </div>
`;

const app = document.querySelector("#root");
app.append(heading, container);

initMouseListener();
