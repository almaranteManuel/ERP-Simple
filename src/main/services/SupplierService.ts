// @ts-nocheck
import { CreateSupplierDTO, UpdateSupplierDTO } from '../../shared/types/api.types';
import prisma from '../database/prisma';
import { Supplier } from '@prisma/client';

function toJSON<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export class SupplierService {
    async getAll(): Promise<Supplier[]> {
        try {
            suppliers = await prisma.supplier.findMany({
                orderBy: {
                    createdAt: 'asc',
                },
            });

            return toJSON(suppliers);
        } catch (error) {
            console.error('Error al obtener supplieres:', error);
            throw new Error('No se pudieron cargar los supplieres');
        }
    }

    async getById(id: number): Promise<Supplier | null> {
        try {
            return await prisma.supplier.findUnique({
                where: { id },
            });
        } catch (error) {
            console.error('Error al obtener supplier:', error);
            throw new Error('No se pudo cargar el supplier');
        }
    }

    async create(data: CreateSupplierDTO): Promise<Supplier> {
        try {
            return await prisma.supplier.create({
                data,
            });
        } catch (error) {
            console.error('Error al crear supplier:', error);
            throw new Error('No se pudo crear el supplier');
        }
    }

    async update(
        id: number,
        data: UpdateSupplierDTO
    ): Promise<Supplier> {
        try {
            return await prisma.supplier.update({
                where: { id },
                data,
            });
        } catch (error) {
            console.error('Error al actualizar supplier:', error);
            throw new Error('No se pudo actualizar el supplier');
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await prisma.supplier.delete({
                where: { id },
            });
        } catch (error) {
            console.error('Error al eliminar supplier:', error);
            throw new Error('No se pudo eliminar el supplier');
        }
    }

    async searchByName(query: string): Promise<Supplier[]> {
        try {
            return await prisma.supplier.findMany({
                where: {
                    name: {
                        contains: query,
                    },
                },
            });
        } catch (error) {
            console.error('Error al buscar supplieres:', error);
            throw new Error('No se pudieron buscar los supplieres');
        }
    }
}