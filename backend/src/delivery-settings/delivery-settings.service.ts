import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryRate } from './entities/delivery-rate.entity';
import { DistanceCoefficient } from './entities/distance-coefficient.entity';
import { VehicleCategory } from './entities/vehicle-category.entity';
import { ClientDiscount } from './entities/client-discount.entity';
import { LiftingTariff } from './entities/lifting-tariff.entity';

@Injectable()
export class DeliverySettingsService {
  constructor(
    @InjectRepository(DeliveryRate)
    private readonly rateRepo: Repository<DeliveryRate>,
    @InjectRepository(DistanceCoefficient)
    private readonly distRepo: Repository<DistanceCoefficient>,
    @InjectRepository(VehicleCategory)
    private readonly vehicleRepo: Repository<VehicleCategory>,
    @InjectRepository(ClientDiscount)
    private readonly discountRepo: Repository<ClientDiscount>,
    @InjectRepository(LiftingTariff)
    private readonly liftRepo: Repository<LiftingTariff>,
  ) {}

  // === Aggregated settings for a city ===
  async getAllSettings(cityId: number) {
    const [rate, distanceCoefficients, vehicleCategories, clientDiscounts, liftingTariff] =
      await Promise.all([
        this.rateRepo.findOneBy({ cityId }),
        this.distRepo.find({ where: { cityId }, order: { maxDistanceKm: 'ASC' } }),
        this.vehicleRepo.find({ where: { cityId }, order: { maxWeight: 'ASC' } }),
        this.discountRepo.find({ where: { cityId }, order: { clientType: 'ASC', minOrderAmount: 'ASC' } }),
        this.liftRepo.findOneBy({ cityId }),
      ]);

    return { rate, distanceCoefficients, vehicleCategories, clientDiscounts, liftingTariff };
  }

  // === DeliveryRate ===
  async getRate(cityId: number): Promise<DeliveryRate> {
    const rate = await this.rateRepo.findOneBy({ cityId });
    if (!rate) throw new NotFoundException(`DeliveryRate for city ${cityId} not found`);
    return rate;
  }

  async updateRate(cityId: number, dto: Partial<DeliveryRate>): Promise<DeliveryRate> {
    let rate = await this.rateRepo.findOneBy({ cityId });
    if (!rate) {
      rate = this.rateRepo.create({ cityId, ...dto });
    } else {
      Object.assign(rate, dto);
    }
    return this.rateRepo.save(rate);
  }

  // === DistanceCoefficients ===
  async getDistanceCoefficients(cityId: number): Promise<DistanceCoefficient[]> {
    return this.distRepo.find({ where: { cityId }, order: { maxDistanceKm: 'ASC' } });
  }

  async createDistanceCoefficient(cityId: number, dto: { maxDistanceKm: number; coefficient: number }): Promise<DistanceCoefficient> {
    const dc = this.distRepo.create({ cityId, ...dto });
    return this.distRepo.save(dc);
  }

  async updateDistanceCoefficient(id: number, dto: Partial<DistanceCoefficient>): Promise<DistanceCoefficient> {
    const dc = await this.distRepo.findOneByOrFail({ id });
    Object.assign(dc, dto);
    return this.distRepo.save(dc);
  }

  async removeDistanceCoefficient(id: number): Promise<void> {
    await this.distRepo.delete(id);
  }

  // === VehicleCategories ===
  async getVehicleCategories(cityId: number): Promise<VehicleCategory[]> {
    return this.vehicleRepo.find({ where: { cityId }, order: { maxWeight: 'ASC' } });
  }

  async createVehicleCategory(cityId: number, dto: Partial<VehicleCategory>): Promise<VehicleCategory> {
    const vc = this.vehicleRepo.create({ cityId, ...dto });
    return this.vehicleRepo.save(vc);
  }

  async updateVehicleCategory(id: number, dto: Partial<VehicleCategory>): Promise<VehicleCategory> {
    const vc = await this.vehicleRepo.findOneByOrFail({ id });
    Object.assign(vc, dto);
    return this.vehicleRepo.save(vc);
  }

  async removeVehicleCategory(id: number): Promise<void> {
    await this.vehicleRepo.delete(id);
  }

  // === ClientDiscounts ===
  async getClientDiscounts(cityId: number): Promise<ClientDiscount[]> {
    return this.discountRepo.find({ where: { cityId }, order: { clientType: 'ASC', minOrderAmount: 'ASC' } });
  }

  async createClientDiscount(cityId: number, dto: Partial<ClientDiscount>): Promise<ClientDiscount> {
    const cd = this.discountRepo.create({ cityId, ...dto });
    return this.discountRepo.save(cd);
  }

  async updateClientDiscount(id: number, dto: Partial<ClientDiscount>): Promise<ClientDiscount> {
    const cd = await this.discountRepo.findOneByOrFail({ id });
    Object.assign(cd, dto);
    return this.discountRepo.save(cd);
  }

  async removeClientDiscount(id: number): Promise<void> {
    await this.discountRepo.delete(id);
  }

  // === LiftingTariff ===
  async getLiftingTariff(cityId: number): Promise<LiftingTariff | null> {
    return this.liftRepo.findOneBy({ cityId });
  }

  async updateLiftingTariff(cityId: number, dto: Partial<LiftingTariff>): Promise<LiftingTariff> {
    let lt = await this.liftRepo.findOneBy({ cityId });
    if (!lt) {
      lt = this.liftRepo.create({ cityId, ...dto });
    } else {
      Object.assign(lt, dto);
    }
    return this.liftRepo.save(lt);
  }
}
