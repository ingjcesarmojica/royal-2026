import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ImportJobStatus {
  PROCESANDO = 'procesando',
  COMPLETADO = 'completado',
  ERROR = 'error',
}

@Entity('import_jobs')
export class ImportJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ type: 'enum', enum: ImportJobStatus, default: ImportJobStatus.PROCESANDO })
  status: ImportJobStatus;

  @Column({ name: 'total_rows', default: 0 })
  totalRows: number;

  @Column({ name: 'success_rows', default: 0 })
  successRows: number;

  @Column({ name: 'error_rows', default: 0 })
  errorRows: number;

  @Column({ name: 'error_log', type: 'jsonb', nullable: true })
  errorLog: any[];

  @ManyToOne(() => User, (user) => user.importJobs)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
