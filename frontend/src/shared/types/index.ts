import type { Polygon } from 'geojson';

// === Cities ===
export interface City {
  id: number;
  name: string;
  geocenterLng: number;
  geocenterLat: number;
  defaultZoom: number;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

// === Stores ===
export interface Store {
  id: number;
  name: string;
  address: string;
  cityId: number;
  lng: number;
  lat: number;
  type: string;
  workHoursFrom: string;
  workHoursTo: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// === City Boundaries ===
export interface CityBoundary {
  id: number;
  cityId: number;
  polygon: Polygon;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// === Products ===
export interface Product {
  id: number;
  sku: string;
  name: string;
  categoryName: string;
  weight: number;
  volume: number;
  length: number;
  width: number;
  height: number;
  price: number;
  isFreeLift: boolean;
  supplyDays: number | null;
  createdAt: string;
  updatedAt: string;
}

// === Inventory ===
export interface InventoryItem {
  id: number;
  productId: number;
  storeId: number;
  quantity: number;
  product?: Product;
  store?: Store;
}

// === Delivery Settings ===
export interface DeliveryRate {
  id: number;
  cityId: number;
  pricePerKm: number;
  minPrices: Array<{ maxWeight: number; minPrice: number }>;
  kDayInDay: number;
  kExactTime: number;
  kExpress: number;
  expressHours: number;
  kCollect: number;
  collectDelayDays: number;
  dayInDayCutoffTime: string;
  expressAvailableFrom: string;
  expressAvailableTo: string;
  exactTimeDeltaHours: number;
  deliveryIntervals: Array<{ from: string; to: string }>;
  maxDeliveriesPerDay: number;
  planningHorizonDays: number;
  blockedWeekdays: number[];
  standardOrderCutoffTime: string;
  defaultSupplyDays: number;
}

export interface DistanceCoefficient {
  id: number;
  cityId: number;
  maxDistanceKm: number;
  coefficient: number;
}

export interface VehicleCategory {
  id: number;
  cityId: number;
  maxWeight: number;
  maxVolume: number;
  maxSingleItemLength: number;
  maxSingleItemWidth: number;
  maxSingleItemHeight: number;
  kWeight: number;
}

export interface ClientDiscount {
  id: number;
  cityId: number;
  clientType: string;
  minOrderAmount: number;
  maxOrderWeight: number | null;
  discountPercent: number;
}

export interface LiftingTariff {
  id: number;
  cityId: number;
  weightStepKg: number;
  pMinToElevator: number;
  pMinFromElevatorToRoom: number;
  pToElevator: number;
  pFromElevatorToRoom: number;
  pFloor: number;
  maxElevatorItemLengthMm: number;
}

export interface CitySettings {
  rate: DeliveryRate | null;
  distanceCoefficients: DistanceCoefficient[];
  vehicleCategories: VehicleCategory[];
  clientDiscounts: ClientDiscount[];
  liftingTariff: LiftingTariff | null;
}

// === Delivery Calculation Result ===
export interface DeliveryResult {
  address: { lng: number; lat: number; formatted: string };
  city: { id: number; name: string };
  isInsideCity: boolean;
  nearestStore: {
    id: number;
    name: string;
    distanceKm: number;
    address: string;
    lng: number;
    lat: number;
  };
  distanceKm: number;
  durationMinutes: number | null;
  cart: {
    totalWeight: number;
    totalVolume: number;
    totalPrice: number;
    maxItemLength: number;
    items: any[];
    allInOneStore: boolean;
    needsCollecting: boolean;
    hasBackorder: boolean;
    maxSupplyDays: number;
  };
  vehicleCategory: { maxWeight: number; maxVolume: number; kWeight: number } | null;
  coefficients: {
    pricePerKm: number;
    kDist: number;
    kWeight: number;
    dClientType: number;
    kCollect: number;
    pWeightMin: number;
  };
  delivery: {
    standard: { price: number; minPrice: number; finalPrice: number };
    dayInDay: { price: number; available: boolean; reason: string | null };
    exactTime: { price: number; available: boolean; reason: string | null };
    express: { price: number; available: boolean; reason: string | null; hours: number };
  };
  availableDates: Array<{ date: string; intervals: string[]; slotsLeft: number }>;
  warnings: string[];
  manualCalculation?: boolean;
  error?: string;
}

// === Lifting Result ===
export interface LiftingResult {
  price: number;
  formula: string;
  breakdown: Array<{ label: string; value: number }>;
  nWeightCategory: number;
  weightStepKg: number;
  totalWeight: number;
  floor: number;
  elevatorBlocked: boolean;
  effectiveLiftType: string;
  liftType: string;
  tariff: LiftingTariff;
  error?: string;
}

// === Backward compat for zone-map ===
export interface Zone {
  id: number;
  name: string;
  price: number;
  minOrderAmount: number;
  deliveryTime: string | null;
  color: string;
  polygon: Polygon;
  isActive: boolean;
  cityId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateZonePayload {
  name: string;
  price: number;
  minOrderAmount?: number;
  deliveryTime?: string;
  color?: string;
  polygon: Polygon;
  isActive?: boolean;
  cityId?: number;
}

export interface UpdateZonePayload extends Partial<CreateZonePayload> {}
