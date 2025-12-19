// components/Layout/Sidebar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Mi ERP</h1>
      </div>
      
      {/* Menú */}
      <nav className="flex-1 p-4 space-y-2">
        <Link 
          to="/" 
          className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <span className="mr-3">🏠</span>
          <span>Dashboard</span>
        </Link>
        
        <Link 
          to="/productos" 
          className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <span className="mr-3">📦</span>
          <span>Productos</span>
        </Link>

        <Link 
          to="/proveedores" 
          className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <span className="mr-3">📦</span>
          <span>Proveedores</span>
        </Link>
        
        {/* Agrega más items aquí */}
      </nav>
      
      {/* Footer del sidebar */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-sm">A</span>
          </div>
          <div className="ml-3">
            <p className="text-sm">Administrador</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;