// Test import of styles
import "@/styles/index.scss";
import { initMouseListener } from "./js/application";

// Test a background image url in CSS
const container = document.createElement("div");
container.className = "container";
container.innerHTML = `
      <img src="/assets/dave.jpeg" />
      <img src="/assets/dave.jpeg" />
      <img src="/assets/dave.jpeg" />
      <img src="/assets/dave.jpeg" />
`;

const app = document.querySelector("#root");
app.append(container);

initMouseListener(container);
