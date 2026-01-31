// @ts-nocheck
// pages/CompraPage.tsx
import React, { useState } from 'react';
import { CompraModal } from './PurchaseModal';
import { usePurchases } from '../../hooks/usePurchases';
import { PurchaseComplete } from '../../../shared/types/api.types';

export function PurchasePage() {
  const { purchases, loading, createPurchase, updatePurchase, deletePurchase, refresh } = usePurchases();
  const [showModal, setShowModal] = useState(false);
  const [editingCompra, setEditingCompra] = useState<PurchaseComplete | null>(null);

  const handleCreate = async (data: any) => {
    await createPurchase(data);
    await refresh();
  };

  const handleUpdate = async (data: any) => {
    if (editingCompra) {
      await updatePurchase(editingCompra.id, data);
      await refresh();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta compra?')) {
      await deletePurchase(id);
      await refresh();
    }
  };

  const handleEdit = (compra: PurchaseComplete) => {
    setEditingCompra(compra as PurchaseComplete);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCompra(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-gray-500">Cargando compras...</div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Compras</h1>
          <p className="text-gray-600">Gestión de compras</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
        >
          <span>+</span>
          <span>Nueva Compra</span>
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
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {purchases.map(compra => (
                <tr key={compra.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{compra.total}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">
                      fecha: {compra.date.toString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600">
                      {compra.supplier?.name || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(compra)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(compra.id)}
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

        {purchases.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay compras registradas
          </div>
        )}
      </div>

      {/* Modal */}
      <CompraModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={editingCompra ? handleUpdate : handleCreate}
        initialData={editingCompra}
      />
    </div>
  );
}