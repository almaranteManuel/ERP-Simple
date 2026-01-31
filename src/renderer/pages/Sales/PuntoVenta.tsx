// @ts-nocheck
// src/renderer/pages/Ventas/PuntoVenta.tsx (modificado)
import React, { useState, useCallback } from 'react';
import { BarcodeInput } from '../../components/BarcodeInput';
import { ProductWithSupplier } from '../../../shared/types/api.types';
import { Notification, NotificationType } from '../../components/Notification';

interface VentaItemUI {
  productId: number;
  product: ProductWithSupplier;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

type NotificationData = {
  message: string;
  type: NotificationType;
  id: number;
};

export const PuntoVenta: React.FC = () => {
  const [items, setItems] = useState<VentaItemUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [lastSearchError, setLastSearchError] = useState<string | null>(null);

  // Función para agregar notificaciones temporales
  const addNotification = useCallback((message: string, type: NotificationType = 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { message, type, id }]);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  // Función mejorada para búsqueda con cache
  const findOneByBarcode = useCallback(async (searchTerm: string) => {
    setLastSearchError(null);
    
    try {
      const product = await window.api.product.search(searchTerm);
      
      if (!product) {
        setLastSearchError('Product no encontrado');
        addNotification('Product no encontrado', 'error');
        return null;
      }

      // if (!product.is_active) {
      //   setLastSearchError('Product inactivo');
      //   addNotification('Product inactivo', 'warning');
      //   return null;
      // }

      // if (product.stock <= 0) {
      //   setLastSearchError('Sin stock disponible');
      //   addNotification('Product sin stock disponible', 'warning');
      //   return null;
      // }

      return product;
    } catch (error) {
      console.error('Error al buscar product:', error);
      setLastSearchError('Error en la búsqueda');
      addNotification('Error al buscar product', 'error');
      return null;
    }
  }, [addNotification]);

  const calcularTotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleBarcodeScanned = useCallback(async (barcode: string) => {
    const product = await findOneByBarcode(barcode);
    if (product) {
      agregarItem(product);
    }
  }, [findOneByBarcode]);

  const agregarItem = (product: ProductWithSupplier) => {
    setItems(prevItems => {
      const itemExistente = prevItems.find(i => i.productId === product.id);
      
      if (itemExistente) {
        if (itemExistente.cantidad >= product.stock) {
          addNotification(`Stock máximo alcanzado: ${product.stock} unidades`, 'warning');
          return prevItems;
        }

        // Feedback visual para product ya existente
        addNotification(`${product.description} cantidad aumentada`, 'success');
        
        return prevItems.map(i => 
          i.productId === product.id
            ? { 
                ...i, 
                cantidad: i.cantidad + 1,
                subtotal: (i.cantidad + 1) * i.precioUnitario
              }
            : i
        );
      } else {
        // Feedback visual para nuevo product
        addNotification(`${product.description} agregado a la venta`, 'success');
        
        return [
          ...prevItems,
          {
            productId: product.id,
            product,
            cantidad: 1,
            precioUnitario: product.price,
            subtotal: product.price
          }
        ];
      }
    });
    setLastSearchError(null);
  };

  const modificarCantidad = (productId: number, nuevaCantidad: number) => {
    const item = items.find(i => i.productId === productId);
    
    if (!item) return;

    if (nuevaCantidad <= 0) {
      eliminarItem(productId);
      return;
    }

    if (nuevaCantidad > item.product.stock) {
      addNotification(`Stock máximo disponible: ${item.product.stock} unidades`, 'warning');
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId
          ? {
              ...item,
              cantidad: nuevaCantidad,
              subtotal: nuevaCantidad * item.precioUnitario
            }
          : item
      )
    );
  };

  const eliminarItem = (productId: number) => {
    const item = items.find(i => i.productId === productId);
    if (item) {
      addNotification(`${item.product.description} eliminado de la venta`, 'info');
    }
    setItems(prevItems => prevItems.filter(i => i.productId !== productId));
  };

  const finalizarVenta = async () => {
    if (items.length === 0) {
      addNotification('Agregue products a la venta', 'warning');
      return;
    }

    setLoading(true);
    try {
      const venta = await window.api.sale.create({
        items: items.map(item => ({
          productId: item.productId,
          qty: item.cantidad,
          priceUnitary: item.precioUnitario,
          subtotal: item.subtotal,
          discount: 0
        })),
        date: new Date(),
        total: calcularTotal(),
        subtotal: calcularTotal(),
        discount: 0,
        payMethod: 'efectivo'
      });

      addNotification(`Venta #${venta.codeSale} registrada exitosamente`, 'success');
      setItems([]);
    } catch (error) {
      console.error('Error al registrar venta:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar la venta';
      addNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const cancelarVenta = () => {
    if (items.length > 0) {
      // Reemplazar confirm por diálogo personalizado
      if (window.confirm('¿Está seguro de cancelar la venta?')) {
        addNotification('Venta cancelada', 'info');
        setItems([]);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 p-4 gap-4">
      {/* Notificaciones flotantes */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
          />
        ))}
      </div>

      {/* Header con feedback de búsqueda */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Punto de Venta</h2>
        <div className="flex flex-col items-end gap-2">
          <BarcodeInput 
            onBarcodeScanned={handleBarcodeScanned}
          />
          {lastSearchError && (
            <span className="text-sm text-red-600 animate-pulse">
              {lastSearchError}
            </span>
          )}
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="mt-4 text-lg text-gray-600">
                Escanee o busque products para comenzar la venta
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map(item => (
                  <tr key={item.productId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {item.product.code}
                        </span>
                        {item.product.description && (
                          <span className="text-xs text-gray-500">
                            {item.product.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {item.product.codeBar || item.product.code || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${item.precioUnitario.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <input
                          type="number"
                          value={item.cantidad}
                          onChange={e => 
                            modificarCantidad(item.productId, parseInt(e.target.value) || 0)
                          }
                          min="1"
                          max={item.product.stock}
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-xs text-gray-500">
                          Stock: {item.product.stock}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${item.subtotal.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => eliminarItem(item.productId)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-md transition-colors"
                        title="Eliminar product"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Total Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Items:</span>
            <span className="font-medium">{items.length}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Unidades:</span>
            <span className="font-medium">
              {items.reduce((sum, item) => sum + item.cantidad, 0)}
            </span>
          </div>
          <div className="flex justify-between text-2xl font-bold text-gray-900 pt-3 border-t-2 border-gray-200">
            <span>Total:</span>
            <span className="text-blue-600">
              ${calcularTotal().toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={cancelarVenta}
            disabled={loading || items.length === 0}
            className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={finalizarVenta}
            disabled={loading || items.length === 0}
            className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Procesando...
              </span>
            ) : (
              'Finalizar Venta'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
