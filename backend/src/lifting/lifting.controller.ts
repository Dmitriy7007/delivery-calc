import { Controller, Post, Body } from '@nestjs/common';
import { LiftingCalculatorService } from './lifting-calculator.service';

@Controller('lifting')
export class LiftingController {
  constructor(private readonly calculator: LiftingCalculatorService) {}

  @Post('calculate')
  calculate(@Body() dto: {
    cityId: number;
    totalWeight: number;
    maxItemLengthMm: number;
    floor: number;
    hasElevator: boolean;
    liftType: 'to_entrance' | 'elevator' | 'manual';
  }) {
    return this.calculator.calculate(dto);
  }
}
