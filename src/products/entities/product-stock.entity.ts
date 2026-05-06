// product-stock.entity.ts
import {
  Entity, Column,
  OneToOne, JoinColumn,
  PrimaryColumn
} from 'typeorm';
import { Product } from './product.entity';

export enum StockStatus {
  INSTOCK      = 'instock',
  OUTOFSTOCK   = 'outofstock',
  ONBACKORDER  = 'onbackorder',
}

@Entity('product_stock')
export class ProductStock {
  @PrimaryColumn({ name: 'product_id' })
  productId!: number;

  @Column({
    type: 'enum',
    enum: StockStatus,
    default: StockStatus.INSTOCK,
  })
  status!: StockStatus;

  @Column({ type: 'int', default: 0 })
  quantity!: number;

  get inStock(): boolean {
    return this.status === StockStatus.INSTOCK;
  }

  @OneToOne(() => Product, (product) => product.stock)
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}