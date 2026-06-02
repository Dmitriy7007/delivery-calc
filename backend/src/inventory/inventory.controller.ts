import { Controller, Get, Patch, Query, Param, Body, ParseIntPipe } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(@Query('storeId') storeId?: number, @Query('productId') productId?: number) {
    return this.inventoryService.findAll(storeId, productId);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: { quantity: number }) {
    return this.inventoryService.update(id, dto.quantity);
  }
}
