// Test import of styles
import "@/styles/index.scss";
import { initMouseListener } from "./js/application";

const container = document.querySelector(".container");
initMouseListener(container);
