import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
  ) {

  }

  async findOne(id: number): Promise<Product| null> {

    this.logger.debug(`${this.findOne.name}: Fetch product with id: ${id}`);

    const product = await this.productRepository.findOne({
      where: {
        id
      },
      relations: {
        images: true,
        stock: true,
        categories: true
      }
    });

    if(product === null) {
    
      this.logger.error(`${this.findOne.name}: Error there is no product with id: ${id} in the data base.`);
      return null;
    }

    return product;
  }


  async create(productData: any): Promise<Product[]> {

      this.logger.debug(`${this.create.name}: Creating product with ID ${productData.id}...`);
      const product = this.productRepository.create(productData);
      
      return await this.productRepository.save(product);
  }
  
  async findAll(): Promise<Product[]> {
      this.logger.debug(`${this.findAll.name}: Fetching all products for frontend display`);
      const products =  await this.productRepository.find({
        relations: ["images", "stock", "categories"]
      });

      return products;
  }
  async upsertProductImage(imageData: any): Promise<any> {
    
      this.logger.debug(`${this.upsertProductImage.name}: Upserting product image with ID ${imageData.id}...`);
      return await this.imageRepository.upsert(imageData, ['id']);
  }

  async findForLanding(limitPerCategory: number): Promise<Record<string, Product[]>> {

    this.logger.debug(`${this.findForLanding.name}: Fetch products for the leading page...`);
    const categories = [
      { key: 'phone',            slugs: ['smartphone-prix-maroc', 'smartphones', 'tablettes', 'telephonie'] },
      { key: 'Informatique',     slugs: ['informatique', 'pc-portable', 'ordinateurs-portables', 'ordinateurs-fixes'] },
      { key: 'Gaming',           slugs: ['set-up-gaming-maroc', 'console-gaming-maroc', 'accessoires-gaming-maroc'] },
      { key: 'Image & Son',      slugs: ['image-son', 'son', 'enceinte-bluetooth', 'home-cinema-barre-de-son'] },
      { key: 'TV & High Tech',   slugs: ['vente-tv-high-tech-maroc', 'smart-tv-prix-maroc', 'videoprojecteurs'] },
      { key: 'Réseau',           slugs: ['connectivite', 'routeurs', 'points-acces-wifi', 'switch'] },
      { key: 'Sécurité',         slugs: ['videosurveillance', 'camera-de-surveillance-ip', 'securite'] },
      { key: 'Accessoires',      slugs: ['chargeurs', 'cables', 'powerbank', 'accessoire-informatique'] },
      { key: 'Stockage',         slugs: ['stockage', 'disque-dur-externe', 'disque-dur-interne', 'cle-usb'] },
      { key: 'Périphériques',    slugs: ['peripheriques-pc', 'ecran-pc', 'clavier-souris', 'webcam'] },
      { key: 'Objets Connectés', slugs: ['objets-connectes', 'maison-connectee', 'montres-connectees'] },
      { key: 'Impression',       slugs: ['imprimantes', 'scanners', 'impression'] },
    ];
  
    const result: Record<string, Product[]> = {};
  
    await Promise.all(
      categories.map(async ({ key, slugs }) => {
        const products = await this.productRepository
          .createQueryBuilder('product')
          .leftJoinAndSelect('product.images',     'image')
          .leftJoinAndSelect('product.stock',      'stock')
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
    
    this.logger.debug(`${this.findForLanding.name}: The resultat object has: ${Object.keys(result).length} keys`);
    return result;
  }   
}