import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'float', default: 87.1152 })
  geocenterLng: number;

  @Column({ type: 'float', default: 53.7596 })
  geocenterLat: number;

  @Column({ type: 'int', default: 12 })
  defaultZoom: number;

  @Column({ type: 'varchar', length: 50, default: 'Asia/Krasnoyarsk' })
  timezone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
