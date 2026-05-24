import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

@Injectable()
export class WoocommerceService {

  private readonly api: WooCommerceRestApi;
  private readonly logger: Logger;

  constructor(configService: ConfigService) {

    this.api = new WooCommerceRestApi({
      url:            configService.get<string>('WOOCOMMERCE_URL')!,
      consumerKey:    configService.get<string>('WOOCOMMERCE_CONSUMER_KEY')!,
      consumerSecret: configService.get<string>('WOOCOMMERCE_CONSUMER_SECRET')!,
      version:        'wc/v3',
      timeout:        10000,
    });

    this.logger = new Logger(WoocommerceService.name);
  }

  /* ═══════════════════════════════════════════════════════
     PRODUCTS
  ═══════════════════════════════════════════════════════ */

  async getAllProducts(numberOfPages: number): Promise<any[]> {
    this.logger.debug(
      `${this.getAllProducts.name}: Fetching all products — totalPages=${numberOfPages}`,
    );

    const products: any[] = [];

    for (let page = 1; page <= numberOfPages; page++) {
      products.push(await this.getProductPerPage(page));
    }

    return products;
  }

  async getProductPerPage(page: number): Promise<any[]> {
    this.logger.debug(
      `${this.getProductPerPage.name}: Fetching products page=${page}`,
    );

    try {
      const response = await this.api.get('products', { per_page: 100, page });
      return response.data;
    } catch (error) {
      this.logger.error(
        `${this.getProductPerPage.name}: Error on page ${page}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Fetch one page of products filtered by WooCommerce category ID.
   *
   * Returns:
   *  - products   : the raw WooCommerce product objects for this page
   *                 (each includes a full `attributes` array with options)
   *  - total      : total number of matching products (from X-WP-Total header)
   *  - totalPages : total number of pages          (from X-WP-TotalPages header)
   */
  async getProductsByCategoryId(
    categoryId: number,
    page:       number = 1,
    perPage:    number = 16,
  ): Promise<{ products: any[]; total: number; totalPages: number }> {
    this.logger.debug(
      `${this.getProductsByCategoryId.name}: ` +
      `categoryId=${categoryId} page=${page} perPage=${perPage}`,
    );

    try {
      const response = await this.api.get('products', {
        category: categoryId,
        per_page:  perPage,
        page,
        status:   'publish',
      });

      const total      = parseInt(response.headers['x-wp-total']      ?? '0', 10);
      const totalPages = parseInt(response.headers['x-wp-totalpages'] ?? '1', 10);

      return { products: response.data, total, totalPages };
    } catch (error) {
      this.logger.error(
        `${this.getProductsByCategoryId.name}: Error`,
        error,
      );
      throw error;
    }
  }

  async getStats(): Promise<number> {
    this.logger.debug(`${this.getStats.name}: Fetching total pages`);

    try {
      const response = await this.api.get('products', { per_page: 100 });
      return parseInt(response.headers['x-wp-totalpages'], 10);
    } catch (error) {
      this.logger.error(`${this.getStats.name}: Error`, error);
      throw error;
    }
  }

  /* ═══════════════════════════════════════════════════════
     CATEGORIES
  ═══════════════════════════════════════════════════════ */

  async getCategoriesPerPage(page: number): Promise<any[]> {
    this.logger.debug(
      `${this.getCategoriesPerPage.name}: Fetching categories page=${page}`,
    );

    try {
      const response = await this.api.get('products/categories', {
        per_page: 100,
        page,
      });
      return response.data;
    } catch (error) {
      this.logger.error(
        `${this.getCategoriesPerPage.name}: Error on page ${page}`,
        error,
      );
      throw error;
    }
  }

  async getAllCategories(totalNumberOfPages: number): Promise<any[]> {
    this.logger.debug(
      `${this.getAllCategories.name}: Fetching all categories — totalPages=${totalNumberOfPages}`,
    );

    const categories: any[] = [];

    for (let page = 1; page <= totalNumberOfPages; page++) {
      categories.push(await this.getCategoriesPerPage(page));
    }

    return categories;
  }

  /**
   * Resolve a category slug to its full WooCommerce category object.
   * Returns undefined if no match is found.
   *
   * The WooCommerce API supports filtering by slug directly, so this
   * is a single request — no need to paginate.
   */
  async getCategoryBySlug(slug: string): Promise<any | undefined> {
    this.logger.debug(
      `${this.getCategoryBySlug.name}: Resolving slug="${slug}"`,
    );

    try {
      const response = await this.api.get('products/categories', {
        slug,
        per_page: 1,
      });

      return response.data?.[0];
    } catch (error) {
      this.logger.error(
        `${this.getCategoryBySlug.name}: Error resolving slug="${slug}"`,
        error,
      );
      throw error;
    }
  }
}