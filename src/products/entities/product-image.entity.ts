import {
  Entity, Column,
  ManyToOne, JoinColumn,
  PrimaryColumn
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_images')
export class ProductImage {

  @PrimaryColumn()
  id!: number; 

  @PrimaryColumn({ name: 'product_id' })
  productId!: number;

  @Column({ type: 'text' })
  src!: string;

  @Column({ length: 255, nullable: true })
  alt!: string;

  @Column({ type: 'text', nullable: true })
  thumbnail!: string;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}