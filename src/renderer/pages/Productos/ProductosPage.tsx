import React, { useState } from 'react';
import { useProductos } from '../../hooks/useProductos';

export function ProductosPage() {
  const { productos, loading, createProducto, deleteProducto } = useProductos();
  const [showForm, setShowForm] = useState(false);

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este producto?')) {
      await deleteProducto(id);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Productos</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Nuevo Producto
        </button>
      </div>

      <div className="bg-white shadow rounded">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Código</th>
              <th className="px-4 py-3 text-left">Descripción</th>
              <th className="px-4 py-3 text-left">Precio</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Proveedor</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(producto => (
              <tr key={producto.id} className="border-t">
                <td className="px-4 py-3">{producto.codigo}</td>
                <td className="px-4 py-3">{producto.descripcion || '-'}</td>
                <td className="px-4 py-3">${producto.precio}</td>
                <td className="px-4 py-3">
                  <span className={producto.stock <= 10 ? 'text-red-600 font-bold' : ''}>
                    {producto.stock}
                  </span>
                </td>
                <td className="px-4 py-3">{producto.proveedor?.nombre || '-'}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(producto.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}