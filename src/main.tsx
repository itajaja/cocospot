import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={process.env.NODE_ENV === "production" ? "/cocospot" : ""}>
      <App />
    </BrowserRouter>
  </StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const base = process.env.NODE_ENV === "production" ? "/cocospot/" : "/";
    navigator.serviceWorker.register(`${base}sw.js`);
  });
}
