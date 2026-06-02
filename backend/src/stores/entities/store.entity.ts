import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { City } from '../../cities/entities/city.entity';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  address: string;

  @Column({ type: 'int' })
  cityId: number;

  @ManyToOne(() => City, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cityId' })
  city: City;

  @Column({ type: 'float' })
  lng: number;

  @Column({ type: 'float' })
  lat: number;

  @Column({ type: 'varchar', length: 20, default: 'store' })
  type: string; // 'store' | 'warehouse'

  @Column({ type: 'varchar', length: 5, default: '09:00' })
  workHoursFrom: string;

  @Column({ type: 'varchar', length: 5, default: '20:00' })
  workHoursTo: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
