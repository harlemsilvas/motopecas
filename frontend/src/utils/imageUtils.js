// src/utils/imageUtils.js

/**
 * Gera a URL correta da imagem com base no ambiente
 * @param {string} path - Caminho da imagem (ex: "/uploads/foto.jpg")
 * @returns {string} URL completa ou relativa
 */
export function getImageUrl(path) {
  if (!path) return "/uploads/placeholder.jpg";

  // Se já for uma URL completa (com http/https), retorna como está
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Remove barra inicial se já tiver (evita "//")
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // Usa VITE_API_URL se definido, senão usa caminho relativo
  const baseUrl = import.meta.env.VITE_API_URL || "";

  return `${baseUrl}${cleanPath}`;
}
