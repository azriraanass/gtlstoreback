import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';

@Injectable()
export class QdrantService implements OnModuleInit {
  private readonly logger = new Logger(QdrantService.name);
  private readonly collectionName = 'products';
  private readonly vectorSize = 768; // nomic-embed-text

  client: QdrantClient;

  constructor(private readonly configService: ConfigService) {
    this.client = new QdrantClient({
      url: `http://${this.configService.get('QDRANT_HOST', 'localhost')}:${this.configService.get('QDRANT_PORT', '6333')}`,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.ensureCollection();
  }

  private async ensureCollection(): Promise<void> {
    const { collections } = await this.client.getCollections();
    const exists = collections.some((c) => c.name === this.collectionName);

    if (!exists) {
      this.logger.log(`Creating Qdrant collection: ${this.collectionName}`);
      await this.client.createCollection(this.collectionName, {
        vectors: { size: this.vectorSize, distance: 'Cosine' },
      });
    }
  }

  async upsertVector(
    productId: number,
    vector: number[],
    metadata: { category: string },
  ): Promise<void> {
    await this.client.upsert(this.collectionName, {
      points: [
        {
          id: productId.toString(),
          vector,
          payload: { productId, category: metadata.category },
        },
      ],
    });
  }

  async searchVectors(
    vector: number[],
    limit: number = 5,
  ): Promise<Array<{ productId: number; score: number; category: string }>> {
    const results = await this.client.search(this.collectionName, {
      vector,
      limit,
      with_payload: true,
    });

    return results.map((point) => ({
      productId: Number((point.payload as any).productId),
      score: point.score,
      category: (point.payload as any).category as string,
    }));
  }

  async deleteVector(productId: number): Promise<void> {
    await this.client.delete(this.collectionName, {
      points: [productId.toString()],
    });
  }
}