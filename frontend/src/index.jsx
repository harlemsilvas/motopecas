// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { CarrinhoProvider } from "./context/CarrinhoContext";
import App from "./App";

import "./index.css"; // Import Tailwind CSS styles

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <CarrinhoProvider>
      <App />
    </CarrinhoProvider>
  </React.StrictMode>
);
