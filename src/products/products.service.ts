import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

interface CategoryMapping {
  key: string;
  slugs: string[];
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  private readonly categoryMappings: CategoryMapping[] = [
    { key: 'phone', slugs: ['smartphone-prix-maroc', 'smartphones', 'tablettes', 'telephonie'] },
    { key: 'Informatique', slugs: ['informatique', 'pc-portable', 'ordinateurs-portables', 'ordinateurs-fixes'] },
    { key: 'Gaming', slugs: ['set-up-gaming-maroc', 'console-gaming-maroc', 'accessoires-gaming-maroc'] },
    { key: 'Image & Son', slugs: ['image-son', 'son', 'enceinte-bluetooth', 'home-cinema-barre-de-son'] },
    { key: 'TV & High Tech', slugs: ['vente-tv-high-tech-maroc', 'smart-tv-prix-maroc', 'videoprojecteurs'] },
    { key: 'Réseau', slugs: ['connectivite', 'routeurs', 'points-acces-wifi', 'switch'] },
    { key: 'Sécurité', slugs: ['videosurveillance', 'camera-de-surveillance-ip', 'securite'] },
    { key: 'Accessoires', slugs: ['chargeurs', 'cables', 'powerbank', 'accessoire-informatique'] },
    { key: 'Stockage', slugs: ['stockage', 'disque-dur-externe', 'disque-dur-interne', 'cle-usb'] },
    { key: 'Périphériques', slugs: ['peripheriques-pc', 'ecran-pc', 'clavier-souris', 'webcam'] },
    { key: 'Objets Connectés', slugs: ['objets-connectes', 'maison-connectee', 'montres-connectees'] },
    { key: 'Impression', slugs: ['imprimantes', 'scanners', 'impression'] },
  ];

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findOne(id: number): Promise<Product> {
    this.logger.debug(`Finding product with id: ${id}`);

    const product = await this.productRepository.findOne({
      where: { id },
      relations: { images: true, stock: true, categories: true },
    });

    if (!product) {
      this.logger.warn(`Product with id ${id} not found`);
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async findByIds(ids: number[]): Promise<Product[]> {
    if (!ids.length) return [];
    return this.productRepository.find({
      where: { id: In(ids) },
      relations: ['images', 'stock', 'categories'],
    });
  }

  async create(dto: CreateProductDto): Promise<Product> {
    this.logger.debug(`Creating product: ${dto.name}`);
    const product = this.productRepository.create(dto);
    const saved: Product = await this.productRepository.save(product);

    this.eventEmitter.emit('product.created', saved);
    this.logger.log(`Product created and event emitted: ${saved.id}`);

    return saved;
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    this.logger.debug(`Updating product ${id}`);
    const product = await this.findOne(id);

    const updated = this.productRepository.merge(product, dto);
    const saved: Product = await this.productRepository.save(updated);

    this.eventEmitter.emit('product.updated', saved);
    this.logger.log(`Product updated and event emitted: ${saved.id}`);

    return saved;
  }

  async remove(id: number): Promise<void> {
    this.logger.debug(`Removing product ${id}`);
    const product = await this.findOne(id);

    await this.productRepository.remove(product);
    this.eventEmitter.emit('product.deleted', { id });
    this.logger.log(`Product removed and event emitted: ${id}`);
  }

  async findAll(): Promise<Product[]> {
    this.logger.debug('Fetching all products');
    return this.productRepository.find({
      relations: ['images', 'stock', 'categories'],
    });
  }

  async upsertProductImage(imageData: Partial<ProductImage>): Promise<any> {
    this.logger.debug(`Upserting image ID: ${imageData.id}`);
    return this.imageRepository.upsert(imageData, ['id']);
  }

  async findForLanding(limitPerCategory: number): Promise<Record<string, Product[]>> {
    this.logger.debug(`Fetching landing page products (limit: ${limitPerCategory})`);

    const result: Record<string, Product[]> = {};

    await Promise.all(
      this.categoryMappings.map(async ({ key, slugs }) => {
        const products = await this.productRepository
          .createQueryBuilder('product')
          .leftJoinAndSelect('product.images', 'image')
          .leftJoinAndSelect('product.stock', 'stock')
          .leftJoinAndSelect('product.categories', 'category')
          .where('category.slug IN (:...slugs)', { slugs })
          .andWhere('stock.status = :status', { status: 'instock' })
          .limit(limitPerCategory)
          .getMany();

        if (products.length) {
          result[key] = products;
        }
      }),
    );

    this.logger.debug(`Returning ${Object.keys(result).length} categories for landing`);
    return result;
  }

  async getProductsByCategory(
    categoryKey: string,
    page: number = 1,
    limit: number = 16,
  ): Promise<{ products: Product[]; total: number }> {
    this.logger.debug(`Category="${categoryKey}" page=${page} limit=${limit}`);

    const mapping = this.categoryMappings.find((c) => c.key === categoryKey);
    if (!mapping) {
      this.logger.warn(`Unknown category key: "${categoryKey}"`);
      return { products: [], total: 0 };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'image')
      .leftJoinAndSelect('product.categories', 'category')
      .leftJoinAndSelect('product.stock', 'stock')
      .where('category.slug IN (:...slugs)', { slugs: mapping.slugs })
      .andWhere('stock.status = :status', { status: 'instock' })
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    this.logger.debug(`Found ${products.length}/${total} products for category "${categoryKey}"`);
    return { products, total };
  }

  async getProductsBySlugs(
    slugs: string[],
    page: number = 1,
    limit: number = 16,
  ): Promise<{ products: Product[]; total: number }> {
    this.logger.debug(`Slugs=[${slugs.join(', ')}] page=${page} limit=${limit}`);

    const skip = (page - 1) * limit;

    const [products, total] = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'image')
      .leftJoinAndSelect('product.categories', 'category')
      .leftJoinAndSelect('product.stock', 'stock')
      .where('category.slug IN (:...slugs)', { slugs })
      .andWhere('stock.status = :status', { status: 'instock' })
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    this.logger.debug(`Found ${products.length}/${total} for slugs [${slugs.join(', ')}]`);
    return { products, total };
  }
}