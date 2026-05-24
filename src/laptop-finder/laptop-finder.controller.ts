import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { LaptopFinderService, PaginatedLaptops } from './laptop-finder.service';

@Controller('laptop-finder')
export class LaptopFinderController {

  constructor(private readonly laptopFinderService: LaptopFinderService) {}

  /**
   * GET /laptop-finder?page=1&limit=16
   *
   * Returns:
   * {
   *   data:       Product[],
   *   total:      number,   ← total laptops in DB
   *   page:       number,   ← current page
   *   limit:      number,   ← items per page
   *   totalPages: number    ← Math.ceil(total / limit)
   * }
   */
  @Get()
  getLaptops(
    @Query('page',  new DefaultValuePipe(1),  ParseIntPipe) page:  number,
    @Query('limit', new DefaultValuePipe(16), ParseIntPipe) limit: number,
  ): Promise<PaginatedLaptops> {
    return this.laptopFinderService.getLaptops(page, limit);
  }
}