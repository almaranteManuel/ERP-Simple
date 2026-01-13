// src/renderer/pages/Ventas/PuntoVenta.tsx (modificado)
import React, { useState, useCallback } from 'react';
import { BarcodeInput } from '../../components/BarcodeInput';
import { ProductoConProveedor } from '../../types/api.types';
import { Notification, NotificationType } from '../../components/Notification';

interface VentaItemUI {
  productoId: number;
  producto: ProductoConProveedor;
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
  const searchProduct = useCallback(async (searchTerm: string) => {
    setLastSearchError(null);
    
    try {
      const producto = await window.api.producto.search(searchTerm);
      
      if (!producto) {
        setLastSearchError('Producto no encontrado');
        addNotification('Producto no encontrado', 'error');
        return null;
      }

      if (!producto.activo) {
        setLastSearchError('Producto inactivo');
        addNotification('Producto inactivo', 'warning');
        return null;
      }

      if (producto.stock <= 0) {
        setLastSearchError('Sin stock disponible');
        addNotification('Producto sin stock disponible', 'warning');
        return null;
      }

      return producto;
    } catch (error) {
      console.error('Error al buscar producto:', error);
      setLastSearchError('Error en la búsqueda');
      addNotification('Error al buscar producto', 'error');
      return null;
    }
  }, [addNotification]);

  const calcularTotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleBarcodeScanned = useCallback(async (barcode: string) => {
    const producto = await searchProduct(barcode);
    if (producto) {
      agregarItem(producto);
    }
  }, [searchProduct]);

  const agregarItem = (producto: ProductoConProveedor) => {
    setItems(prevItems => {
      const itemExistente = prevItems.find(i => i.productoId === producto.id);
      
      if (itemExistente) {
        if (itemExistente.cantidad >= producto.stock) {
          addNotification(`Stock máximo alcanzado: ${producto.stock} unidades`, 'warning');
          return prevItems;
        }

        // Feedback visual para producto ya existente
        addNotification(`${producto.nombre} cantidad aumentada`, 'success');
        
        return prevItems.map(i => 
          i.productoId === producto.id
            ? { 
                ...i, 
                cantidad: i.cantidad + 1,
                subtotal: (i.cantidad + 1) * i.precioUnitario
              }
            : i
        );
      } else {
        // Feedback visual para nuevo producto
        addNotification(`${producto.nombre} agregado a la venta`, 'success');
        
        return [
          ...prevItems,
          {
            productoId: producto.id,
            producto,
            cantidad: 1,
            precioUnitario: producto.precio,
            subtotal: producto.precio
          }
        ];
      }
    });
    setLastSearchError(null);
  };

  const modificarCantidad = (productoId: number, nuevaCantidad: number) => {
    const item = items.find(i => i.productoId === productoId);
    
    if (!item) return;

    if (nuevaCantidad <= 0) {
      eliminarItem(productoId);
      return;
    }

    if (nuevaCantidad > item.producto.stock) {
      addNotification(`Stock máximo disponible: ${item.producto.stock} unidades`, 'warning');
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.productoId === productoId
          ? {
              ...item,
              cantidad: nuevaCantidad,
              subtotal: nuevaCantidad * item.precioUnitario
            }
          : item
      )
    );
  };

  const eliminarItem = (productoId: number) => {
    const item = items.find(i => i.productoId === productoId);
    if (item) {
      addNotification(`${item.producto.nombre} eliminado de la venta`, 'info');
    }
    setItems(prevItems => prevItems.filter(i => i.productoId !== productoId));
  };

  const finalizarVenta = async () => {
    if (items.length === 0) {
      addNotification('Agregue productos a la venta', 'warning');
      return;
    }

    setLoading(true);
    try {
      const venta = await window.api.venta.create({
        items: items.map(item => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          subtotal: item.subtotal,
          descuento: 0
        })),
        total: calcularTotal(),
        subtotal: calcularTotal(),
        impuestos: 0,
        descuento: 0,
        metodoPago: 'efectivo'
      });

      addNotification(`Venta #${venta.codigoVenta} registrada exitosamente`, 'success');
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
                Escanee o busque productos para comenzar la venta
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
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
                  <tr key={item.productoId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {item.producto.nombre}
                        </span>
                        {item.producto.descripcion && (
                          <span className="text-xs text-gray-500">
                            {item.producto.descripcion}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {item.producto.codigoBarras || item.producto.codigo || '-'}
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
                            modificarCantidad(item.productoId, parseInt(e.target.value) || 0)
                          }
                          min="1"
                          max={item.producto.stock}
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-xs text-gray-500">
                          Stock: {item.producto.stock}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${item.subtotal.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => eliminarItem(item.productoId)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-md transition-colors"
                        title="Eliminar producto"
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