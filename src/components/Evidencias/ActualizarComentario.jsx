// Ejemplo usando fetch, pero puedes usar axios/api.js
const actualizarComentario = async (evidenciaId, comentario) => {
  const res = await fetch('/api/evidencia/comentario', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ evidenciaId, comentario })
  });
  const data = await res.json();
  return data.ok ? data.comentario : null;
};
