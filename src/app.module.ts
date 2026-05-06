import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from '../ormconfig';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CategoryModule } from './category/category.module';


@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [AuthenticationModule, 
    ProductsModule,
    SchedulerModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => config(configService),
    }),
    ConfigModule.forRoot({isGlobal: true}),
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
