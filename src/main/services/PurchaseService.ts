// @ts-nocheck
import type { UpdatePurchaseDTO, CreatePurchaseDTO } from '../../shared/types/api.types';
import prisma from '../database/prisma';
import { Purchase } from '@prisma/client';

function toJSON<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export class PurchaseService {
    /**
     * Obtiene todas las compras con sus items y productos
     */
    async getAll(): Promise<Purchase[]> {
        try {
            const purchases = await prisma.purchase.findMany({
                include: {
                    supplier: true
                },
                orderBy: {
                    date: 'desc',
                },
            });

            return toJSON(purchases);
        } catch (error) {
            console.error('Error al obtener compras:', error);
            throw new Error('No se pudieron cargar las compras');
        }
    }

    /**
     * Obtiene una compra por ID con todos sus detalles
     */
    async getById(id: number): Promise<Purchase | null> {
        try {
            return await prisma.purchase.findUnique({
                where: { id },
                include: {
                    supplier: true,
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
    async getBySupplier(supplierId: number): Promise<Purchase[]> {
        try {
            return await prisma.purchase.findMany({
                where: { supplierId },
                orderBy: {
                    date: 'desc',
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
    async create(data: CreatePurchaseDTO): Promise<Purchase> {
        try {
            // Generar código único para la compra
            const codigoCompra = await this.generarCodigoCompra();

            // Usar transacción para asegurar consistencia
            return await prisma.$transaction(async (tx) => {
                // 1. Validar que todos los products existen
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
                }

                // 2. Crear la compra con sus items
                const compra = await tx.purchase.create({
                    data: {
                        codePurchase: codigoCompra,
                        supplierId: data.supplierId,
                        subtotal: data.subtotal,
                        discount: data.discount || 0,
                        total: data.total,
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
                });

                // 3. Incrementar stock de cada product
                for (const item of data.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                increment: item.qty,
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
    async update(id: number, data: UpdatePurchaseDTO): Promise<Purchase> {
        try {
            // Solo permitir actualizar campos que no afecten el stock
            const updateData: any = {};

            if (data.details !== undefined) {
                updateData.details = data.details;
            }

            if (data.state !== undefined) {
                updateData.state = data.state;
            }

            // Si se intenta actualizar items, lanzar error
            if (data.items) {
                throw new Error(
                    'No se pueden actualizar los items de una compra. ' +
                    'Por favor, anule esta compra y cree una nueva.'
                );
            }

            return await prisma.purchase.update({
                where: { id },
                data: updateData,
            });
        } catch (error) {
            console.error('Error al actualizar compra:', error);
            throw error instanceof Error ? error : new Error('No se pudo actualizar la compra');
        }
    }

    /**
     * Anula una compra y revierte el stock
     */
    async anular(id: number): Promise<Purchase> {
        try {
            return await prisma.$transaction(async (tx) => {
                // 1. Obtener la compra con sus items
                const purchase = await tx.purchase.findUnique({
                    where: { id }
                });

                if (!purchase) {
                    throw new Error('purchase no encontrada');
                }

                if (purchase.state === 'anulada') {
                    throw new Error('La purchase ya está anulada');
                }

                // 2. Revertir el stock
                // for (const item of purchase.items) {
                //     await tx.product.update({
                //         where: { id: item.productId },
                //         data: {
                //             stock: {
                //                 decrement: item.qty,
                //             },
                //         },
                //     });
                // }

                // 3. Marcar la compra como anulada
                return await tx.purchase.update({
                    where: { id },
                    data: {
                        state: 'anulada',
                    }
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
            const purchase = await prisma.purchase.findUnique({
                where: { id },
            });

            if (!purchase) {
                throw new Error('purchase no encontrada');
            }

            if (purchase.state !== 'anulada') {
                throw new Error('Solo se pueden eliminar compras anuladas');
            }

            await prisma.purchase.delete({
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

        const comprasHoy = await prisma.purchase.count({
            where: {
                date: {
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
    async getStatistics(dateFrom?: Date, dateTo?: Date) {
        try {
            const where: any = {
                state: 'completada',
            };

            if (dateFrom && dateTo) {
                where.fecha = {
                    gte: dateFrom,
                    lte: dateTo,
                };
            }

            const [totalPurchases, purchases] = await Promise.all([
                prisma.purchase.count({ where }),
                prisma.purchase.findMany({
                    where,
                    include: {
                        items: true,
                    },
                }),
            ]);

            const totalAmount = purchases.reduce((sum, purchase) => sum + purchase.total, 0);
            const totalItems = purchases.reduce(
                (sum, purchase) => sum + purchase.items.reduce((s, item) => s + item.qty, 0),
                0
            );

            return {
                totalPurchases,
                totalAmount,
                totalItems,
                averagePurchase: totalPurchases > 0 ? totalAmount / totalPurchases : 0,
            };
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw new Error('No se pudieron cargar las estadísticas');
        }
    }
}