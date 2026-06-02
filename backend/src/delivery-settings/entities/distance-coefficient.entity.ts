import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { City } from '../../cities/entities/city.entity';

@Entity('distance_coefficients')
export class DistanceCoefficient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  cityId: number;

  @ManyToOne(() => City, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cityId' })
  city: City;

  @Column({ type: 'int' })
  maxDistanceKm: number;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  coefficient: number;
}
