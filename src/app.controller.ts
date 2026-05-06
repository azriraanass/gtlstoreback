import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { WoocommerceService } from './woocommerce/woocommerce.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
  ) {}

  @Get()
  getHello(): string {
    return "App Controller Here";
  }
}
