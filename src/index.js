// Test import of styles
import "@/styles/index.scss";
import { initMouseListener } from "./js/application";

// Test a background image url in CSS
const container = document.createElement("div");
container.innerHTML = `
    <div class="container">
      <img src="/assets/dave.jpeg" />
      <img src="/assets/dave.jpeg" />
      <img src="/assets/dave.jpeg" />
      <img src="/assets/dave.jpeg" />
    </div>
`;

const app = document.querySelector("#root");
app.append(container);

initMouseListener(app);
