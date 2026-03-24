// src/utils/imageUtils.js

/**
 * Gera a URL correta da imagem com base no ambiente
 * @param {string} path - Caminho da imagem (ex: "/uploads/foto.jpg")
 * @returns {string} URL completa ou relativa
 */
// SVG placeholder inline — evita requisições repetidas ao servidor
const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23333333'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23a0a0a0' font-family='sans-serif' font-size='16'%3ESem imagem%3C/text%3E%3C/svg%3E";

export function getImageUrl(path) {
  if (!path) return PLACEHOLDER;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // Se já é um path absoluto do subpath, retorna direto
  if (path.startsWith("/motopecas/")) return path;
  // Remove barras iniciais e prefixo 'uploads/' duplicado
  const cleanPath = path.replace(/^\/+/, "").replace(/^uploads\//, "");
  const baseUrl = import.meta.env.VITE_UPLOADS_URL || "/uploads";
  return `${baseUrl}/${cleanPath}`;
}

// export function getImageUrl(path) {
//   if (!path) return PLACEHOLDER;

//   // Se já for uma URL completa (com http/https), retorna como está
//   if (path.startsWith("http://") || path.startsWith("https://")) {
//     return path;
//   }

//   // Remove barra inicial se já tiver (evita "//")
//   const cleanPath = path.startsWith("/") ? path : `/${path}`;

//   // Usa VITE_API_URL se definido, senão usa caminho relativo
//   const baseUrl = import.meta.env.VITE_API_URL || "";

//   return `${baseUrl}${cleanPath}`;
