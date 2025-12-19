// App.tsx
import React from 'react';
import { Routes, Route, HashRouter } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import { ProductosPage } from './pages/Productos/ProductosPage';
import { ProveedorPage } from './pages/Proveedores/ProveedorPage';

function App() {
  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden"> {/* Agrega overflow-hidden */}
        <Sidebar />
        <main className="flex-1 overflow-auto"> {/* Cambia p-6 por overflow-auto */}
          <Routes>
            <Route path="/productos" element={<ProductosPage />} />
            <Route path="/proveedores" element={<ProveedorPage />} />
            {/* Agrega una ruta por defecto */}
            <Route path="/" element={
              <div className="p-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="mt-4 text-gray-600">Selecciona una opción del menú</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;