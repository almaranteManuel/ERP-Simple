// pages/VentaPage.tsx
import React, { useState } from 'react';
import { Venta } from '../../types/index';
import { useVentas } from '../../hooks/useVentas';
import { VentaModal } from './VentaModal';

export function VentaPage() {
  const { ventas, loading, createVenta, updateVenta, deleteVenta, refresh } = useVentas();
  const [showModal, setShowModal] = useState(false);
  const [editingVenta, setEditingVenta] = useState<Venta | null>(null);

  const handleCreate = async (data: any) => {
    await createVenta(data);
    await refresh();
  };

  const handleUpdate = async (data: any) => {
    if (editingVenta) {
      await updateVenta(editingVenta.id, data);
      await refresh();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta venta?')) {
      await deleteVenta(id);
      await refresh();
    }
  };

  const handleEdit = (venta: Venta) => {
    setEditingVenta(venta as Venta);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVenta(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-gray-500">Cargando ventas...</div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ventas</h1>
          <p className="text-gray-600">Gestión de ventas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
        >
          <span>+</span>
          <span>Nueva Venta</span>
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ventas.map(venta => (
                <tr key={venta.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{venta.total}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">
                      fecha: {venta.fecha.toString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600">
                      {venta.producto?.descripcion || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(venta)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(venta.id)}
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

        {ventas.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay ventas registradas
          </div>
        )}
      </div>

      {/* Modal */}
      <VentaModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={editingVenta ? handleUpdate : handleCreate}
        initialData={editingVenta}
      />
    </div>
  );
}