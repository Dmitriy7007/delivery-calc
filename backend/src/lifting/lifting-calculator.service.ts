import { Injectable, Logger } from '@nestjs/common';
import { DeliverySettingsService } from '../delivery-settings/delivery-settings.service';

interface CalculateLiftingRequest {
  cityId: number;
  totalWeight: number;       // кг (общий вес, без учёта isFreeLift товаров)
  maxItemLengthMm: number;   // макс. длина товара в мм
  floor: number;             // номер этажа
  hasElevator: boolean;      // есть ли лифт
  liftType: 'to_entrance' | 'elevator' | 'manual'; // до подъезда / на лифте / без лифта (пешком)
}

@Injectable()
export class LiftingCalculatorService {
  private readonly logger = new Logger(LiftingCalculatorService.name);

  constructor(
    private readonly deliverySettingsService: DeliverySettingsService,
  ) {}

  async calculate(request: CalculateLiftingRequest) {
    const { cityId, totalWeight, maxItemLengthMm, floor, hasElevator, liftType } = request;

    const tariff = await this.deliverySettingsService.getLiftingTariff(cityId);
    if (!tariff) {
      return { error: 'Тарифы подъёма для данного города не настроены' };
    }

    const weightStepKg = tariff.weightStepKg || 100;
    const nWeightCategory = Math.ceil(totalWeight / weightStepKg);

    const pMinToElevator = Number(tariff.pMinToElevator);
    const pMinFromElevatorToRoom = Number(tariff.pMinFromElevatorToRoom);
    const pToElevator = Number(tariff.pToElevator);
    const pFromElevatorToRoom = Number(tariff.pFromElevatorToRoom);
    const pFloor = Number(tariff.pFloor);
    const maxElevatorLength = tariff.maxElevatorItemLengthMm;

    // Проверка ограничения по длине для лифта
    const elevatorBlocked = maxItemLengthMm > maxElevatorLength;
    const effectiveLiftType = (liftType === 'elevator' && elevatorBlocked) ? 'manual' : liftType;

    let price = 0;
    let formula = '';
    const breakdown: Array<{ label: string; value: number }> = [];

    if (totalWeight === 0 || floor <= 0) {
      return {
        price: 0,
        formula: 'Вес = 0 или этаж не указан',
        breakdown: [],
        nWeightCategory: 0,
        elevatorBlocked,
        effectiveLiftType,
      };
    }

    switch (effectiveLiftType) {
      case 'to_entrance': {
        // Доставка только до двери подъезда
        // P = P_MIN_to_elevator + N × P_to_elevator
        const fixedPart = pMinToElevator;
        const variablePart = nWeightCategory * pToElevator;
        price = fixedPart + variablePart;

        breakdown.push({ label: 'Разовая надбавка (до подъезда)', value: fixedPart });
        breakdown.push({ label: `${nWeightCategory} × ${pToElevator}₽ (до подъезда за ед. веса)`, value: variablePart });

        formula = `P = P_MIN_to_elevator + N × P_to_elevator = ${pMinToElevator} + ${nWeightCategory} × ${pToElevator} = ${price}₽`;
        break;
      }

      case 'elevator': {
        // Подъём на лифте (в квартиру)
        // P = P_MIN_to_elevator + P_MIN_from_elevator_to_room + N × (P_to_elevator + P_from_elevator_to_room)
        const fixedPart = pMinToElevator + pMinFromElevatorToRoom;
        const variablePart = nWeightCategory * (pToElevator + pFromElevatorToRoom);
        price = fixedPart + variablePart;

        breakdown.push({ label: 'Разовая: до лифта', value: pMinToElevator });
        breakdown.push({ label: 'Разовая: от лифта до комнаты', value: pMinFromElevatorToRoom });
        breakdown.push({
          label: `${nWeightCategory} × (${pToElevator} + ${pFromElevatorToRoom})₽ (до лифта + от лифта)`,
          value: variablePart,
        });

        formula = `P = ${pMinToElevator} + ${pMinFromElevatorToRoom} + ${nWeightCategory} × (${pToElevator} + ${pFromElevatorToRoom}) = ${price}₽`;
        break;
      }

      case 'manual': {
        // Полный ручной подъём (без лифта)
        // P = P_MIN_to_elevator + P_MIN_from_elevator_to_room + N × (P_to_elevator + P_from_elevator_to_room + P_floor × (N_floor - 1))
        const fixedPart = pMinToElevator + pMinFromElevatorToRoom;
        const floorCost = pFloor * Math.max(0, floor - 1);
        const variablePart = nWeightCategory * (pToElevator + pFromElevatorToRoom + floorCost);
        price = fixedPart + variablePart;

        breakdown.push({ label: 'Разовая: до подъезда', value: pMinToElevator });
        breakdown.push({ label: 'Разовая: до комнаты', value: pMinFromElevatorToRoom });
        breakdown.push({
          label: `${nWeightCategory} × (${pToElevator} + ${pFromElevatorToRoom} + ${pFloor} × ${Math.max(0, floor - 1)})`,
          value: variablePart,
        });

        formula = `P = ${pMinToElevator} + ${pMinFromElevatorToRoom} + ${nWeightCategory} × (${pToElevator} + ${pFromElevatorToRoom} + ${pFloor} × ${Math.max(0, floor - 1)}) = ${price}₽`;
        break;
      }
    }

    return {
      price: Math.round(price),
      formula,
      breakdown,
      nWeightCategory,
      weightStepKg,
      totalWeight,
      floor,
      elevatorBlocked,
      effectiveLiftType,
      liftType,
      tariff: {
        pMinToElevator,
        pMinFromElevatorToRoom,
        pToElevator,
        pFromElevatorToRoom,
        pFloor,
        maxElevatorItemLengthMm: maxElevatorLength,
      },
    };
  }
}
