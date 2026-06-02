import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { City } from '../../cities/entities/city.entity';

@Entity('vehicle_categories')
export class VehicleCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  cityId: number;

  @ManyToOne(() => City, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cityId' })
  city: City;

  @Column({ type: 'int' })
  maxWeight: number; // кг

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  maxVolume: number; // м³

  @Column({ type: 'int', default: 0 })
  maxSingleItemLength: number; // мм

  @Column({ type: 'int', default: 0 })
  maxSingleItemWidth: number; // мм

  @Column({ type: 'int', default: 0 })
  maxSingleItemHeight: number; // мм

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  kWeight: number; // Kweight коэффициент ВГХ
}
