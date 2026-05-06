import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { Product } from 'src/products/entities/product.entity';


@Injectable()
export class WoocommerceService {

  private readonly api: WooCommerceRestApi;
  private readonly logger: Logger;

  constructor(configService: ConfigService) {

    this.api = new WooCommerceRestApi({
      url: configService.get<string>('WOOCOMMERCE_URL')!,
      consumerKey: configService.get<string>('WOOCOMMERCE_CONSUMER_KEY')!,
      consumerSecret: configService.get<string>('WOOCOMMERCE_CONSUMER_SECRET')!,
      version: 'wc/v3',
      timeout: 10000,
    });

    this.logger = new Logger(WoocommerceService.name);
  }

  async getAllProducts(numberOfPages: number): Promise<any> {

    this.logger.debug(`${this.getAllProducts.name}: Fetching all products from WooCommerce... Total pages: ${numberOfPages}`);

    const products: any[] = [];

    for(let cntrOfPages = 1; cntrOfPages <= numberOfPages; cntrOfPages++) {

      try {

        // get all products for the page = cntrOfPages
        products.push(await this.getProductPerPage(cntrOfPages));
      }
      catch(error) {
        throw error;
      }

    }
    
    return products;
  }

  async getProductPerPage(page: number): Promise<any> {

    this.logger.debug(`${this.getProductPerPage.name}: Fetching products from WooCommerce for page ${page}...`);

    try {

      const response = await this.api.get('products', {
        per_page: 100,
        page
      });

      return response.data;
    }
    catch(error) {

      this.logger.error(`${this.getProductPerPage.name}: Error fetching products from WooCommerce for page ${page}`, error);
      throw error;
    }
  }


  // dont use it yet !!!
  async getCategoriesPerPage(page: number): Promise<any> {
    
    this.logger.debug(`${this.getCategoriesPerPage.name}: Fetching categories from WooCommerce for page ${page}...`);

    try {
      const response = await this.api.get('products/categories', {
        per_page: 100,
        page
      });

      return response.data;
    }
    catch(error) {

      this.logger.error(`${this.getCategoriesPerPage.name}: Error fetching categories from WooCommerce for page ${page}`, error);
      throw error;
    }
  }


  async getAllCategories(totalNumberOfPages: number): Promise<any[]> {

    this.logger.debug(`${this.getAllCategories.name}: Fetching all categories from WooCommerce... Total pages: ${totalNumberOfPages}`);

    const categories: any[] = [];

    for(let cntrOfPages = 1; cntrOfPages <= totalNumberOfPages; cntrOfPages++) {

      try {

        // get all categories for the page = cntrOfPages
        categories.push(await this.getCategoriesPerPage(cntrOfPages));
      }
      catch(error) {
        throw error;
      }

    }

    return categories;
  }

  async getStats(): Promise<number> {

    this.logger.debug(`${this.getStats.name}: Fetching stats from WooCommerce...`);

    try {

      const totalOfProducts = await this.api.get('products', {per_page: 100});

      return totalOfProducts.headers['x-wp-totalpages'];
    }
    catch(error) {

      this.logger.error(`${this.getStats.name}: Error fetching stats from WooCommerce`, error);
      throw error;
    }

  }
}