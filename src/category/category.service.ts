import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {

    private readonly logger: Logger;

    constructor(@InjectRepository(Category) private readonly categoryRepository: Repository<Category>) {
        this.logger = new Logger(CategoryService.name);
    }

    async create(category: any): Promise<any> {
        this.logger.debug(`${this.create.name}: Creating category with ID ${category.id}...`);
        return await this.categoryRepository.save(category);
    }
}
