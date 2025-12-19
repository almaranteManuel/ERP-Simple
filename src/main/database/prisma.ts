import { PrismaClient } from '@prisma/client';
import path from 'path';
import { app } from 'electron';

// Determinar la ruta de la base de datos según el entorno
const isDev = process.env.NODE_ENV === 'development';

// En desarrollo, usar la ruta del proyecto
// En producción, usar el directorio de datos del usuario
const dbPath = isDev
  ? path.join(process.cwd(), 'prisma', 'erp.db')
  : path.join(app.getPath('userData'), 'erp.db');

console.log('Database path:', dbPath); // Para debug

// Crear instancia única de Prisma
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
});

export default prisma;