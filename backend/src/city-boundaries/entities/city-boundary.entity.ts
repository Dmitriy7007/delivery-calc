import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { City } from '../../cities/entities/city.entity';

@Entity('city_boundaries')
export class CityBoundary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  cityId: number;

  @ManyToOne(() => City, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cityId' })
  city: City;

  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Polygon',
    srid: 4326,
  })
  polygon: object;

  @Column({ type: 'varchar', length: 9, default: '#3498db' })
  color: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
