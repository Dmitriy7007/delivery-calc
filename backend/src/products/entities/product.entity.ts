import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  categoryName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  weight: number; // кг

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  volume: number; // м³

  @Column({ type: 'int', default: 0 })
  length: number; // мм

  @Column({ type: 'int', default: 0 })
  width: number; // мм

  @Column({ type: 'int', default: 0 })
  height: number; // мм

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // ₽

  @Column({ type: 'boolean', default: false })
  isFreeLift: boolean; // бесплатный подъём для категории

  @Column({ type: 'int', nullable: true, default: null })
  supplyDays: number | null; // дней до поставки "под заказ", null = есть в наличии

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
