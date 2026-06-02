import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { DeliverySettingsService } from './delivery-settings.service';

@Controller('delivery-settings')
export class DeliverySettingsController {
  constructor(private readonly service: DeliverySettingsService) {}

  // === Aggregated ===
  @Get(':cityId')
  getAllSettings(@Param('cityId', ParseIntPipe) cityId: number) {
    return this.service.getAllSettings(cityId);
  }

  // === Rates ===
  @Patch(':cityId/rates')
  updateRate(@Param('cityId', ParseIntPipe) cityId: number, @Body() dto: any) {
    return this.service.updateRate(cityId, dto);
  }

  // === Distance Coefficients ===
  @Get(':cityId/distance-coefficients')
  getDistanceCoefficients(@Param('cityId', ParseIntPipe) cityId: number) {
    return this.service.getDistanceCoefficients(cityId);
  }

  @Post(':cityId/distance-coefficients')
  createDistanceCoefficient(@Param('cityId', ParseIntPipe) cityId: number, @Body() dto: any) {
    return this.service.createDistanceCoefficient(cityId, dto);
  }

  @Patch('distance-coefficients/:id')
  updateDistanceCoefficient(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.service.updateDistanceCoefficient(id, dto);
  }

  @Delete('distance-coefficients/:id')
  removeDistanceCoefficient(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeDistanceCoefficient(id);
  }

  // === Vehicle Categories ===
  @Get(':cityId/vehicle-categories')
  getVehicleCategories(@Param('cityId', ParseIntPipe) cityId: number) {
    return this.service.getVehicleCategories(cityId);
  }

  @Post(':cityId/vehicle-categories')
  createVehicleCategory(@Param('cityId', ParseIntPipe) cityId: number, @Body() dto: any) {
    return this.service.createVehicleCategory(cityId, dto);
  }

  @Patch('vehicle-categories/:id')
  updateVehicleCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.service.updateVehicleCategory(id, dto);
  }

  @Delete('vehicle-categories/:id')
  removeVehicleCategory(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeVehicleCategory(id);
  }

  // === Client Discounts ===
  @Get(':cityId/client-discounts')
  getClientDiscounts(@Param('cityId', ParseIntPipe) cityId: number) {
    return this.service.getClientDiscounts(cityId);
  }

  @Post(':cityId/client-discounts')
  createClientDiscount(@Param('cityId', ParseIntPipe) cityId: number, @Body() dto: any) {
    return this.service.createClientDiscount(cityId, dto);
  }

  @Patch('client-discounts/:id')
  updateClientDiscount(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.service.updateClientDiscount(id, dto);
  }

  @Delete('client-discounts/:id')
  removeClientDiscount(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeClientDiscount(id);
  }

  // === Lifting Tariff ===
  @Get(':cityId/lifting-tariff')
  getLiftingTariff(@Param('cityId', ParseIntPipe) cityId: number) {
    return this.service.getLiftingTariff(cityId);
  }

  @Patch(':cityId/lifting-tariff')
  updateLiftingTariff(@Param('cityId', ParseIntPipe) cityId: number, @Body() dto: any) {
    return this.service.updateLiftingTariff(cityId, dto);
  }
}
