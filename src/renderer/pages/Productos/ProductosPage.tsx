// pages/ProductosPage.tsx
import React, { useState } from 'react';
import { ProductoModal } from '../../pages/Productos/ProductoModal';
import { useProductos } from '../../hooks/useProductos';
import { ProductoCompleto } from '../../types/api.types';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/solid';

export function ProductosPage() {
  const { productos, loading, createProducto, updateProducto, deleteProducto, refresh } = useProductos();
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState<ProductoCompleto | null>(null);

  const handleCreate = async (data: any) => {
    await createProducto(data);
    await refresh();
  };

  const handleUpdate = async (data: any) => {
    if (editingProducto) {
      await updateProducto(editingProducto.id, data);
      await refresh();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      await deleteProducto(id);
      await refresh();
    }
  };

  const handleEdit = (producto: any) => {
    setEditingProducto(producto as ProductoCompleto);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProducto(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-gray-500">Cargando productos...</div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
          <p className="text-gray-600">Gestión de productos del inventario</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Productos</div>
          <div className="text-2xl font-bold text-gray-800">{productos.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Stock Bajo</div>
          <div className="text-2xl font-bold text-red-600">
            {productos.filter(p => p.stock <= (p.stockMinimo || 10)).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Productos Activos</div>
          <div className="text-2xl font-bold text-green-600">
            {productos.filter(p => p.activo).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Valor Total Inventario</div>
          <div className="text-2xl font-bold text-blue-600">
            ${productos.reduce((sum, p) => sum + (p.precio * p.stock), 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {productos.map(producto => (
                <tr key={producto.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{producto.codigo || '-'}</span>
                      {producto.codigoBarras && (
                        <span className="text-xs text-gray-500">{producto.codigoBarras}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {producto.imagen ? (
                        <img 
                          src={producto.imagen} 
                          alt={producto.nombre}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">Sin imagen</span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{producto.nombre}</div>
                        {producto.descripcion && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {producto.descripcion}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">
                      ${producto.precio.toFixed(2)}
                    </span>
                    {producto.variante && producto.variante > 0 && (
                      <div className="text-xs text-gray-500">Var: {producto.variante}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        producto.stock <= (producto.stockMinimo || 5)
                          ? 'bg-red-100 text-red-800' 
                          : producto.stock <= (producto.stockMinimo || 5) * 2
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {producto.stock}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        Mín: {producto.stockMinimo || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      producto.activo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {producto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600">
                      {producto.categoria || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600">
                      {producto.proveedor?.nombre || 'Sin proveedor'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(producto)}
                        className="text-blue-600 hover:text-blue-900 transition duration-200 flex items-center"
                        title="Editar producto"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(producto.id)}
                        className="text-red-600 hover:text-red-900 transition duration-200 flex items-center"
                        title="Eliminar producto"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {productos.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza agregando un nuevo producto.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <ProductoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={editingProducto ? handleUpdate : handleCreate}
        initialData={editingProducto}
      />
    </div>
  );
}