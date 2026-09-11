import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProductCategory {
  RULETA = 'ruleta',
  TERMINAL = 'terminal',
  GABINETE = 'gabinete',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  model: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ProductCategory, default: ProductCategory.RULETA })
  category: ProductCategory;

  @Column({ type: 'int', nullable: true })
  positions: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  diameterCm: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'base_price' })
  basePrice: number;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  features: Record<string, any>;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
