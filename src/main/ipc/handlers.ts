import { registerProductoHandlers } from './productoHandlers';
// Importar otros handlers cuando los crees
// import { registerProveedorHandlers } from './proveedorHandlers';
// import { registerCompraHandlers } from './compraHandlers';
// etc...

export function registerAllHandlers() {
  registerProductoHandlers();
  // registerProveedorHandlers();
  // registerCompraHandlers();
  // registerVentaHandlers();
  // registerRecordatorioHandlers();
}