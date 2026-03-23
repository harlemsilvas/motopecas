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
  // Agora o path é relativo ao basename definido abaixo
  return token ? children : <Navigate to="/admin/login" replace />;
}

function App() {
  return (
    // 1. Defina o basename aqui. Isso remove a necessidade de repetir "/motopecas" nos paths
    <BrowserRouter basename="/motopecas">
      <Routes>
        <Route
          path="/" // Isso agora representa http://.../motopecas/
          element={
            <>
              <Home />
              <Carrinho />
            </>
          }
        />
        <Route
          path="/admin/login" // Isso agora representa http://.../motopecas/admin/login
          element={
            <AdminLogin
              onLogin={() => (window.location.href = "/motopecas/admin")}
            />
          }
        />
        <Route
          path="/admin" // Isso representa http://.../motopecas/admin
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

return App;
