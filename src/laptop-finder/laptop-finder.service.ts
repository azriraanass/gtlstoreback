import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { WoocommerceService } from 'src/woocommerce/woocommerce.service';

export interface PaginatedLaptops {
  data:       any[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

@Injectable()
export class LaptopFinderService {

  private readonly logger = new Logger(LaptopFinderService.name);

  /**
   * Category slug that contains all laptop products in WooCommerce.
   * Update this if the slug ever changes in the store.
   */
  private readonly LAPTOP_CATEGORY_SLUG = 'pc-portable-prix-maroc';

  /**
   * Cache the resolved category ID so we only call WooCommerce once
   * instead of on every request.
   */
  private laptopCategoryId: number | null = null;

  constructor(private readonly woocommerceService: WoocommerceService) {}

  /* ── Resolve category slug → ID (cached after first call) ── */
  private async resolveCategoryId(): Promise<number> {
    if (this.laptopCategoryId !== null) {
      return this.laptopCategoryId;
    }

    this.logger.debug(
      `resolveCategoryId: Resolving slug="${this.LAPTOP_CATEGORY_SLUG}"`,
    );

    const category = await this.woocommerceService.getCategoryBySlug(
      this.LAPTOP_CATEGORY_SLUG,
    );

    if (!category) {
      throw new NotFoundException(
        `WooCommerce category not found for slug "${this.LAPTOP_CATEGORY_SLUG}". ` +
        `Check the slug in WooCommerce → Products → Categories.`,
      );
    }

    this.laptopCategoryId = category.id as number;
    this.logger.debug(
      `resolveCategoryId: Resolved "${this.LAPTOP_CATEGORY_SLUG}" → id=${this.laptopCategoryId}`,
    );

    return this.laptopCategoryId;
  }

  /* ── Main method ── */
  async getLaptops(page: number = 1, limit: number = 16): Promise<PaginatedLaptops> {
    this.logger.debug(
      `getLaptops: page=${page} limit=${limit}`,
    );

    const categoryId = await this.resolveCategoryId();

    const { products, total, totalPages } =
      await this.woocommerceService.getProductsByCategoryId(categoryId, page, limit);

    console.log("this is products : ", products[0]);

    return {
      data:  products,   // raw WooCommerce products — includes full attributes array
      total,
      page,
      limit,
      totalPages,
    };
  }
}