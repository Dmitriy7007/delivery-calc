import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { City } from '../cities/entities/city.entity';
import { Store } from '../stores/entities/store.entity';
import { Product } from '../products/entities/product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { DeliveryRate } from '../delivery-settings/entities/delivery-rate.entity';
import { DistanceCoefficient } from '../delivery-settings/entities/distance-coefficient.entity';
import { VehicleCategory } from '../delivery-settings/entities/vehicle-category.entity';
import { ClientDiscount } from '../delivery-settings/entities/client-discount.entity';
import { LiftingTariff } from '../delivery-settings/entities/lifting-tariff.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      City,
      Store,
      Product,
      Inventory,
      DeliveryRate,
      DistanceCoefficient,
      VehicleCategory,
      ClientDiscount,
      LiftingTariff,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
