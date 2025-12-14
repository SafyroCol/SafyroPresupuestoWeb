// SubirEvidenciaItem.jsx
import { useState } from "react";
import toast from "react-hot-toast";

export default function SubirEvidenciaItem({ onUpload }) {
  const [file, setFile] = useState(null);
  const [valorSoportado, setValorSoportado] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !valorSoportado) {
      toast.error("Selecciona un archivo y coloca el valor");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("archivo", file);
      formData.append("valorSoportado", valorSoportado);
      await onUpload(formData);
      setFile(null);
      setValorSoportado("");
      toast.success("Evidencia cargada");
    } catch {
      toast.error("Error al subir evidencia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex items-center gap-2 mt-4" onSubmit={handleSubmit}>
      <input type="file" accept="application/pdf,image/*" onChange={handleFile} className="text-gray-800 dark:text-gray-200" />
      <input
        type="number"
        min={0}
        className="border border-gray-300 dark:border-gray-600 px-2 py-1 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
        placeholder="Valor soportado"
        value={valorSoportado}
        onChange={(e) => setValorSoportado(e.target.value)}
      />
      <button
        type="submit"
        disabled={loading}
        className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white text-xs transition disabled:opacity-50"
      >
        {loading ? "Cargando..." : "Subir"}
      </button>
    </form>
  );
}

