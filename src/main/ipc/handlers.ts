import { registerProductHandlers } from './productHandlers';
import { registerSupplierHandlers } from './supplierHandlers';
import { registerVentaHandlers } from './saleHandlers';
import { registerPurchaseHandlers } from './purchaseHandlers';
// etc...

export function registerAllHandlers() {
  registerProductHandlers();
  registerSupplierHandlers();
  registerVentaHandlers();
  registerPurchaseHandlers();
  // registerRecordatorioHandlers();
}