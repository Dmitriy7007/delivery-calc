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

@Entity('lifting_tariffs')
export class LiftingTariff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  cityId: number;

  @ManyToOne(() => City, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cityId' })
  city: City;

  @Column({ type: 'int', default: 100 })
  weightStepKg: number; // шаг тарификации (100 кг)

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 200 })
  pMinToElevator: number; // разовая надбавка за поднос до лифта

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 150 })
  pMinFromElevatorToRoom: number; // разовая надбавка от лифта до комнаты

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 100 })
  pToElevator: number; // за единицу веса до лифта

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 80 })
  pFromElevatorToRoom: number; // за единицу веса от лифта до комнаты

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 120 })
  pFloor: number; // за ручной подъём на 1 этаж за единицу веса

  @Column({ type: 'int', default: 2500 })
  maxElevatorItemLengthMm: number; // макс. длина товара для лифта (мм)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
