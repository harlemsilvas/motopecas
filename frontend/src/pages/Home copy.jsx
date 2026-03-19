import React, { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Destaques from "../components/Destaques";
import Categorias from "../components/Categorias";
import Footer from "../components/Footer";

const Home = () => {
  const [destaques, setDestaques] = useState([]);

  useEffect(() => {
    // fetch('http://localhost:5000/api/produtos?destaque=true')
    fetch("/api/produtos?destaque=true")
      .then((res) => res.json())
      .then((data) => setDestaques(data))
      .catch((err) => console.error("Erro ao carregar destaques:", err));
  }, []);

  return (
    <div>
      <Hero />
      <Destaques produtos={destaques} />
      <Categorias />
      <Footer />
    </div>
  );
};

export default Home;
