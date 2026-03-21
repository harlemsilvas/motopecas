import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Carrinho from "./components/Carrinho";
import AdminLogin from "./pages/AdminLogin";
import AdminHome from "./pages/AdminHome";
import AdminUsuarios from "./pages/AdminUsuarios";
import Categorias from "./admin/Categorias";
import Produtos from "./admin/Produtos";
import Configuracoes from "./admin/Configuracoes";
import ItemDoDia from "./admin/ItemDoDia";
import AdminLayout from "./admin/index";

function RequireAuth({ children }) {
  const token = localStorage.getItem("admin_token");
  return token ? children : <Navigate to="/admin/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Home />
              <Carrinho />
            </>
          }
        />
        <Route
          path="/admin/login"
          element={
            <AdminLogin onLogin={() => (window.location.href = "/admin")} />
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="item-do-dia" element={<ItemDoDia />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
