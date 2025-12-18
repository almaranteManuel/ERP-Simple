# ERP Simple - Electron + React + Prisma + SQLite

Sistema de gestión empresarial (ERP) simple para manejo de productos, proveedores, compras, ventas y recordatorios.

## 🚀 Tecnologías

- **Electron** - Framework para aplicaciones de escritorio
- **React** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Prisma 5** - ORM para base de datos
- **SQLite** - Base de datos local
- **Electron Forge** - Build y packaging
- **Tailwind CSS** - Estilos (vía CDN)

---

## 📋 Requisitos Previos

- Node.js 16+ 
- npm o yarn

---

## ⚙️ Instalación Inicial

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd mi-erp

# 2. Instalar dependencias
npm install

# 3. Generar cliente de Prisma
npx prisma generate

# 4. Crear base de datos
npx prisma db push

# 5. (Opcional) Abrir Prisma Studio para ver/editar datos
npx prisma studio
```

---

## 🏃 Comandos de Desarrollo

### Desarrollo Local

```bash
# Iniciar la aplicación en modo desarrollo
npm start
```

### Base de Datos

```bash
# Generar el cliente de Prisma (después de cambios en schema.prisma)
npx prisma generate

# Aplicar cambios en el esquema a la base de datos
npx prisma db push

# Resetear la base de datos (¡CUIDADO! Borra todos los datos)
npx prisma db push --force-reset

# Abrir interfaz visual de la base de datos
npx prisma studio
```

### Build y Distribución

```bash
# Crear ejecutable para Windows
npm run make

# El instalador estará en: out/make/squirrel.windows/x64/
```

---

## 📁 Estructura del Proyecto

```
mi-erp/
├── src/
│   ├── main/                      # Proceso principal de Electron
│   │   ├── index.ts              # Entry point principal
│   │   ├── preload.ts            # Script de preload (IPC bridge)
│   │   ├── database/
│   │   │   └── prisma.ts         # Cliente de Prisma
│   │   ├── services/             # Lógica de negocio
│   │   │   ├── ProductoService.ts
│   │   │   ├── ProveedorService.ts
│   │   │   ├── CompraService.ts
│   │   │   ├── VentaService.ts
│   │   │   └── RecordatorioService.ts
│   │   └── ipc/                  # Handlers de comunicación IPC
│   │       ├── handlers.ts
│   │       ├── productoHandlers.ts
│   │       └── ...
│   │
│   └── renderer/                  # Proceso de renderizado (React)
│       ├── index.html
│       ├── index.tsx             # Entry point de React
│       ├── App.tsx               # Componente principal
│       ├── types/
│       │   └── api.types.ts      # Tipos compartidos
│       ├── api/
│       │   └── ipc.ts            # Cliente IPC
│       ├── hooks/                # Custom hooks
│       │   └── useProductos.ts
│       ├── pages/                # Páginas principales
│       │   ├── Productos/
│       │   ├── Proveedores/
│       │   ├── Compras/
│       │   ├── Ventas/
│       │   └── Recordatorios/
│       └── components/           # Componentes reutilizables
│           ├── Layout/
│           └── ui/
│
├── prisma/
│   └── schema.prisma             # Esquema de base de datos
├── package.json
└── tsconfig.json
```

---

## 🔄 Flujo de Trabajo para Nuevas Funcionalidades

### 1. Modificar la Base de Datos (si es necesario)

```bash
# Editar prisma/schema.prisma
# Luego aplicar cambios:
npx prisma generate
npx prisma db push
```

### 2. Crear el Service (Backend)

Crear archivo en `src/main/services/NuevoModuloService.ts`:

```typescript
import prisma from '../database/prisma';

export class NuevoModuloService {
  async getAll() {
    return await prisma.nuevoModulo.findMany();
  }
  
  async create(data: any) {
    return await prisma.nuevoModulo.create({ data });
  }
  
  // ... más métodos
}
```

### 3. Crear IPC Handlers

Crear archivo en `src/main/ipc/nuevoModuloHandlers.ts`:

```typescript
import { ipcMain } from 'electron';
import { NuevoModuloService } from '../services/NuevoModuloService';

const service = new NuevoModuloService();

export function registerNuevoModuloHandlers() {
  ipcMain.handle('nuevoModulo:getAll', async () => {
    return await service.getAll();
  });
  
  // ... más handlers
}
```

### 4. Registrar Handlers

En `src/main/ipc/handlers.ts`:

```typescript
import { registerNuevoModuloHandlers } from './nuevoModuloHandlers';

export function registerAllHandlers() {
  registerProductoHandlers();
  registerNuevoModuloHandlers(); // ← Agregar aquí
  // ...
}
```

### 5. Exponer API en Preload

En `src/main/preload.ts`:

```typescript
contextBridge.exposeInMainWorld('api', {
  producto: { /* ... */ },
  nuevoModulo: {
    getAll: () => ipcRenderer.invoke('nuevoModulo:getAll'),
    create: (data: any) => ipcRenderer.invoke('nuevoModulo:create', data),
    // ...
  },
});
```

### 6. Crear Tipos (Frontend)

En `src/renderer/types/api.types.ts`:

```typescript
export interface NuevoModulo {
  id: number;
  nombre: string;
  // ...
}

// Actualizar el global Window
declare global {
  interface Window {
    api: {
      nuevoModulo: {
        getAll: () => Promise<NuevoModulo[]>;
        // ...
      };
    };
  }
}
```

### 7. Crear Hook de React

Crear `src/renderer/hooks/useNuevoModulo.ts`:

```typescript
import { useState, useEffect } from 'react';

export function useNuevoModulo() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await window.api.nuevoModulo.getAll();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  return { items, loading, loadItems };
}
```

### 8. Crear Página de React

Crear `src/renderer/pages/NuevoModulo/NuevoModuloPage.tsx`:

```typescript
import React from 'react';
import { useNuevoModulo } from '../../hooks/useNuevoModulo';

export function NuevoModuloPage() {
  const { items, loading } = useNuevoModulo();

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Nuevo Módulo</h1>
      {/* Tu UI aquí */}
    </div>
  );
}
```

### 9. Probar

```bash
npm start
```

---

## 🐛 Solución de Problemas Comunes

### Error: "Module '@prisma/client' has no exported member 'PrismaClient'"

```bash
npx prisma generate
# Reiniciar VS Code: Ctrl+Shift+P > "TypeScript: Restart TS Server"
```

### Error: "Cannot find module './preload.js'"

Verifica que `forge.config.ts` tenga configurado correctamente el preload:

```typescript
preload: {
  js: './src/main/preload.ts',
}
```

### Error de compilación de TypeScript

```bash
# Asegúrate de tener jsx configurado en tsconfig.json
"jsx": "react"
```

### La app no inicia después de cambios

```bash
# Limpia y reconstruye
rm -rf .webpack
npm start
```

---

## 📝 Checklist para Nuevas Features

- [ ] Modificar `schema.prisma` (si aplica)
- [ ] Ejecutar `npx prisma generate && npx prisma db push`
- [ ] Crear Service en `src/main/services/`
- [ ] Crear handlers en `src/main/ipc/`
- [ ] Registrar handlers en `src/main/ipc/handlers.ts`
- [ ] Exponer API en `src/main/preload.ts`
- [ ] Definir tipos en `src/renderer/types/api.types.ts`
- [ ] Crear hook en `src/renderer/hooks/`
- [ ] Crear página en `src/renderer/pages/`
- [ ] Probar con `npm start`

---

## 🎯 Próximas Funcionalidades a Implementar

- [ ] **Proveedores**: CRUD completo
- [ ] **Compras**: Registro de compras con detalles
- [ ] **Ventas**: Registro de ventas con detalles
- [ ] **Recordatorios**: Sistema de alertas y notificaciones
- [ ] **Dashboard**: Vista general con métricas
- [ ] **Reportes**: Exportar a PDF/Excel
- [ ] **Autenticación**: Sistema de usuarios (opcional)
- [ ] **Backups**: Sistema de respaldo automático

---

## 📦 Versiones

- **Prisma**: 5.x
- **Electron**: Compatible con Electron Forge
- **React**: 18+
- **TypeScript**: 5+

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 👥 Autor

Tu Nombre - [GitHub](https://github.com/tu-usuario)