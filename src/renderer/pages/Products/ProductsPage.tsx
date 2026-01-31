// @ts-nocheck
// pages/ProductsPage.tsx
import React, { useState } from 'react';
import { ProductModal } from './ProductModal';
import { useProducts } from '../../hooks/useProducts';
import { ProductComplete } from '../../../shared/types/api.types';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/solid';

export function ProductsPage() {
  const { products, loading, createProduct, updateProduct, deleteProduct, refresh } = useProducts();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductComplete | null>(null);

  const handleCreate = async (data: any) => {
    await createProduct(data);
    await refresh();
  };

  const handleUpdate = async (data: any) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, data);
      await refresh();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      await deleteProduct(id);
      await refresh();
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product as ProductComplete);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
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
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Productos</div>
          <div className="text-2xl font-bold text-gray-800">{products.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Stock Bajo</div>
          <div className="text-2xl font-bold text-red-600">
            {products.filter(p => p.stock <= (p.stockMin || 10)).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Productos Activos</div>
          <div className="text-2xl font-bold text-green-600">
            {products.filter(p => p.is_active).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Valor Total Inventario</div>
          <div className="text-2xl font-bold text-blue-600">
            Aca va el total {/* ${products.reduce((sum, p) => sum + (p.price * p.stock), 0)} */}
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
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{product.code || '-'}</span>
                      {product.codeBar && (
                        <span className="text-xs text-gray-500">{product.codeBar}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.description}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">Sin imagen</span>
                        </div>
                      )}
                      <div>
                        {product.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">
                      Aca precio{/* ${product.price.toFixed(2)} */}
                    </span>
                    {product.variant && product.variant > 0 && (
                      <div className="text-xs text-gray-500">Var: {product.variant}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.stock <= (product.stockMin || 5)
                          ? 'bg-red-100 text-red-800' 
                          : product.stock <= (product.stockMin || 5) * 2
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {product.stock}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        Mín: {product.stockMin || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600">
                      {product.category || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600">
                      {product.supplier?.name || 'Sin proveedor'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-900 transition duration-200 flex items-center"
                        title="Editar producto"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
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

        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza agregando un nuevo producto.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <ProductModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={editingProduct ? handleUpdate : handleCreate}
        initialData={editingProduct}
      />
    </div>
  );
}