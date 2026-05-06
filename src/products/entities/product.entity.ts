// product.entity.ts
import {
  Entity, PrimaryColumn, Column, OneToOne, OneToMany,
  ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { ProductStock } from './product-stock.entity';
import { ProductImage } from './product-image.entity';
import { Category } from '../../category/entities/category.entity';

@Entity('products')
export class Product {
  @PrimaryColumn()
  id!: number;

  @Column({ length: 255 })
  name!: string;

  @Column({ unique: true, length: 255 })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  url!: string;

  @Column({ length: 100, nullable: true })
  reference!: string;

  @Column({ name: 'internal_id', length: 100, nullable: true })
  internalId!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ name: 'regular_price', type: 'decimal', precision: 10, scale: 2 })
  regularPrice!: number;

  @Column({ name: 'sale_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  salePrice!: number;

  @Column({ name: 'on_sale', default: false })
  onSale!: boolean;

  @Column({ length: 10, default: 'MAD' })
  currency!: string;

  @Column({ length: 100, nullable: true })
  brand!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'average_rating' })
  averageRating!: number;

  @Column({ name: 'rating_count', type: 'integer', default: 0 })
  ratingCount!: number;

  @Column({ type: 'text', nullable: true })
  specifications!: string;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @OneToOne(() => ProductStock, (stock) => stock.product, { cascade: true })
  stock!: ProductStock;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: false })
  images!: ProductImage[];

  @ManyToMany(() => Category, (category) => category.products, { cascade: true })
  @JoinTable({
    name: 'product_categories',
    joinColumn:        { name: 'product_id',  referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories!: Category[];
}