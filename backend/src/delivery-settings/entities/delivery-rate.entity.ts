import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { City } from '../../cities/entities/city.entity';

@Entity('delivery_rates')
export class DeliveryRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  cityId: number;

  @ManyToOne(() => City, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cityId' })
  city: City;

  // === Стоимость за 1 км ===
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 70 })
  pricePerKm: number;

  // === Минимальные цены по весовым категориям ===
  @Column({ type: 'jsonb', default: '[]' })
  minPrices: Array<{ maxWeight: number; minPrice: number }>;

  // === Коэффициенты типов доставки ===
  @Column({ type: 'decimal', precision: 4, scale: 2, default: 1.5 })
  kDayInDay: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 2.0 })
  kExactTime: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 2.5 })
  kExpress: number;

  @Column({ type: 'int', default: 4 })
  expressHours: number;

  // === Сборка между ТТ ===
  @Column({ type: 'decimal', precision: 4, scale: 2, default: 1.2 })
  kCollect: number;

  @Column({ type: 'int', default: 2 })
  collectDelayDays: number;

  // === Временные параметры ===
  @Column({ type: 'varchar', length: 5, default: '18:00' })
  dayInDayCutoffTime: string;

  @Column({ type: 'varchar', length: 5, default: '11:00' })
  expressAvailableFrom: string;

  @Column({ type: 'varchar', length: 5, default: '19:00' })
  expressAvailableTo: string;

  @Column({ type: 'int', default: 5 })
  exactTimeDeltaHours: number;

  // === Интервалы стандартной доставки ===
  @Column({
    type: 'jsonb',
    default: '[{"from":"09:00","to":"12:00"},{"from":"12:00","to":"16:00"},{"from":"16:00","to":"20:00"}]',
  })
  deliveryIntervals: Array<{ from: string; to: string }>;

  // === Лимиты ===
  @Column({ type: 'int', default: 400 })
  maxDeliveriesPerDay: number;

  @Column({ type: 'int', default: 12 })
  planningHorizonDays: number;

  @Column({ type: 'jsonb', default: '[]' })
  blockedWeekdays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat

  // === Сроки стандартной доставки ===
  @Column({ type: 'varchar', length: 5, default: '16:00' })
  standardOrderCutoffTime: string;

  @Column({ type: 'int', default: 10 })
  defaultSupplyDays: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
