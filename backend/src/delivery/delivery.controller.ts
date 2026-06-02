import { Controller, Post, Body } from '@nestjs/common';
import { DeliveryCalculatorService } from './delivery-calculator.service';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly calculator: DeliveryCalculatorService) {}

  @Post('calculate')
  calculate(@Body() dto: {
    address: string;
    cityId: number;
    clientType?: string;
    cart?: Array<{ productId: number; quantity: number }>;
  }) {
    return this.calculator.calculate(dto);
  }
}
