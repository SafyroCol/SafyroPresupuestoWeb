import { useState } from "react";
import { useDropzone } from "react-dropzone";
import toast, { Toaster } from "react-hot-toast";
import api from "@/utils/api";

export default function EvidenciaUploader({ itemId, onUploaded }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const onDrop = (acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  };

  const removeFile = (name) => {
    setFiles(files.filter(f => f.name !== name));
  };

  const handleUpload = async () => {
    if (!files.length) return toast.error("No hay archivos para subir");
    setLoading(true);
    const formData = new FormData();
    formData.append("item_id", itemId); // Asocia al ítem/rubro/proyecto
    files.forEach(file => formData.append("files", file));

    try {
      const res = await api.post("/api/evidencia/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.ok) {
        toast.success("¡Evidencias subidas!");
        setFiles([]);
        onUploaded && onUploaded(res.data.urls); // O lo que devuelva tu backend
      } else {
        toast.error(res.data.message || "Error al subir archivos");
      }
    } catch (err) {
      toast.error("Error al subir archivos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded-xl bg-gray-50 mb-2">
      <Toaster />
      <div {...useDropzone({ onDrop, accept: { 'image/*': [], 'application/pdf': [] }, multiple: true })}>
        <div className="p-4 text-center border-2 border-dashed rounded-lg cursor-pointer bg-white hover:bg-blue-100">
          <span>Arrastra o haz click para subir fotos o PDFs</span>
        </div>
      </div>
      {/* Previsualización */}
      <div className="flex flex-wrap mt-2 gap-2">
        {files.map(file => (
          <div key={file.name} className="relative border rounded p-2 bg-white">
            {file.type.startsWith("image") ? (
              <img src={URL.createObjectURL(file)} alt={file.name} className="h-20 object-contain" />
            ) : file.type === "application/pdf" ? (
              <span className="block w-20 h-20 flex items-center justify-center bg-gray-200 text-xs">PDF</span>
            ) : (
              <span className="block w-20 h-20 flex items-center justify-center bg-gray-200 text-xs">Archivo</span>
            )}
            <button
              onClick={() => removeFile(file.name)}
              className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded px-1"
              title="Quitar archivo"
              type="button"
            >×</button>
            <div className="text-xs mt-1 text-center truncate w-20">{file.name}</div>
          </div>
        ))}
      </div>
      <button
        onClick={handleUpload}
        disabled={loading || files.length === 0}
        className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl w-full transition disabled:opacity-60"
        type="button"
      >
        {loading ? "Subiendo..." : "Subir Evidencias"}
      </button>
    </div>
  );
}