import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  async findAll(storeId?: number, productId?: number): Promise<Inventory[]> {
    const where: any = {};
    if (storeId !== undefined) where.storeId = storeId;
    if (productId !== undefined) where.productId = productId;
    return this.inventoryRepository.find({
      where,
      relations: { product: true, store: true },
    });
  }

  async findByStoreAndProducts(storeId: number, productIds: number[]): Promise<Inventory[]> {
    return this.inventoryRepository
      .createQueryBuilder('inv')
      .where('inv."storeId" = :storeId', { storeId })
      .andWhere('inv."productId" IN (:...productIds)', { productIds })
      .andWhere('inv.quantity > 0')
      .getMany();
  }

  async findAvailableStoresForProducts(
    cityStoreIds: number[],
    productIds: number[],
  ): Promise<Map<number, number[]>> {
    // Returns map: productId -> [storeId, storeId, ...]
    const inventories = await this.inventoryRepository
      .createQueryBuilder('inv')
      .where('inv."storeId" IN (:...storeIds)', { storeIds: cityStoreIds })
      .andWhere('inv."productId" IN (:...productIds)', { productIds })
      .andWhere('inv.quantity > 0')
      .getMany();

    const result = new Map<number, number[]>();
    for (const inv of inventories) {
      if (!result.has(inv.productId)) {
        result.set(inv.productId, []);
      }
      result.get(inv.productId)!.push(inv.storeId);
    }
    return result;
  }

  async update(id: number, quantity: number): Promise<Inventory> {
    const inv = await this.inventoryRepository.findOneByOrFail({ id });
    inv.quantity = quantity;
    return this.inventoryRepository.save(inv);
  }
}
