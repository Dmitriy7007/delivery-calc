import { Module } from '@nestjs/common';
import { DeliveryController } from './delivery.controller';
import { DeliveryCalculatorService } from './delivery-calculator.service';
import { GeocodingModule } from '../geocoding/geocoding.module';
import { CityBoundariesModule } from '../city-boundaries/city-boundaries.module';
import { StoresModule } from '../stores/stores.module';
import { InventoryModule } from '../inventory/inventory.module';
import { DeliverySettingsModule } from '../delivery-settings/delivery-settings.module';
import { ProductsModule } from '../products/products.module';
import { CitiesModule } from '../cities/cities.module';
import { RoutingModule } from '../routing/routing.module';

@Module({
  imports: [
    GeocodingModule,
    CityBoundariesModule,
    StoresModule,
    InventoryModule,
    DeliverySettingsModule,
    ProductsModule,
    CitiesModule,
    RoutingModule,
  ],
  controllers: [DeliveryController],
  providers: [DeliveryCalculatorService],
})
export class DeliveryModule {}
