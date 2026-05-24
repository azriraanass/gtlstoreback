import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';
import { ProductSyncService } from './product-sync.service';
import { ProductsModule } from '../products/products.module';
import { OllamaModule } from '../ollama/ollama.module';
import { QdrantModule } from '../qdrant/qdrant.module';


@Module({
  imports: [ProductsModule, OllamaModule, QdrantModule],
  controllers: [RagController],
  providers: [RagService, ProductSyncService],
  exports: [RagService, ProductSyncService],
})
export class RagModule {}