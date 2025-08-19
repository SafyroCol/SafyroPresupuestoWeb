// src/utils/url.ts
export const API_BASE = 
  (import.meta as any).env.VITE_API_URL;

export function buildMediaUrl(raw?: string): string {
  if (!raw) return "#";

  // Normaliza posibles backslashes (Windows) → /
  const path = String(raw).replace(/\\/g, "/").trim();

  // Si ya es absoluta (http(s), data, blob), devuélvela tal cual
  if (/^(https?:|data:|blob:)/i.test(path)) return path;

  // Une base + path cuidando las barras
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${withLeadingSlash}`;
}
