import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

@Controller('products')
export class ProductsController {

    constructor(
        private readonly productsService: ProductsService
    ) {

    }

    @Get()
    async findAll() {
        return this.productsService.findAll();
    }

    @Get('landing')
    async getLanding(): Promise<Record<string, Product[]>> {
        
        return this.productsService.findForLanding(30);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(id,);
    }
}
