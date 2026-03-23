import React from "react";
import { Link } from "react-router-dom";

export default function AdminHome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-80 flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Painel Admin</h2>
        <Link
          className="bg-blue-600 text-white py-2 rounded text-center"
          to="/motopecas/admin/usuarios"
        >
          Gerenciar Usuários
        </Link>
        {/* Adicione outros links do admin aqui */}
      </div>
    </div>
  );
}
