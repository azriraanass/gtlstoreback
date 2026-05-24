import { Module } from '@nestjs/common';
import { LaptopFinderService } from './laptop-finder.service';
import { LaptopFinderController } from './laptop-finder.controller';
import { ProductsModule } from 'src/products/products.module';
import { WoocommerceModule } from 'src/woocommerce/woocommerce.module';

@Module({
  imports:     [ProductsModule, WoocommerceModule],
  providers:   [LaptopFinderService],
  controllers: [LaptopFinderController],
})
export class LaptopFinderModule {}