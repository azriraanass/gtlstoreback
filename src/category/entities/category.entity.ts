// category.entity.ts
import {
  Entity, PrimaryColumn, Column, ManyToMany
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class Category {
  @PrimaryColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ unique: true, length: 100 })
  slug!: string;

  @ManyToMany(() => Product, (product) => product.categories)
  products!: Product[];
}