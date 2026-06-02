import { Controller, Get, Query } from '@nestjs/common';
import { GeocodingService } from './geocoding.service';

@Controller('geocoding')
export class GeocodingController {
  constructor(private readonly geocodingService: GeocodingService) {}

  @Get()
  geocode(@Query('address') address: string) {
    return this.geocodingService.geocode(address);
  }

  @Get('suggest')
  suggest(@Query('query') query: string) {
    return this.geocodingService.suggest(query);
  }
}
