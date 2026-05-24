import { Injectable, Logger } from '@nestjs/common';
import { OllamaService } from '../ollama/ollama.service';
import { QdrantService } from '../qdrant/qdrant.service';
import { ProductsService } from '../products/products.service';
import { Product } from '../products/entities/product.entity';

export interface RagSearchResult {
  answer: string;
  products: Array<{
    id: number;
    name: string;
    brand: string;
    category: string;
    price: number;
    description: string | null;
  }>;
  sources: Array<{ productId: number; score: number }>;
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private readonly ollamaService: OllamaService,
    private readonly qdrantService: QdrantService,
    private readonly productsService: ProductsService,
  ) {}

  async search(query: string, limit: number = 5): Promise<RagSearchResult> {
    this.logger.debug(`RAG search: "${query}" (limit: ${limit})`);

    const queryVector = await this.ollamaService.embed(query);
    const matches = await this.qdrantService.searchVectors(queryVector, limit);

    if (matches.length === 0) {
      return {
        answer: "I couldn't find any relevant products. Could you rephrase your question?",
        products: [],
        sources: [],
      };
    }

    const productIds = matches.map((m) => m.productId);
    const products = await this.productsService.findByIds(productIds);

    const orderedProducts = productIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => !!p);

    const context = this.buildContext(orderedProducts);
    const prompt = this.buildPrompt(query, context);
    const answer = await this.ollamaService.generate(prompt);

    return {
      answer,
      products: orderedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        category: Array.isArray(p.categories)
          ? p.categories.map((c) => c.name).join(', ')
          : '',
        price: Number(p.price),
        description: p.description || null,
      })),
      sources: matches.map((m) => ({
        productId: m.productId,
        score: m.score,
      })),
    };
  }

  private buildContext(products: Product[]): string {
    return products
      .map((p) => {
        const category = Array.isArray(p.categories)
          ? p.categories.map((c) => c.name).join(', ')
          : 'General';

        return `Product: ${p.name} (${p.brand}) — ${category} — ${p.price} MAD\nDescription: ${p.description || 'N/A'}`;
      })
      .join('\n---\n');
  }

  private buildPrompt(question: string, context: string): string {
    return `You are a helpful shopping assistant for GTel Store, a tech electronics store in Morocco.
You help customers find products, compare options, and make buying decisions.
Answer in the same language the customer uses (Arabic, French, English, etc.).
Be friendly, concise, and accurate. Always mention prices in MAD.

Available Products:
${context}

Customer Question: ${question}

Assistant Answer:`;
  }
}