import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../cities/entities/city.entity';
import { Store } from '../stores/entities/store.entity';
import { Product } from '../products/entities/product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { DeliveryRate } from '../delivery-settings/entities/delivery-rate.entity';
import { DistanceCoefficient } from '../delivery-settings/entities/distance-coefficient.entity';
import { VehicleCategory } from '../delivery-settings/entities/vehicle-category.entity';
import { ClientDiscount } from '../delivery-settings/entities/client-discount.entity';
import { LiftingTariff } from '../delivery-settings/entities/lifting-tariff.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(City) private cityRepo: Repository<City>,
    @InjectRepository(Store) private storeRepo: Repository<Store>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Inventory) private inventoryRepo: Repository<Inventory>,
    @InjectRepository(DeliveryRate) private rateRepo: Repository<DeliveryRate>,
    @InjectRepository(DistanceCoefficient) private distRepo: Repository<DistanceCoefficient>,
    @InjectRepository(VehicleCategory) private vehicleRepo: Repository<VehicleCategory>,
    @InjectRepository(ClientDiscount) private discountRepo: Repository<ClientDiscount>,
    @InjectRepository(LiftingTariff) private liftRepo: Repository<LiftingTariff>,
  ) {}

  async onModuleInit() {
    const cityCount = await this.cityRepo.count();
    if (cityCount > 0) {
      this.logger.log('Seed data already exists, skipping...');
      return;
    }
    this.logger.log('Seeding database...');
    await this.seed();
    this.logger.log('Seed complete!');
  }

  private async seed() {
    // === Cities ===
    const cities = await this.cityRepo.save([
      { name: 'Новокузнецк', geocenterLng: 87.1152, geocenterLat: 53.7596, defaultZoom: 12 },
      { name: 'Кемерово', geocenterLng: 86.0880, geocenterLat: 55.3546, defaultZoom: 12 },
      { name: 'Мыски', geocenterLng: 87.8023, geocenterLat: 53.7072, defaultZoom: 13 },
    ]);
    const [novokuznetsk, kemerovo, myski] = cities;

    // === Stores ===
    const stores = await this.storeRepo.save([
      { name: 'Магазин Кондомское ш. 3', address: 'г. Новокузнецк, ш. Кондомское, 3', cityId: novokuznetsk.id, lng: 87.14, lat: 53.78, type: 'store' },
      { name: 'Склад Полесская 15', address: 'г. Новокузнецк, ул. Полесская, 15', cityId: novokuznetsk.id, lng: 87.10, lat: 53.74, type: 'warehouse' },
      { name: 'Магазин Октябрьский пр. 51', address: 'г. Кемерово, пр. Октябрьский, 51', cityId: kemerovo.id, lng: 86.09, lat: 55.35, type: 'store' },
      { name: 'Склад Нахимова 10', address: 'г. Кемерово, ул. Нахимова, 10', cityId: kemerovo.id, lng: 86.07, lat: 55.37, type: 'warehouse' },
      { name: 'Магазин Советская 20', address: 'г. Мыски, ул. Советская, 20', cityId: myski.id, lng: 87.80, lat: 53.71, type: 'store' },
      { name: 'Склад Кузнецкая 5', address: 'г. Мыски, ул. Кузнецкая, 5', cityId: myski.id, lng: 87.79, lat: 53.70, type: 'warehouse' },
    ]);

    // === Products ===
    const products = await this.productRepo.save([
      { sku: 'SAM-001', name: 'Саморез ГКЛ SWFS 3.5×35мм (1000 шт)', categoryName: 'Крепёж', weight: 2, volume: 0.002, length: 120, width: 80, height: 60, price: 450, isFreeLift: false },
      { sku: 'LAM-001', name: 'Ламинат Kronotex 8мм (2.13 м²)', categoryName: 'Напольные покрытия', weight: 14, volume: 0.02, length: 1380, width: 193, height: 80, price: 1890, isFreeLift: false },
      { sku: 'PIPE-001', name: 'Труба профильная 60×40 (6 м)', categoryName: 'Металлопрокат', weight: 28, volume: 0.05, length: 6000, width: 60, height: 40, price: 2100, isFreeLift: false },
      { sku: 'BATH-001', name: 'Ванна стальная 170×70', categoryName: 'Сантехника', weight: 38, volume: 0.5, length: 1700, width: 700, height: 400, price: 8500, isFreeLift: false },
      { sku: 'CEMENT-001', name: 'Цемент М500 50 кг', categoryName: 'Сухие смеси', weight: 50, volume: 0.03, length: 600, width: 400, height: 150, price: 550, isFreeLift: false },
      { sku: 'BRICK-001', name: 'Кирпич облицовочный (поддон)', categoryName: 'Кирпич', weight: 1200, volume: 1.2, length: 1200, width: 800, height: 1000, price: 18000, isFreeLift: false },
      { sku: 'PAINT-001', name: 'Краска фасадная 14 кг', categoryName: 'ЛКМ', weight: 14, volume: 0.015, length: 300, width: 300, height: 300, price: 3200, isFreeLift: true },
      { sku: 'DOOR-001', name: 'Дверь межкомнатная 2000×800', categoryName: 'Двери', weight: 25, volume: 0.12, length: 2050, width: 800, height: 80, price: 7800, isFreeLift: false },
      { sku: 'BEAM-001', name: 'Брус клееный 100×100 (6 м)', categoryName: 'Пиломатериалы', weight: 35, volume: 0.06, length: 6000, width: 100, height: 100, price: 4500, isFreeLift: false },
      { sku: 'TILE-001', name: 'Плитка керамическая (1.44 м²)', categoryName: 'Плитка', weight: 22, volume: 0.025, length: 600, width: 600, height: 80, price: 1200, isFreeLift: false },
    ]);

    // === Inventory — distribute across stores for testing ===
    const inventoryData: Array<{ productId: number; storeId: number; quantity: number }> = [];
    for (const product of products) {
      // Новокузнецк store (id=stores[0]) — all products available
      inventoryData.push({ productId: product.id, storeId: stores[0].id, quantity: product.sku === 'BRICK-001' ? 0 : 50 });
      // Новокузнецк warehouse (id=stores[1]) — only heavy items
      inventoryData.push({ productId: product.id, storeId: stores[1].id, quantity: Number(product.weight) > 20 ? 30 : 0 });
      // Кемерово store
      inventoryData.push({ productId: product.id, storeId: stores[2].id, quantity: 40 });
      // Кемерово warehouse
      inventoryData.push({ productId: product.id, storeId: stores[3].id, quantity: Number(product.weight) > 30 ? 20 : 0 });
      // Мыски store — limited
      inventoryData.push({ productId: product.id, storeId: stores[4].id, quantity: product.sku === 'PIPE-001' || product.sku === 'BEAM-001' ? 0 : 25 });
      // Мыски warehouse
      inventoryData.push({ productId: product.id, storeId: stores[5].id, quantity: Number(product.weight) > 25 ? 15 : 0 });
    }
    await this.inventoryRepo.save(inventoryData);

    // === Delivery Rates ===
    await this.rateRepo.save([
      {
        cityId: novokuznetsk.id,
        pricePerKm: 70,
        minPrices: [
          { maxWeight: 450, minPrice: 250 },
          { maxWeight: 1500, minPrice: 600 },
          { maxWeight: 3000, minPrice: 1200 },
          { maxWeight: 5000, minPrice: 2000 },
          { maxWeight: 10000, minPrice: 3500 },
          { maxWeight: 20000, minPrice: 6000 },
        ],
        kDayInDay: 1.5, kExactTime: 2.0, kExpress: 2.5, expressHours: 4,
        kCollect: 1.2, collectDelayDays: 2,
        maxDeliveriesPerDay: 400, planningHorizonDays: 12,
      },
      {
        cityId: kemerovo.id,
        pricePerKm: 80,
        minPrices: [
          { maxWeight: 450, minPrice: 300 },
          { maxWeight: 1500, minPrice: 700 },
          { maxWeight: 3000, minPrice: 1400 },
          { maxWeight: 5000, minPrice: 2300 },
          { maxWeight: 10000, minPrice: 4000 },
          { maxWeight: 20000, minPrice: 7000 },
        ],
        kDayInDay: 1.5, kExactTime: 2.0, kExpress: 2.5, expressHours: 4,
        kCollect: 1.2, collectDelayDays: 2,
        maxDeliveriesPerDay: 350, planningHorizonDays: 10,
      },
      {
        cityId: myski.id,
        pricePerKm: 60,
        minPrices: [
          { maxWeight: 450, minPrice: 200 },
          { maxWeight: 1500, minPrice: 500 },
          { maxWeight: 3000, minPrice: 1000 },
          { maxWeight: 5000, minPrice: 1800 },
          { maxWeight: 10000, minPrice: 3000 },
          { maxWeight: 20000, minPrice: 5000 },
        ],
        kDayInDay: 1.5, kExactTime: 2.0, kExpress: 2.0, expressHours: 6,
        kCollect: 1.15, collectDelayDays: 1,
        maxDeliveriesPerDay: 150, planningHorizonDays: 14,
      },
    ]);

    // === Distance Coefficients (same for all cities) ===
    for (const city of cities) {
      await this.distRepo.save([
        { cityId: city.id, maxDistanceKm: 10, coefficient: 1.0 },
        { cityId: city.id, maxDistanceKm: 20, coefficient: 0.9 },
        { cityId: city.id, maxDistanceKm: 50, coefficient: 0.8 },
        { cityId: city.id, maxDistanceKm: 100, coefficient: 0.7 },
        { cityId: city.id, maxDistanceKm: 200, coefficient: 0.6 },
      ]);
    }

    // === Vehicle Categories (same for all cities) ===
    for (const city of cities) {
      await this.vehicleRepo.save([
        { cityId: city.id, maxWeight: 450, maxVolume: 3, kWeight: 1.0 },
        { cityId: city.id, maxWeight: 1500, maxVolume: 7, kWeight: 1.2 },
        { cityId: city.id, maxWeight: 3000, maxVolume: 15, kWeight: 1.5 },
        { cityId: city.id, maxWeight: 5000, maxVolume: 25, kWeight: 1.8 },
        { cityId: city.id, maxWeight: 10000, maxVolume: 40, kWeight: 2.2 },
        { cityId: city.id, maxWeight: 20000, maxVolume: 60, kWeight: 3.0 },
      ]);
    }

    // === Client Discounts (same for all cities) ===
    for (const city of cities) {
      await this.discountRepo.save([
        { cityId: city.id, clientType: 'standard', minOrderAmount: 10000, maxOrderWeight: 1500, discountPercent: 10 },
        { cityId: city.id, clientType: 'standard', minOrderAmount: 20000, maxOrderWeight: 1500, discountPercent: 50 },
        { cityId: city.id, clientType: 'vip', minOrderAmount: 10000, maxOrderWeight: 3000, discountPercent: 30 },
        { cityId: city.id, clientType: 'vip', minOrderAmount: 20000, maxOrderWeight: 5000, discountPercent: 70 },
        { cityId: city.id, clientType: 'vip', minOrderAmount: 30000, maxOrderWeight: null, discountPercent: 100 },
      ]);
    }

    // === Lifting Tariffs (same for all cities) ===
    for (const city of cities) {
      await this.liftRepo.save({
        cityId: city.id,
        weightStepKg: 100,
        pMinToElevator: 200,
        pMinFromElevatorToRoom: 150,
        pToElevator: 100,
        pFromElevatorToRoom: 80,
        pFloor: 120,
        maxElevatorItemLengthMm: 2500,
      });
    }
  }
}
