import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { CityBoundariesService } from './city-boundaries.service';

@Controller('city-boundaries')
export class CityBoundariesController {
  constructor(private readonly service: CityBoundariesService) {}

  @Post()
  create(@Body() dto: { cityId: number; polygon: any; color?: string }) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('cityId') cityId?: number) {
    return this.service.findAll(cityId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { polygon?: any; color?: string; isActive?: boolean },
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Get('check-point')
  async checkPoint(
    @Query('cityId') cityId: number,
    @Query('lng') lng: number,
    @Query('lat') lat: number,
  ) {
    const inside = await this.service.isPointInsideCity(cityId, lng, lat);
    return { cityId, lng, lat, insideCity: inside };
  }
}
