import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityBoundary } from './entities/city-boundary.entity';
import { CityBoundariesService } from './city-boundaries.service';
import { CityBoundariesController } from './city-boundaries.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CityBoundary])],
  controllers: [CityBoundariesController],
  providers: [CityBoundariesService],
  exports: [CityBoundariesService],
})
export class CityBoundariesModule {}
