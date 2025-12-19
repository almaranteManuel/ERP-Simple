// pages/ProveedorPage.tsx
import React, { useState } from 'react';
import { Proveedor } from '../../types/index';
import { useProveedores } from '../../hooks/useProveedores';
import { ProveedorModal } from './ProveedorModal';

export function ProveedorPage() {
  const { proveedores, loading, createProveedor, updateProveedor, deleteProveedor, refresh } = useProveedores();
  const [showModal, setShowModal] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);

  const handleCreate = async (data: any) => {
    await createProveedor(data);
    await refresh();
  };

  const handleUpdate = async (data: any) => {
    if (editingProveedor) {
      await updateProveedor(editingProveedor.id, data);
      await refresh();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este proveedor?')) {
      await deleteProveedor(id);
      await refresh();
    }
  };

  const handleEdit = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor as Proveedor);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProveedor(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-gray-500">Cargando proveedores...</div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Proveedores</h1>
          <p className="text-gray-600">Gestión de proveedores</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
        >
          <span>+</span>
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dirección
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {proveedores.map(proveedor => (
                <tr key={proveedor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{proveedor.nombre}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">
                      {proveedor.telefono}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600">
                      {proveedor.direccion || 'Sin direccion'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600">
                      {proveedor.email || 'Sin email'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(proveedor)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(proveedor.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {proveedores.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay proveedores registrados
          </div>
        )}
      </div>

      {/* Modal */}
      <ProveedorModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={editingProveedor ? handleUpdate : handleCreate}
        initialData={editingProveedor}
      />
    </div>
  );
}