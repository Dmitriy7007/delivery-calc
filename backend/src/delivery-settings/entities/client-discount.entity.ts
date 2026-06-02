import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { City } from '../../cities/entities/city.entity';

@Entity('client_discounts')
export class ClientDiscount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  cityId: number;

  @ManyToOne(() => City, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cityId' })
  city: City;

  @Column({ type: 'varchar', length: 30 })
  clientType: string; // 'standard' | 'vip' | 'wholesale' | 'partner'

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  minOrderAmount: number; // от какой суммы корзины

  @Column({ type: 'int', nullable: true, default: null })
  maxOrderWeight: number | null; // до какого веса (кг), null = без ограничения

  @Column({ type: 'int' })
  discountPercent: number; // процент скидки (10, 50, 100)
}
