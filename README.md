# ERP Simple - Electron + React + Prisma + SQLite

## Contexto
# Sistema de gestión empresarial (ERP) simple para manejo de productos, proveedores, compras, ventas y recordatorios.

# Se necesitaba una herramienta liviana para gestionar inventario y operaciones comerciales a nivel local (sin servidor) en una Ferretería, con interfaz simple y flujo CRUD para entidades principales.


## Proceso

# Elegí realizar la interfaz con React + Tailwind para acelerar creación de componentes reutilizables y por ser las tecnologías que más domino.

# Opté por Prisma + SQLite ya que se quería algo local, y además por simplicidad en despliegue (fácil backup y portable).

# Usé IPC para exponer servicios desde el proceso principal al renderer (seguridad y separación de responsabilidades).

# Solución utilizable por pequeñas tiendas o para gestión local de inventario.


## Resultado
# Reducción de fricción en tareas de registro de compras/ventas y consulta de stock.

# Las métricas permiten que el negocio tome mejores decisiones.

# Unificamos servicios en una sola aplicación de escritorio, facilidad y comodidad. Más que un gasto es una inversión.

## Tecnologías

- **Electron** - Framework para aplicaciones de escritorio
- **React** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Prisma 5** - ORM para base de datos
- **SQLite** - Base de datos local
- **Electron Forge** - Build y packaging
- **Tailwind CSS** - Estilos (vía CDN)

---

## Requisitos Previos

- Node.js 16+ 
- npm o yarn

---

## Instalación Inicial

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

## Comandos de Desarrollo

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

## Estructura del Proyecto

```
mi-erp/
├── src/
│   ├── main/                      # Proceso principal de Electron
│   │   ├── index.ts              # Entry point principal
│   │   ├── preload.ts            # Script de preload (IPC bridge)
│   │   ├── database/
│   │   │   └── prisma.ts         # Cliente de Prisma
│   │   ├── services/             # Lógica de negocio
│   │   │   ├── ProductService.ts
│   │   │   ├── SupplierService.ts
│   │   │   ├── PurchaseService.ts
│   │   │   ├── SaleService.ts
│   │   │   └── ReminderService.ts
│   │   └── ipc/                  # Handlers de comunicación IPC
│   │       ├── handlers.ts
│   │       ├── productHandlers.ts
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
│       │   └── useProducts.ts
│       ├── pages/                # Páginas principales
│       │   ├── Products/
│       │   ├── Proveedors/
│       │   ├── Purchases/
│       │   ├── Sales/
│       │   └── Reminders/
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

## Checklist para Nuevas Features

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

## Próximas Funcionalidades a Implementar

- [ ] **Proveedores**: CRUD completo
- [ ] **Compras**: Registro de compras con detalles
- [ ] **Ventas**: Registro de ventas con detalles
- [ ] **Recordatorios**: Sistema de alertas y notificaciones
- [ ] **Dashboard**: Vista general con métricas
- [ ] **Reportes**: Exportar a PDF/Excel
- [ ] **Autenticación**: Sistema de usuarios (opcional)
- [ ] **Backups**: Sistema de respaldo automático

---

## Licencia

Este proyecto está bajo la Licencia MIT.

---

## Autor

Almarante Manuel - [GitHub](https://github.com/almaranteManuel)