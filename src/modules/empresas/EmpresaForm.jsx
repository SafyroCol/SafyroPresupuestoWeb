import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createEmpresa, updateEmpresa, getEmpresas } from './empresaService';

export default function EmpresaForm() {
  const [nombre, setNombre] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      getEmpresas().then(res => {
        const empresa = res.data.find(e => e.id == id);
        if (empresa) setNombre(empresa.nombre);
      });
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (id) {
      await updateEmpresa(id, { id, nombre });
    } else {
      await createEmpresa({ nombre });
    }
    navigate('/empresas');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{id ? 'Editar' : 'Nueva'} Empresa</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la empresa"
          className="border px-4 py-2 mb-4 w-full"
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">
          Guardar
        </button>
      </form>
    </div>
  );
}
