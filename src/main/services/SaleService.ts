// @ts-nocheck
import prisma from '../database/prisma';
import { Sale } from '@prisma/client';
import type { UpdateSaleDTO, CreateSaleDTO } from '../../shared/types/api.types';

function toJSON<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export class SaleService {
    /**
     * Obtiene todas las ventas con sus items y products
     */
    async getAll(): Promise<Sale[]> {
        try {
            sales =  await prisma.sale.findMany({
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
                orderBy: {
                    date: 'desc',
                },
            });

            return toJSON(sales);
        } catch (error) {
            console.error('Error al obtener ventas:', error);
            throw new Error('No se pudieron cargar las ventas');
        }
    }

    /**
     * Obtiene una venta por ID con todos sus detalles
     */
    async getById(id: number): Promise<Sale | null> {
        try {
            return await prisma.sale.findUnique({
                where: { id },
                include: {
                    items: {
                        include: {
                            product: true,
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
    async getByDateRange(dateFrom: Date, dateTo: Date): Promise<Sale[]> {
        try {
            return await prisma.sale.findMany({
                where: {
                    date: {
                        gte: dateFrom,
                        lte: dateTo,
                    },
                    state: 'completada',
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
                orderBy: {
                    date: 'desc',
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
    async getSalesToday(): Promise<Sale[]> {
        try {
            const hoy = new Date();
            const inicioDelDia = new Date(hoy.setHours(0, 0, 0, 0));
            const finDelDia = new Date(hoy.setHours(23, 59, 59, 999));

            return await prisma.sale.findMany({
                where: {
                    date: {
                        gte: inicioDelDia,
                        lte: finDelDia,
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
                orderBy: {
                    date: 'desc',
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
    async create(data: CreateSaleDTO): Promise<Sale> {
        try {
            // Generar código único para la venta
            const codigoVenta = await this.generarCodigoVenta();

            // Usar transacción para asegurar consistencia
            return await prisma.$transaction(async (tx) => {
                // 1. Verificar stock disponible
                for (const item of data.items) {
                    const product = await tx.product.findUnique({
                        where: { id: item.productId },
                    });

                    if (!product) {
                        throw new Error(`Product con ID ${item.productId} no encontrado`);
                    }

                    if (!product.is_active) {
                        throw new Error(`El product ${product.description} está inactivo`);
                    }

                    if (product.stock < item.qty) {
                        throw new Error(
                            `Stock insuficiente para ${product.description}. ` +
                            `Disponible: ${product.stock}, Requerido: ${item.qty}`
                        );
                    }
                }

                // 2. Crear la venta con sus items
                const venta = await tx.sale.create({
                    data: {
                        codeSale: codigoVenta,
                        total: data.total,
                        subtotal: data.subtotal,
                        discount: data.discount || 0,
                        payMethod: data.payMethod || 'efectivo',
                        details: data.details,
                        items: {
                            create: data.items.map(item => ({
                                productId: item.productId,
                                qty: item.qty,
                                priceUnitary: item.priceUnitary,
                                subtotal: item.subtotal,
                                discount: item.discount || 0,
                            })),
                        },
                    },
                    include: {
                        items: {
                            include: {
                                product: true,
                            },
                        },
                    },
                });

                // 3. Descontar stock de cada producto
                for (const item of data.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                decrement: item.qty,
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
    async update(id: number, data: UpdateSaleDTO): Promise<Sale> {
        try {
            // Solo permitir actualizar campos que no afecten el stock
            const updateData: any = {};

            if (data.payMethod !== undefined) {
                updateData.payMethod = data.payMethod;
            }

            if (data.details !== undefined) {
                updateData.details = data.details;
            }

            if (data.state !== undefined) {
                updateData.state = data.state;
            }

            // Si se intenta actualizar items, lanzar error
            if (data.items) {
                throw new Error(
                    'No se pueden actualizar los items de una venta. ' +
                    'Por favor, anule esta venta y cree una nueva.'
                );
            }

            return await prisma.sale.update({
                where: { id },
                data: updateData,
                include: {
                    items: {
                        include: {
                            product: true,
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
    async anular(id: number): Promise<Sale> {
        try {
            return await prisma.$transaction(async (tx) => {
                // 1. Obtener la venta con sus items
                const sale = await tx.sale.findUnique({
                    where: { id },
                    include: {
                        items: true,
                    },
                });

                if (!sale) {
                    throw new Error('venta no encontrada');
                }

                if (sale.state === 'anulada') {
                    throw new Error('La venta ya está anulada');
                }

                // 2. Devolver el stock
                for (const item of sale.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                increment: item.qty,
                            },
                        },
                    });
                }

                // 3. Marcar la venta como anulada
                return await tx.sale.update({
                    where: { id },
                    data: {
                        state: 'anulada',
                    },
                    include: {
                        items: {
                            include: {
                                product: true,
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
            const sale = await prisma.sale.findUnique({
                where: { id },
            });

            if (!sale) {
                throw new Error('Venta no encontrada');
            }

            if (sale.state !== 'anulada') {
                throw new Error('Solo se pueden eliminar ventas anuladas');
            }

            await prisma.sale.delete({
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

        const ventasHoy = await prisma.sale.count({
            where: {
                date: {
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
    async getStatistics(dateFrom?: Date, dateTo?: Date) {
        try {
            const where: any = {
                state: 'completada',
            };

            if (dateFrom && dateTo) {
                where.date = {
                    gte: dateFrom,
                    lte: dateTo,
                };
            }

            const [totalVentas, ventas] = await Promise.all([
                prisma.sale.count({ where }),
                prisma.sale.findMany({
                    where,
                    include: {
                        items: true,
                    },
                }),
            ]);

            const montoTotal = ventas.reduce((sum, venta) => sum + venta.total, 0);
            const totalItems = ventas.reduce(
                (sum, venta) => sum + venta.items.reduce((s, item) => s + item.qty, 0),
                0
            );

            // Obtener métodos de pago más usados
            const metodosPago = ventas.reduce((acc, venta) => {
                acc[venta.payMethod] = (acc[venta.payMethod] || 0) + 1;
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
     * Obtiene los products más vendidos
     */
    async getProductsMasVendidos(limite: number = 10, dateFrom?: Date, dateTo?: Date) {
        try {
            const where: any = {
                venta: {
                    estado: 'completada',
                },
            };

            if (dateFrom && dateTo) {
                where.venta = {
                    ...where.venta,
                    fecha: {
                        gte: dateFrom,
                        lte: dateTo,
                    },
                };
            }

            const items = await prisma.saleItem.findMany({
                where,
                include: {
                    product: true,
                },
            });

            // Agrupar por product y sumar cantidades
            const productsMap = new Map<number, { product: any; totalVendido: number; ingresos: number }>();

            items.forEach(item => {
                const existing = productsMap.get(item.productId);
                if (existing) {
                    existing.totalVendido += item.qty;
                    existing.ingresos += item.subtotal;
                } else {
                    productsMap.set(item.productId, {
                        product: item.product,
                        totalVendido: item.qty,
                        ingresos: item.subtotal,
                    });
                }
            });

            // Convertir a array y ordenar
            return Array.from(productsMap.values())
                .sort((a, b) => b.totalVendido - a.totalVendido)
                .slice(0, limite);
        } catch (error) {
            console.error('Error al obtener products más vendidos:', error);
            throw new Error('No se pudieron cargar los products más vendidos');
        }
    }
}