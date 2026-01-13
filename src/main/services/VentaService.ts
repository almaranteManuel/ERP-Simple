import prisma from '../database/prisma';
import { Venta } from '@prisma/client';

interface VentaItemInput {
    productoId: number;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    descuento?: number;
}

interface CreateVentaInput {
    items: VentaItemInput[];
    subtotal: number;
    impuestos?: number;
    descuento?: number;
    total: number;
    metodoPago?: string;
    observaciones?: string;
}

interface UpdateVentaInput {
    items?: VentaItemInput[];
    subtotal?: number;
    impuestos?: number;
    descuento?: number;
    total?: number;
    metodoPago?: string;
    estado?: string;
    observaciones?: string;
}

export class VentaService {
    /**
     * Obtiene todas las ventas con sus items y productos
     */
    async getAll(): Promise<Venta[]> {
        try {
            return await prisma.venta.findMany({
                include: {
                    items: {
                        include: {
                            producto: true,
                        },
                    },
                },
                orderBy: {
                    fecha: 'desc',
                },
            });
        } catch (error) {
            console.error('Error al obtener ventas:', error);
            throw new Error('No se pudieron cargar las ventas');
        }
    }

    /**
     * Obtiene una venta por ID con todos sus detalles
     */
    async getById(id: number): Promise<Venta | null> {
        try {
            return await prisma.venta.findUnique({
                where: { id },
                include: {
                    items: {
                        include: {
                            producto: true,
                        },
                    },
                },
            });
        } catch (error) {
            console.error('Error al obtener venta:', error);
            throw new Error('No se pudo cargar la venta');
        }
    }

    /**
     * Obtiene ventas por rango de fechas
     */
    async getByDateRange(fechaInicio: Date, fechaFin: Date): Promise<Venta[]> {
        try {
            return await prisma.venta.findMany({
                where: {
                    fecha: {
                        gte: fechaInicio,
                        lte: fechaFin,
                    },
                    estado: 'completada',
                },
                include: {
                    items: {
                        include: {
                            producto: true,
                        },
                    },
                },
                orderBy: {
                    fecha: 'desc',
                },
            });
        } catch (error) {
            console.error('Error al obtener ventas por rango:', error);
            throw new Error('No se pudieron cargar las ventas');
        }
    }

    /**
     * Obtiene ventas del día actual
     */
    async getVentasHoy(): Promise<Venta[]> {
        try {
            const hoy = new Date();
            const inicioDelDia = new Date(hoy.setHours(0, 0, 0, 0));
            const finDelDia = new Date(hoy.setHours(23, 59, 59, 999));

            return await prisma.venta.findMany({
                where: {
                    fecha: {
                        gte: inicioDelDia,
                        lte: finDelDia,
                    },
                },
                include: {
                    items: {
                        include: {
                            producto: true,
                        },
                    },
                },
                orderBy: {
                    fecha: 'desc',
                },
            });
        } catch (error) {
            console.error('Error al obtener ventas de hoy:', error);
            throw new Error('No se pudieron cargar las ventas de hoy');
        }
    }

    /**
     * Crea una nueva venta con items y descuenta el stock
     */
    async create(data: CreateVentaInput): Promise<Venta> {
        try {
            // Generar código único para la venta
            const codigoVenta = await this.generarCodigoVenta();

            // Usar transacción para asegurar consistencia
            return await prisma.$transaction(async (tx) => {
                // 1. Verificar stock disponible
                for (const item of data.items) {
                    const producto = await tx.producto.findUnique({
                        where: { id: item.productoId },
                    });

                    if (!producto) {
                        throw new Error(`Producto con ID ${item.productoId} no encontrado`);
                    }

                    if (!producto.activo) {
                        throw new Error(`El producto ${producto.nombre} está inactivo`);
                    }

                    if (producto.stock < item.cantidad) {
                        throw new Error(
                            `Stock insuficiente para ${producto.nombre}. ` +
                            `Disponible: ${producto.stock}, Requerido: ${item.cantidad}`
                        );
                    }
                }

                // 2. Crear la venta con sus items
                const venta = await tx.venta.create({
                    data: {
                        codigoVenta,
                        total: data.total,
                        subtotal: data.subtotal,
                        impuestos: data.impuestos || 0,
                        descuento: data.descuento || 0,
                        metodoPago: data.metodoPago || 'efectivo',
                        observaciones: data.observaciones,
                        items: {
                            create: data.items.map(item => ({
                                productoId: item.productoId,
                                cantidad: item.cantidad,
                                precioUnitario: item.precioUnitario,
                                subtotal: item.subtotal,
                                descuento: item.descuento || 0,
                            })),
                        },
                    },
                    include: {
                        items: {
                            include: {
                                producto: true,
                            },
                        },
                    },
                });

                // 3. Descontar stock de cada producto
                for (const item of data.items) {
                    await tx.producto.update({
                        where: { id: item.productoId },
                        data: {
                            stock: {
                                decrement: item.cantidad,
                            },
                        },
                    });
                }

                return venta;
            });
        } catch (error) {
            console.error('Error al crear venta:', error);
            throw error instanceof Error ? error : new Error('No se pudo crear la venta');
        }
    }

    /**
     * Actualiza una venta existente
     * NOTA: Actualizar items es complejo porque afecta el stock.
     * Se recomienda anular y crear una nueva en lugar de actualizar.
     */
    async update(id: number, data: UpdateVentaInput): Promise<Venta> {
        try {
            // Solo permitir actualizar campos que no afecten el stock
            const updateData: any = {};

            if (data.metodoPago !== undefined) {
                updateData.metodoPago = data.metodoPago;
            }

            if (data.observaciones !== undefined) {
                updateData.observaciones = data.observaciones;
            }

            if (data.estado !== undefined) {
                updateData.estado = data.estado;
            }

            // Si se intenta actualizar items, lanzar error
            if (data.items) {
                throw new Error(
                    'No se pueden actualizar los items de una venta. ' +
                    'Por favor, anule esta venta y cree una nueva.'
                );
            }

            return await prisma.venta.update({
                where: { id },
                data: updateData,
                include: {
                    items: {
                        include: {
                            producto: true,
                        },
                    },
                },
            });
        } catch (error) {
            console.error('Error al actualizar venta:', error);
            throw error instanceof Error ? error : new Error('No se pudo actualizar la venta');
        }
    }

    /**
     * Anula una venta y devuelve el stock
     */
    async anular(id: number): Promise<Venta> {
        try {
            return await prisma.$transaction(async (tx) => {
                // 1. Obtener la venta con sus items
                const venta = await tx.venta.findUnique({
                    where: { id },
                    include: {
                        items: true,
                    },
                });

                if (!venta) {
                    throw new Error('Venta no encontrada');
                }

                if (venta.estado === 'anulada') {
                    throw new Error('La venta ya está anulada');
                }

                // 2. Devolver el stock
                for (const item of venta.items) {
                    await tx.producto.update({
                        where: { id: item.productoId },
                        data: {
                            stock: {
                                increment: item.cantidad,
                            },
                        },
                    });
                }

                // 3. Marcar la venta como anulada
                return await tx.venta.update({
                    where: { id },
                    data: {
                        estado: 'anulada',
                    },
                    include: {
                        items: {
                            include: {
                                producto: true,
                            },
                        },
                    },
                });
            });
        } catch (error) {
            console.error('Error al anular venta:', error);
            throw error instanceof Error ? error : new Error('No se pudo anular la venta');
        }
    }

    /**
     * Elimina físicamente una venta (solo si está anulada)
     */
    async delete(id: number): Promise<void> {
        try {
            const venta = await prisma.venta.findUnique({
                where: { id },
            });

            if (!venta) {
                throw new Error('Venta no encontrada');
            }

            if (venta.estado !== 'anulada') {
                throw new Error('Solo se pueden eliminar ventas anuladas');
            }

            await prisma.venta.delete({
                where: { id },
            });
        } catch (error) {
            console.error('Error al eliminar venta:', error);
            throw error instanceof Error ? error : new Error('No se pudo eliminar la venta');
        }
    }

    /**
     * Genera un código único para la venta
     * Formato: V-YYYYMMDD-NNNN
     */
    private async generarCodigoVenta(): Promise<string> {
        const fecha = new Date();
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');

        // Contar ventas del día
        const inicioDelDia = new Date(fecha.setHours(0, 0, 0, 0));
        const finDelDia = new Date(fecha.setHours(23, 59, 59, 999));

        const ventasHoy = await prisma.venta.count({
            where: {
                fecha: {
                    gte: inicioDelDia,
                    lte: finDelDia,
                },
            },
        });

        const numero = String(ventasHoy + 1).padStart(4, '0');
        return `V-${year}${month}${day}-${numero}`;
    }

    /**
     * Obtiene estadísticas de ventas
     */
    async getEstadisticas(fechaInicio?: Date, fechaFin?: Date) {
        try {
            const where: any = {
                estado: 'completada',
            };

            if (fechaInicio && fechaFin) {
                where.fecha = {
                    gte: fechaInicio,
                    lte: fechaFin,
                };
            }

            const [totalVentas, ventas] = await Promise.all([
                prisma.venta.count({ where }),
                prisma.venta.findMany({
                    where,
                    include: {
                        items: true,
                    },
                }),
            ]);

            const montoTotal = ventas.reduce((sum, venta) => sum + venta.total, 0);
            const totalItems = ventas.reduce(
                (sum, venta) => sum + venta.items.reduce((s, item) => s + item.cantidad, 0),
                0
            );

            // Obtener métodos de pago más usados
            const metodosPago = ventas.reduce((acc, venta) => {
                acc[venta.metodoPago] = (acc[venta.metodoPago] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            return {
                totalVentas,
                montoTotal,
                totalItems,
                promedioVenta: totalVentas > 0 ? montoTotal / totalVentas : 0,
                metodosPago,
            };
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw new Error('No se pudieron cargar las estadísticas');
        }
    }

    /**
     * Obtiene los productos más vendidos
     */
    async getProductosMasVendidos(limite: number = 10, fechaInicio?: Date, fechaFin?: Date) {
        try {
            const where: any = {
                venta: {
                    estado: 'completada',
                },
            };

            if (fechaInicio && fechaFin) {
                where.venta = {
                    ...where.venta,
                    fecha: {
                        gte: fechaInicio,
                        lte: fechaFin,
                    },
                };
            }

            const items = await prisma.ventaItem.findMany({
                where,
                include: {
                    producto: true,
                },
            });

            // Agrupar por producto y sumar cantidades
            const productosMap = new Map<number, { producto: any; totalVendido: number; ingresos: number }>();

            items.forEach(item => {
                const existing = productosMap.get(item.productoId);
                if (existing) {
                    existing.totalVendido += item.cantidad;
                    existing.ingresos += item.subtotal;
                } else {
                    productosMap.set(item.productoId, {
                        producto: item.producto,
                        totalVendido: item.cantidad,
                        ingresos: item.subtotal,
                    });
                }
            });

            // Convertir a array y ordenar
            return Array.from(productosMap.values())
                .sort((a, b) => b.totalVendido - a.totalVendido)
                .slice(0, limite);
        } catch (error) {
            console.error('Error al obtener productos más vendidos:', error);
            throw new Error('No se pudieron cargar los productos más vendidos');
        }
    }
}