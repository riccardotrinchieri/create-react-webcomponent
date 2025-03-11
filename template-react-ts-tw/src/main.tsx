import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { Style } from "./Style.tsx";
import App from "./App.tsx";

function onConnectedCallback(htmlElement: HTMLElement) {
  const shadowRoot = htmlElement.attachShadow({ mode: "open" });
  const mountPoint = document.createElement("div");
  mountPoint.id = "{{package_name}}_{{id}}";

  shadowRoot.appendChild(mountPoint);

  createRoot(mountPoint).render(
    <StrictMode>
      <Style />
      <App />
    </StrictMode>
  );
}

class WebComponent extends HTMLElement {
  connectedCallback() {
    onConnectedCallback(this);
  }
}

customElements.define("{{package_name}}", WebComponent);
