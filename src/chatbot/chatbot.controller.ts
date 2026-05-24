import { Body, Controller, Post } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { CreateChatCompletionRequest } from './dto/create-chat-completion.request';

@Controller('chatbot')
export class ChatbotController {

    constructor(private readonly chatBotService: ChatbotService) {}

  @Post('chatCompletion')
  async createChatCompletion(@Body() body: CreateChatCompletionRequest) {
    return this.chatBotService.createChatCompletion(body.messages);
  }
}
