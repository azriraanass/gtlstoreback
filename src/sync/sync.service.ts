import { Injectable, Logger } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { WoocommerceService } from 'src/woocommerce/woocommerce.service';
import { mapProduct } from './mappers/product.mapper';
import { mapCategories } from './mappers/category.mapper';
import { CategoryService } from 'src/category/category.service';

@Injectable()
export class SyncService {

    private readonly logger: Logger;

    constructor(private readonly woocommerceService: WoocommerceService,
                private readonly productsService: ProductsService,
                private readonly categoryService: CategoryService
    ) {
        this.logger = new Logger(SyncService.name);
    }

    async syncDataBaseWithWoocommerce() {
        this.logger.debug(`Starting sync with WooCommerce...`);

        const totalPages = await this.woocommerceService.getStats();
        const products = await this.syncProductsWithWoocommerce(totalPages);

        this.logger.debug(`Fetched ${products.length} products from WooCommerce`);

        // 1. Upsert categories first (products depend on them)
        const uniqueCategories = Array.from(
          new Map(
            products.flatMap(p => p.categories).map(c => [c.id, c])
          ).values()
        );
    
        await Promise.all(
          uniqueCategories.map(category => this.categoryService.create(category))
        );
    
        // 2. For each product: upsert product row, then upsert its images
        //    Keep images attached to the product — never set to undefined
        await Promise.all(
          products.map(async (product) => {
            const { images, ...productFields } = product;

            // Upsert product without relations (avoids cascade wipe)
            await this.productsService.create(productFields);

            // Upsert images immediately after their product — atomic per product
            if (images && images.length > 0) {
              await Promise.all(
                images.map(image => this.productsService.upsertProductImage(image))
              );
            }
          })
        );
    
        this.logger.debug(`Sync finished.`);
    }

    async syncProductsWithWoocommerce(totalNumberOfPages: number): Promise<any[]> {
        
        this.logger.debug(`${this.syncProductsWithWoocommerce.name}: Starting product synchronization with WooCommerce...`);

        const productsPages = await this.woocommerceService.getAllProducts(totalNumberOfPages);

        // productsPages is an arrays of arrays, each array contains the products for a page.
        const mappedProducts = productsPages.flatMap(page =>
            page.map(product => mapProduct(product))
        );

        return mappedProducts;
    }
}
