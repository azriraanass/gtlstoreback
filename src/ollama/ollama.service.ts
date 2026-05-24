import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly host: string;
  private readonly embedModel: string;
  private readonly llmModel: string;

  constructor(private readonly configService: ConfigService) {
    this.host = this.configService.get<string>('OLLAMA_HOST', 'http://localhost:11434');
    this.embedModel = this.configService.get<string>('OLLAMA_EMBED_MODEL', 'nomic-embed-text');
    this.llmModel = this.configService.get<string>('OLLAMA_LLM_MODEL', 'llama3');
  }

  async embed(text: string): Promise<number[]> {
    const response = await fetch(`${this.host}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.embedModel, prompt: text }),
    });

    if (!response.ok) {
      throw new Error(`Ollama embedding failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding;
  }

  async generate(prompt: string): Promise<string> {
    this.logger.debug(`Generating completion with model: ${this.llmModel}`);

    const response = await fetch(`${this.host}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.llmModel, prompt, stream: false }),
    });

    if (!response.ok) {
      throw new Error(`Ollama generation failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  }
}