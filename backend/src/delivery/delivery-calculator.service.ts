import { Injectable, Logger } from '@nestjs/common';
import { GeocodingService } from '../geocoding/geocoding.service';
import { CityBoundariesService } from '../city-boundaries/city-boundaries.service';
import { StoresService } from '../stores/stores.service';
import { InventoryService } from '../inventory/inventory.service';
import { DeliverySettingsService } from '../delivery-settings/delivery-settings.service';
import { ProductsService } from '../products/products.service';
import { CitiesService } from '../cities/cities.service';
import { RoutingService } from '../routing/routing.service';

interface CartItem {
  productId: number;
  quantity: number;
}

interface CalculateRequest {
  address: string;
  cityId: number;
  clientType?: string; // 'standard' | 'vip' | 'wholesale' | 'partner'
  cart?: CartItem[];
}

@Injectable()
export class DeliveryCalculatorService {
  private readonly logger = new Logger(DeliveryCalculatorService.name);

  constructor(
    private readonly geocodingService: GeocodingService,
    private readonly cityBoundariesService: CityBoundariesService,
    private readonly storesService: StoresService,
    private readonly inventoryService: InventoryService,
    private readonly deliverySettingsService: DeliverySettingsService,
    private readonly productsService: ProductsService,
    private readonly citiesService: CitiesService,
    private readonly routingService: RoutingService,
  ) {}

  async calculate(request: CalculateRequest) {
    const { address, cityId, clientType = 'standard', cart = [] } = request;

    // 1. Геокодирование
    const coords = await this.geocodingService.geocode(address);

    // 2. Получаем город
    const city = await this.citiesService.findOne(cityId);

    // 3. Проверяем, внутри ли контура города
    const isInsideCity = await this.cityBoundariesService.isPointInsideCity(
      cityId,
      coords.lng,
      coords.lat,
    );

    // 4. Получаем все настройки города
    const settings = await this.deliverySettingsService.getAllSettings(cityId);
    if (!settings.rate) {
      return { error: 'Тарифы для данного города не настроены' };
    }

    // 5. Получаем все ТТ города
    const stores = await this.storesService.findByCityId(cityId);
    if (stores.length === 0) {
      return { error: 'Нет активных торговых точек в данном городе' };
    }

    // 6. Находим ближайшую ТТ (по прямой — Haversine для предварительного выбора)
    let nearestStore = stores[0];
    let minLinearDist = Infinity;
    for (const store of stores) {
      const dist = this.haversineDistance(coords.lat, coords.lng, store.lat, store.lng);
      if (dist < minLinearDist) {
        minLinearDist = dist;
        nearestStore = store;
      }
    }

    // 7. Расчёт расстояния по дорогам через Yandex Router API
    let distanceKm: number;
    let durationMinutes: number | null = null;

    const routeResult = await this.routingService.getRouteDistance(
      nearestStore.lat, nearestStore.lng,
      coords.lat, coords.lng,
    );

    if (routeResult) {
      distanceKm = routeResult.distanceKm;
      durationMinutes = routeResult.durationMinutes;
      this.logger.log(`Yandex Router: ${distanceKm} km, ${durationMinutes} min`);
    } else {
      // Fallback: прямая × 1.3
      distanceKm = Math.round(minLinearDist * 1.3 * 10) / 10;
      this.logger.warn(`Fallback to haversine*1.3: ${distanceKm} km`);
    }

    // 8. Проверка ограничения 200 км
    if (distanceKm > 200) {
      return {
        address: coords,
        city: { id: city.id, name: city.name },
        isInsideCity,
        nearestStore: { id: nearestStore.id, name: nearestStore.name, distanceKm },
        distanceKm,
        manualCalculation: true,
        message: 'Расстояние превышает 200 км. Стоимость рассчитывается менеджером вручную.',
      };
    }

    // 9. Анализ корзины
    const cartAnalysis = await this.analyzeCart(cart, cityId, stores, nearestStore.id, settings);

    // 10. Определяем класс машины → Kweight и Pweight_min
    const vehicleCategory = this.selectVehicleCategory(
      cartAnalysis.totalWeight,
      cartAnalysis.totalVolume,
      settings.vehicleCategories,
    );

    const kWeight = vehicleCategory ? Number(vehicleCategory.kWeight) : 1.0;

    // Минимальная цена для данного веса
    const pWeightMin = this.getMinPrice(
      cartAnalysis.totalWeight,
      settings.rate.minPrices || [],
    );

    // 11. Коэффициент удалённости Kdist
    const kDist = this.getDistanceCoefficient(distanceKm, settings.distanceCoefficients);

    // 12. Коэффициент типа клиента D_client_type
    const dClientType = this.getClientDiscount(
      clientType,
      cartAnalysis.totalPrice,
      cartAnalysis.totalWeight,
      settings.clientDiscounts,
    );

    // 13. Коэффициент сбора (если товары на разных ТТ)
    const kCollect = cartAnalysis.needsCollecting ? Number(settings.rate.kCollect) : 1.0;

    // 14. ФОРМУЛА: P_delivery = P_km × N_km × K_dist × K_weight × D_client_type × K_collect
    const pricePerKm = Number(settings.rate.pricePerKm);
    let pDelivery = pricePerKm * distanceKm * kDist * kWeight * dClientType * kCollect;
    pDelivery = Math.round(pDelivery);

    // 15. Проверка минимума (только в черте города)
    const standardPrice = isInsideCity ? Math.max(pDelivery, pWeightMin) : pDelivery;

    // 16. Расчёт других типов доставки
    const rate = settings.rate;
    const now = new Date();
    const nowKrsk = this.toKrasnoyarskTime(now);
    const currentHHMM = `${String(nowKrsk.getHours()).padStart(2, '0')}:${String(nowKrsk.getMinutes()).padStart(2, '0')}`;

    // День в день
    const dayInDayAvailable = isInsideCity &&
      !cartAnalysis.needsCollecting &&
      !cartAnalysis.hasBackorder &&
      currentHHMM < rate.dayInDayCutoffTime;

    // Точно ко времени
    const exactTimeAvailable = isInsideCity &&
      !cartAnalysis.needsCollecting &&
      !cartAnalysis.hasBackorder;

    // Экспресс
    const expressAvailable = isInsideCity &&
      !cartAnalysis.needsCollecting &&
      !cartAnalysis.hasBackorder &&
      currentHHMM >= rate.expressAvailableFrom &&
      currentHHMM <= rate.expressAvailableTo;

    const delivery = {
      standard: {
        price: pDelivery,
        minPrice: pWeightMin,
        finalPrice: standardPrice,
      },
      dayInDay: {
        price: Math.round(standardPrice * Number(rate.kDayInDay)),
        available: dayInDayAvailable,
        reason: !dayInDayAvailable
          ? cartAnalysis.needsCollecting
            ? 'Товары на разных ТТ'
            : cartAnalysis.hasBackorder
              ? 'Есть товары под заказ'
              : !isInsideCity
                ? 'Адрес за пределами города'
                : `Приём заказов до ${rate.dayInDayCutoffTime}`
          : null,
      },
      exactTime: {
        price: Math.round(standardPrice * Number(rate.kExactTime)),
        available: exactTimeAvailable,
        reason: !exactTimeAvailable
          ? !isInsideCity
            ? 'Адрес за пределами города'
            : cartAnalysis.needsCollecting
              ? 'Товары на разных ТТ'
              : 'Есть товары под заказ'
          : null,
      },
      express: {
        price: Math.round(standardPrice * Number(rate.kExpress)),
        available: expressAvailable,
        reason: !expressAvailable
          ? !isInsideCity
            ? 'Адрес за пределами города'
            : cartAnalysis.needsCollecting
              ? 'Товары на разных ТТ'
              : cartAnalysis.hasBackorder
                ? 'Есть товары под заказ'
                : `Доступно с ${rate.expressAvailableFrom} до ${rate.expressAvailableTo}`
          : null,
        hours: rate.expressHours,
      },
    };

    // 17. Доступные даты
    const availableDates = this.calculateAvailableDates(
      rate,
      cartAnalysis,
      nowKrsk,
    );

    // Предупреждения
    const warnings: string[] = [];
    if (cartAnalysis.needsCollecting) {
      warnings.push(`Товары будут собраны с разных ТТ — доставка +${rate.collectDelayDays} дня`);
    }
    if (cartAnalysis.hasBackorder) {
      warnings.push(`Часть товаров под заказ (ожидание ~${cartAnalysis.maxSupplyDays} дней)`);
    }
    if (!isInsideCity) {
      warnings.push('Адрес за пределами городской черты — доступна только стандартная доставка');
    }

    return {
      address: coords,
      city: { id: city.id, name: city.name },
      isInsideCity,
      nearestStore: {
        id: nearestStore.id,
        name: nearestStore.name,
        distanceKm: Math.round(minLinearDist * 10) / 10,
        address: nearestStore.address,
        lng: nearestStore.lng,
        lat: nearestStore.lat,
      },
      distanceKm,
      durationMinutes,
      cart: cartAnalysis,
      vehicleCategory: vehicleCategory
        ? { maxWeight: vehicleCategory.maxWeight, maxVolume: Number(vehicleCategory.maxVolume), kWeight }
        : null,
      coefficients: {
        pricePerKm,
        kDist,
        kWeight,
        dClientType,
        kCollect,
        pWeightMin,
      },
      delivery,
      availableDates,
      warnings,
    };
  }

  // === Анализ корзины ===
  private async analyzeCart(
    cart: CartItem[],
    cityId: number,
    stores: any[],
    nearestStoreId: number,
    settings: any,
  ) {
    if (cart.length === 0) {
      return {
        totalWeight: 0,
        totalVolume: 0,
        totalPrice: 0,
        maxItemLength: 0,
        items: [],
        allInOneStore: true,
        needsCollecting: false,
        hasBackorder: false,
        maxSupplyDays: 0,
      };
    }

    const productIds = cart.map((c) => c.productId);
    const products = await this.productsService.findByIds(productIds);

    let totalWeight = 0;
    let totalVolume = 0;
    let totalPrice = 0;
    let maxItemLength = 0;
    let hasBackorder = false;
    let maxSupplyDays = 0;

    const items = cart.map((cartItem) => {
      const product = products.find((p) => p.id === cartItem.productId);
      if (!product) return null;

      const w = Number(product.weight) * cartItem.quantity;
      const v = Number(product.volume) * cartItem.quantity;
      const p = Number(product.price) * cartItem.quantity;

      totalWeight += w;
      totalVolume += v;
      totalPrice += p;
      if (product.length > maxItemLength) maxItemLength = product.length;

      if (product.supplyDays !== null) {
        hasBackorder = true;
        const days = product.supplyDays || settings.rate?.defaultSupplyDays || 10;
        if (days > maxSupplyDays) maxSupplyDays = days;
      }

      return {
        productId: product.id,
        sku: product.sku,
        name: product.name,
        quantity: cartItem.quantity,
        weight: w,
        volume: v,
        price: p,
        length: product.length,
        isFreeLift: product.isFreeLift,
      };
    }).filter(Boolean);

    // Проверяем наличие на ближайшей ТТ
    const storeIds = stores.map((s) => s.id);
    const availabilityMap = await this.inventoryService.findAvailableStoresForProducts(storeIds, productIds);

    let allInOneStore = true;
    let needsCollecting = false;

    for (const productId of productIds) {
      const availableStores = availabilityMap.get(productId) || [];
      if (!availableStores.includes(nearestStoreId)) {
        allInOneStore = false;
        if (availableStores.length > 0) {
          needsCollecting = true;
        }
      }
    }

    return {
      totalWeight: Math.round(totalWeight * 100) / 100,
      totalVolume: Math.round(totalVolume * 1000) / 1000,
      totalPrice: Math.round(totalPrice * 100) / 100,
      maxItemLength,
      items,
      allInOneStore,
      needsCollecting,
      hasBackorder,
      maxSupplyDays,
    };
  }

  // === Haversine distance in km ===
  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // === Выбор класса машины ===
  private selectVehicleCategory(totalWeight: number, totalVolume: number, categories: any[]) {
    if (categories.length === 0) return null;
    // Сортируем по maxWeight и выбираем минимальную подходящую
    const sorted = [...categories].sort((a, b) => a.maxWeight - b.maxWeight);
    for (const cat of sorted) {
      if (totalWeight <= cat.maxWeight && totalVolume <= Number(cat.maxVolume)) {
        return cat;
      }
    }
    // Если ничего не подходит — берём максимальную
    return sorted[sorted.length - 1];
  }

  // === Минимальная цена доставки для веса ===
  private getMinPrice(totalWeight: number, minPrices: Array<{ maxWeight: number; minPrice: number }>): number {
    if (minPrices.length === 0) return 0;
    const sorted = [...minPrices].sort((a, b) => a.maxWeight - b.maxWeight);
    for (const mp of sorted) {
      if (totalWeight <= mp.maxWeight) return mp.minPrice;
    }
    return sorted[sorted.length - 1].minPrice;
  }

  // === Коэффициент удалённости ===
  private getDistanceCoefficient(distanceKm: number, coefficients: any[]): number {
    if (coefficients.length === 0) return 1.0;
    const sorted = [...coefficients].sort((a, b) => a.maxDistanceKm - b.maxDistanceKm);
    for (const dc of sorted) {
      if (distanceKm <= dc.maxDistanceKm) return Number(dc.coefficient);
    }
    return Number(sorted[sorted.length - 1].coefficient);
  }

  // === Скидка клиента ===
  private getClientDiscount(
    clientType: string,
    totalPrice: number,
    totalWeight: number,
    discounts: any[],
  ): number {
    const applicable = discounts
      .filter((d) => d.clientType === clientType && totalPrice >= Number(d.minOrderAmount))
      .filter((d) => d.maxOrderWeight === null || totalWeight <= d.maxOrderWeight)
      .sort((a, b) => Number(b.minOrderAmount) - Number(a.minOrderAmount));

    if (applicable.length === 0) return 1.0;
    return 1 - applicable[0].discountPercent / 100;
  }

  // === Красноярское время ===
  private toKrasnoyarskTime(date: Date): Date {
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    return new Date(utc + 7 * 3600000); // UTC+7
  }

  // === Доступные даты ===
  private calculateAvailableDates(rate: any, cartAnalysis: any, now: Date) {
    const dates: Array<{ date: string; intervals: string[]; slotsLeft: number; isToday?: boolean }> = [];
    const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Определяем первый день доставки
    let startOffset = 0; // Сегодня

    // Если заказ после cutoff — завтра
    if (currentHHMM >= rate.standardOrderCutoffTime) {
      startOffset = 1;
    }

    // Добавляем задержку на сборку между ТТ
    if (cartAnalysis.needsCollecting) {
      startOffset += rate.collectDelayDays;
    }

    // Добавляем дни ожидания "под заказ"
    if (cartAnalysis.hasBackorder) {
      startOffset += cartAnalysis.maxSupplyDays;
    }

    const blockedDays = new Set((rate.blockedWeekdays || []).map(Number));
    const intervals = (rate.deliveryIntervals || []).map(
      (i: any) => `${i.from}-${i.to}`,
    );

    let addedDays = 0;
    let dayOffset = startOffset;
    const maxDays = Number(rate.planningHorizonDays) || 12;

    while (addedDays < maxDays && dayOffset < startOffset + 60) {
      const date = new Date(now);
      date.setDate(date.getDate() + dayOffset);

      const weekday = date.getDay(); // 0=Sun

      if (!blockedDays.has(weekday)) {
        const dateStr = date.toISOString().split('T')[0];
        const isToday = dayOffset === 0;

        let dayIntervals = intervals;

        if (isToday) {
          // Сегодня — показываем только интервалы, которые ещё не начались
          dayIntervals = intervals.filter((i: string) => {
            const from = i.split('-')[0];
            return from > currentHHMM;
          });
          // Если все интервалы уже прошли — пропускаем сегодня
          if (dayIntervals.length === 0) {
            dayOffset++;
            continue;
          }
        }

        dates.push({
          date: dateStr,
          intervals: dayIntervals,
          slotsLeft: Math.max(0, rate.maxDeliveriesPerDay - Math.floor(Math.random() * 50)),
          isToday,
        });
        addedDays++;
      }

      dayOffset++;
    }

    return dates;
  }
}
