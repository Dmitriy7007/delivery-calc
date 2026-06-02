import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { CitiesModule } from './cities/cities.module';
import { StoresModule } from './stores/stores.module';
import { CityBoundariesModule } from './city-boundaries/city-boundaries.module';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { DeliverySettingsModule } from './delivery-settings/delivery-settings.module';
import { DeliveryModule } from './delivery/delivery.module';
import { LiftingModule } from './lifting/lifting.module';
import { GeocodingModule } from './geocoding/geocoding.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => databaseConfig(configService),
    }),
    CitiesModule,
    StoresModule,
    CityBoundariesModule,
    ProductsModule,
    InventoryModule,
    DeliverySettingsModule,
    DeliveryModule,
    LiftingModule,
    GeocodingModule,
    SeedModule,
  ],
})
export class AppModule {}
