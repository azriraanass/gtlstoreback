import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from '../ormconfig';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ChatbotModule } from './chatbot/chatbot.module';
import { LaptopFinderModule } from './laptop-finder/laptop-finder.module';
import { QdrantModule } from './qdrant/qdrant.module';
import { OllamaModule } from './ollama/ollama.module';
import { RagModule } from './rag/rag.module';
import { EventEmitterModule } from '@nestjs/event-emitter';


@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [AuthenticationModule, 
    SchedulerModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => config(configService),
    }),
    ConfigModule.forRoot({isGlobal: true}),
    ScheduleModule.forRoot(),
    ChatbotModule,
    LaptopFinderModule,
    QdrantModule,
    OllamaModule,
    RagModule,
    EventEmitterModule.forRoot(),
  ],
})
export class AppModule {}
