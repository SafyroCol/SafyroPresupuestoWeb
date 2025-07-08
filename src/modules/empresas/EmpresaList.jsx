import { useEffect, useState } from 'react';
import { getEmpresas, deleteEmpresa } from './empresaService';
import { Link } from 'react-router-dom';

export default function EmpresaList() {
  const [empresas, setEmpresas] = useState([]);

  useEffect(() => {
    getEmpresas().then(res => setEmpresas(res.data));
  }, []);

  const handleDelete = async (id) => {
    await deleteEmpresa(id);
    setEmpresas(empresas.filter(e => e.id !== id));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Empresas</h2>
      <Link to="/empresas/nueva" className="bg-blue-600 text-white px-4 py-2 rounded mb-4 inline-block">Nueva Empresa</Link>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Nombre</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empresas.map(empresa => (
            <tr key={empresa.id}>
              <td className="border p-2">{empresa.nombre}</td>
              <td className="border p-2">
                <Link to={`/empresas/${empresa.id}`} className="text-blue-500 mr-2">Editar</Link>
                <button onClick={() => handleDelete(empresa.id)} className="text-red-500">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
