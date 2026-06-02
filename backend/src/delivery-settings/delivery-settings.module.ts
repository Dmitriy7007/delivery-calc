import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryRate } from './entities/delivery-rate.entity';
import { DistanceCoefficient } from './entities/distance-coefficient.entity';
import { VehicleCategory } from './entities/vehicle-category.entity';
import { ClientDiscount } from './entities/client-discount.entity';
import { LiftingTariff } from './entities/lifting-tariff.entity';
import { DeliverySettingsService } from './delivery-settings.service';
import { DeliverySettingsController } from './delivery-settings.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeliveryRate,
      DistanceCoefficient,
      VehicleCategory,
      ClientDiscount,
      LiftingTariff,
    ]),
  ],
  controllers: [DeliverySettingsController],
  providers: [DeliverySettingsService],
  exports: [DeliverySettingsService],
})
export class DeliverySettingsModule {}
