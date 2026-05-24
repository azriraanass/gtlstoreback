import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { RagService, RagSearchResult } from './rag.service';
import { ProductSyncService } from './product-sync.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { SyncResultDto } from './dto/sync-result.dto';

@Controller('rag')
export class RagController {
  constructor(
    private readonly ragService: RagService,
    private readonly productSyncService: ProductSyncService,
  ) {}

  @Post('search')
  @HttpCode(200)
  async search(@Body() dto: SearchQueryDto): Promise<RagSearchResult> {
    return this.ragService.search(dto.query, dto.limit);
  }

  @Post('sync-all')
  async syncAll(): Promise<SyncResultDto> {
    const count = await this.productSyncService.syncAllProducts();
    return {
      success: true,
      message: `Synced ${count} products to Qdrant`,
      syncedCount: count,
    };
  }

  @Post('sync/:productId')
  async syncOne(
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<SyncResultDto> {
    await this.productSyncService.syncProduct(productId);
    return {
      success: true,
      message: `Product ${productId} synced successfully`,
    };
  }

  @Post('products/:id/embedding')
  async updateEmbedding(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SyncResultDto> {
    await this.productSyncService.syncProduct(id);
    return {
      success: true,
      message: `Embedding updated for product ${id}`,
    };
  }
}