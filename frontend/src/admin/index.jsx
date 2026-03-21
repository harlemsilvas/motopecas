import React from "react";
import { Outlet, NavLink } from "react-router-dom";

const menuItems = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/categorias", label: "Categorias" },
  { to: "/admin/produtos", label: "Produtos" },
  { to: "/admin/item-do-dia", label: "Item do Dia" },
  { to: "/admin/configuracoes", label: "Configurações" },
  { to: "/admin/usuarios", label: "Usuários" },
];

function handleLogout() {
  localStorage.removeItem("admin_token");
  window.location.href = "/admin/login";
}
export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col min-h-screen fixed left-0 top-0 z-40">
        <div className="p-5 border-b border-slate-700">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <svg
              className="w-6 h-6 text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            MotoPeças
          </h1>
        </div>
        <nav className="flex-1 p-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-4 py-2 rounded menu-item transition font-medium ${isActive ? "bg-white/10 border-l-4 border-yellow-400" : "hover:bg-white/5"}`
              }
              end={item.to === "/admin"}
            >
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 mt-4 rounded bg-red-600 hover:bg-red-700 transition font-medium text-white"
          >
            Sair
          </button>
        </nav>
      </aside>
      {/* Conteúdo */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
