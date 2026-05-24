import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { GroqModule } from '../groq/groq.module';

@Module({
  imports: [GroqModule],
  providers: [ChatbotService],
  controllers: [ChatbotController],
})
export class ChatbotModule {}