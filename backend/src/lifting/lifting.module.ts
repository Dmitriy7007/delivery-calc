import { Module } from '@nestjs/common';
import { LiftingController } from './lifting.controller';
import { LiftingCalculatorService } from './lifting-calculator.service';
import { DeliverySettingsModule } from '../delivery-settings/delivery-settings.module';

@Module({
  imports: [DeliverySettingsModule],
  controllers: [LiftingController],
  providers: [LiftingCalculatorService],
})
export class LiftingModule {}
