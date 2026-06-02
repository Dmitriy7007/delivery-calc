import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Product> {
    return this.productRepository.findOneByOrFail({ id });
  }

  async findByIds(ids: number[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    return this.productRepository.findBy({ id: In(ids) });
  }
}
