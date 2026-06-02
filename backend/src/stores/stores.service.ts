import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto, UpdateStoreDto } from './dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async create(dto: CreateStoreDto): Promise<Store> {
    const store = this.storeRepository.create(dto);
    return this.storeRepository.save(store);
  }

  async findAll(cityId?: number): Promise<Store[]> {
    const where: any = {};
    if (cityId !== undefined) where.cityId = cityId;
    return this.storeRepository.find({ where, order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Store> {
    const store = await this.storeRepository.findOneBy({ id });
    if (!store) throw new NotFoundException(`Store ${id} not found`);
    return store;
  }

  async update(id: number, dto: UpdateStoreDto): Promise<Store> {
    const store = await this.findOne(id);
    Object.assign(store, dto);
    return this.storeRepository.save(store);
  }

  async remove(id: number): Promise<void> {
    const store = await this.findOne(id);
    await this.storeRepository.remove(store);
  }

  async findByCityId(cityId: number): Promise<Store[]> {
    return this.storeRepository.find({
      where: { cityId, isActive: true },
      order: { name: 'ASC' },
    });
  }
}
