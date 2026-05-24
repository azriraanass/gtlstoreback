import { Injectable, Logger } from '@nestjs/common';
import { GroqService } from '../groq/groq.service';
import { ChatCompletionMessageDto } from './dto/create-chat-completion.request';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(private readonly groqService: GroqService) {}

  async createChatCompletion(messages: ChatCompletionMessageDto[]) {
    this.logger.debug(
      `${this.createChatCompletion.name}: received request with ${messages.length} message(s), last role="${messages.at(-1)?.role}"`,
    );

    const completion = await this.groqService.client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a helpful shopping assistant for GTel Store, a tech electronics store in Morocco.
                  You help customers find products, answer questions about categories (phones, laptops, gaming, audio, TV,
                  networking, security, accessories, storage, peripherals, smart devices, printing), help with orders,
                  and give buying advice. Be friendly, concise, and helpful. Answer in the same language the customer uses.`,
        },
        ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
    });

    this.logger.debug(
      `${this.createChatCompletion.name}: completed — model="${completion.model}" prompt_tokens=${completion.usage?.prompt_tokens} completion_tokens=${completion.usage?.completion_tokens}`,
    );

    return {
      message: completion.choices[0].message.content,
      usage: completion.usage,
    };
  }
}