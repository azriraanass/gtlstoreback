import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { WoocommerceModule } from 'src/woocommerce/woocommerce.module';
import { ProductsModule } from 'src/products/products.module';
import { CategoryModule } from 'src/category/category.module';

@Module({
  imports: [WoocommerceModule, ProductsModule, CategoryModule],
  providers: [SyncService],
  exports: [SyncService]
})
export class SyncModule {}
