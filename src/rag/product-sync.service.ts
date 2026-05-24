import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ProductsService } from '../products/products.service';
import { OllamaService } from '../ollama/ollama.service';
import { QdrantService } from '../qdrant/qdrant.service';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class ProductSyncService {
  private readonly logger = new Logger(ProductSyncService.name);

  constructor(
    private readonly productsService: ProductsService,
    private readonly ollamaService: OllamaService,
    private readonly qdrantService: QdrantService,
  ) {}

  @OnEvent('product.created')
  @OnEvent('product.updated')
  async handleProductChange(product: Product): Promise<void> {
    this.logger.log(`Auto-syncing product ${product.id} to Qdrant`);
    await this.syncProduct(product.id);
  }

  @OnEvent('product.deleted')
  async handleProductDeleted(payload: { id: number }): Promise<void> {
    this.logger.log(`Removing vector for deleted product ${payload.id}`);
    await this.qdrantService.deleteVector(payload.id);
  }

  async syncProduct(productId: number): Promise<void> {
    const product = await this.productsService.findOne(productId);
    const text = this.buildEmbeddingText(product);
    const vector = await this.ollamaService.embed(text);

    const category =
      Array.isArray(product.categories) && product.categories.length > 0
        ? product.categories[0].slug || product.categories[0].name || 'general'
        : 'general';

    await this.qdrantService.upsertVector(product.id, vector, { category });
    this.logger.log(`Synced product ${productId} to Qdrant`);
  }

  async syncAllProducts(): Promise<number> {
    const products = await this.productsService.findAll();
    let count = 0;

    for (const product of products) {
      try {
        await this.syncProduct(product.id);
        count++;
      } catch (err: any) {
        this.logger.error(`Failed to sync product ${product.id}: ${err.message}`);
      }
    }

    this.logger.log(`Batch sync completed: ${count}/${products.length} products synced`);
    return count;
  }

  private buildEmbeddingText(product: Product): string {
    const category = Array.isArray(product.categories)
      ? product.categories.map((c) => c.name || c.slug).join(', ')
      : 'General';

    return [
      `Product: ${product.name}`,
      `Brand: ${product.brand || 'N/A'}`,
      `Category: ${category}`,
      `Price: ${product.price || 'N/A'} MAD`,
      `Description: ${product.description || ''}`,
      `Specifications: ${product.specifications || ''}`,
    ].join('\n');
  }
}