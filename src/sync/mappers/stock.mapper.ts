// mappers/stock.mapper.ts
import { StockStatus } from '../../products/entities/product-stock.entity';

export const mapStock = (raw: any) => {
  return {
    productId: raw.id,
    status:    raw.stock_status as StockStatus,
    quantity:  raw.stock_quantity,
  };
};