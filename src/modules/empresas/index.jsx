import { Route, Routes } from 'react-router-dom';
import EmpresaList from './EmpresaList';
import EmpresaForm from './EmpresaForm';

export default function EmpresaRoutes() {
    return (
        <Routes>
            <Route path="/" element={<EmpresaList />} />
            <Route path="/nueva" element={<EmpresaForm />} />
            <Route path="/:id" element={<EmpresaForm />} />
        </Routes>
    );
}
