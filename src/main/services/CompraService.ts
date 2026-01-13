import prisma from '../database/prisma';
import { Compra } from '@prisma/client';

interface CompraItemInput {
    productoId: number;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    descuento?: number;
}

interface CreateCompraInput {
    proveedorId: number;
    items: CompraItemInput[];
    subtotal: number;
    impuestos?: number;
    descuento?: number;
    total: number;
    observaciones?: string;
}

interface UpdateCompraInput {
    proveedorId?: number;
    items?: CompraItemInput[];
    subtotal?: number;
    impuestos?: number;
    descuento?: number;
    total?: number;
    estado?: string;
    observaciones?: string;
}

export class CompraService {
    /**
     * Obtiene todas las compras con sus items y productos
     */
    async getAll(): Promise<Compra[]> {
        try {
            return await prisma.compra.findMany({
                include: {
                    proveedor: true,
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
            console.error('Error al obtener compras:', error);
            throw new Error('No se pudieron cargar las compras');
        }
    }

    /**
     * Obtiene una compra por ID con todos sus detalles
     */
    async getById(id: number): Promise<Compra | null> {
        try {
            return await prisma.compra.findUnique({
                where: { id },
                include: {
                    proveedor: true,
                    items: {
                        include: {
                            producto: true,
                        },
                    },
                },
            });
        } catch (error) {
            console.error('Error al obtener compra:', error);
            throw new Error('No se pudo cargar la compra');
        }
    }

    /**
     * Obtiene compras por proveedor
     */
    async getByProveedor(proveedorId: number): Promise<Compra[]> {
        try {
            return await prisma.compra.findMany({
                where: { proveedorId },
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
            console.error('Error al obtener compras del proveedor:', error);
            throw new Error('No se pudieron cargar las compras del proveedor');
        }
    }

    /**
     * Crea una nueva compra con items y actualiza el stock
     */
    async create(data: CreateCompraInput): Promise<Compra> {
        try {
            // Generar código único para la compra
            const codigoCompra = await this.generarCodigoCompra();

            // Usar transacción para asegurar consistencia
            return await prisma.$transaction(async (tx) => {
                // 1. Validar que todos los productos existen
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
                }

                // 2. Crear la compra con sus items
                const compra = await tx.compra.create({
                    data: {
                        codigoCompra,
                        proveedorId: data.proveedorId,
                        subtotal: data.subtotal,
                        impuestos: data.impuestos || 0,
                        descuento: data.descuento || 0,
                        total: data.total,
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
                        proveedor: true,
                        items: {
                            include: {
                                producto: true,
                            },
                        },
                    },
                });

                // 3. Incrementar stock de cada producto
                for (const item of data.items) {
                    await tx.producto.update({
                        where: { id: item.productoId },
                        data: {
                            stock: {
                                increment: item.cantidad,
                            },
                        },
                    });
                }

                return compra;
            });
        } catch (error) {
            console.error('Error al crear compra:', error);
            throw error instanceof Error ? error : new Error('No se pudo crear la compra');
        }
    }

    /**
     * Actualiza una compra existente
     * NOTA: Actualizar items es complejo porque afecta el stock.
     * Se recomienda anular y crear una nueva en lugar de actualizar.
     */
    async update(id: number, data: UpdateCompraInput): Promise<Compra> {
        try {
            // Solo permitir actualizar campos que no afecten el stock
            const updateData: any = {};

            if (data.observaciones !== undefined) {
                updateData.observaciones = data.observaciones;
            }

            if (data.estado !== undefined) {
                updateData.estado = data.estado;
            }

            // Si se intenta actualizar items, lanzar error
            if (data.items) {
                throw new Error(
                    'No se pueden actualizar los items de una compra. ' +
                    'Por favor, anule esta compra y cree una nueva.'
                );
            }

            return await prisma.compra.update({
                where: { id },
                data: updateData,
                include: {
                    proveedor: true,
                    items: {
                        include: {
                            producto: true,
                        },
                    },
                },
            });
        } catch (error) {
            console.error('Error al actualizar compra:', error);
            throw error instanceof Error ? error : new Error('No se pudo actualizar la compra');
        }
    }

    /**
     * Anula una compra y revierte el stock
     */
    async anular(id: number): Promise<Compra> {
        try {
            return await prisma.$transaction(async (tx) => {
                // 1. Obtener la compra con sus items
                const compra = await tx.compra.findUnique({
                    where: { id },
                    include: {
                        items: true,
                    },
                });

                if (!compra) {
                    throw new Error('Compra no encontrada');
                }

                if (compra.estado === 'anulada') {
                    throw new Error('La compra ya está anulada');
                }

                // 2. Revertir el stock
                for (const item of compra.items) {
                    await tx.producto.update({
                        where: { id: item.productoId },
                        data: {
                            stock: {
                                decrement: item.cantidad,
                            },
                        },
                    });
                }

                // 3. Marcar la compra como anulada
                return await tx.compra.update({
                    where: { id },
                    data: {
                        estado: 'anulada',
                    },
                    include: {
                        proveedor: true,
                        items: {
                            include: {
                                producto: true,
                            },
                        },
                    },
                });
            });
        } catch (error) {
            console.error('Error al anular compra:', error);
            throw error instanceof Error ? error : new Error('No se pudo anular la compra');
        }
    }

    /**
     * Elimina físicamente una compra (solo si está anulada)
     */
    async delete(id: number): Promise<void> {
        try {
            const compra = await prisma.compra.findUnique({
                where: { id },
            });

            if (!compra) {
                throw new Error('Compra no encontrada');
            }

            if (compra.estado !== 'anulada') {
                throw new Error('Solo se pueden eliminar compras anuladas');
            }

            await prisma.compra.delete({
                where: { id },
            });
        } catch (error) {
            console.error('Error al eliminar compra:', error);
            throw error instanceof Error ? error : new Error('No se pudo eliminar la compra');
        }
    }

    /**
     * Genera un código único para la compra
     * Formato: C-YYYYMMDD-NNNN
     */
    private async generarCodigoCompra(): Promise<string> {
        const fecha = new Date();
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');

        // Contar compras del día
        const inicioDelDia = new Date(fecha.setHours(0, 0, 0, 0));
        const finDelDia = new Date(fecha.setHours(23, 59, 59, 999));

        const comprasHoy = await prisma.compra.count({
            where: {
                fecha: {
                    gte: inicioDelDia,
                    lte: finDelDia,
                },
            },
        });

        const numero = String(comprasHoy + 1).padStart(4, '0');
        return `C-${year}${month}${day}-${numero}`;
    }

    /**
     * Obtiene estadísticas de compras
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

            const [totalCompras, compras] = await Promise.all([
                prisma.compra.count({ where }),
                prisma.compra.findMany({
                    where,
                    include: {
                        items: true,
                    },
                }),
            ]);

            const montoTotal = compras.reduce((sum, compra) => sum + compra.total, 0);
            const totalItems = compras.reduce(
                (sum, compra) => sum + compra.items.reduce((s, item) => s + item.cantidad, 0),
                0
            );

            return {
                totalCompras,
                montoTotal,
                totalItems,
                promedioCompra: totalCompras > 0 ? montoTotal / totalCompras : 0,
            };
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw new Error('No se pudieron cargar las estadísticas');
        }
    }
}