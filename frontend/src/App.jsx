import React from "react";
import Home from "./pages/Home";
import Carrinho from "./components/Carrinho";

function App() {
  return (
    <div className="font-sans">
      {/* <div className="bg-red-500 text-white p-10">
        <h1>Se vir vermelho, Tailwind está funcionando!</h1>
      </div> */}
      <Home />
      <Carrinho />
    </div>
  );
}

export default App;
