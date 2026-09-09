import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImportJob, ImportJobStatus } from './entities/import-job.entity';
import { Customer, CustomerSource } from '../customers/entities/customer.entity';

export interface ImportResult {
  jobId: string;
  totalRows: number;
  successRows: number;
  errorRows: number;
  errors: { row: number; message: string; data: any }[];
}

@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(ImportJob)
    private importJobsRepository: Repository<ImportJob>,
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  async processCSV(
    userId: string,
    fileName: string,
    data: any[],
    columnMapping: Record<string, string>,
  ): Promise<ImportJob> {
    const job = this.importJobsRepository.create({
      userId,
      fileName,
      status: ImportJobStatus.PROCESANDO,
      totalRows: data.length,
    });
    const savedJob = await this.importJobsRepository.save(job);

    const errors: { row: number; message: string; data: any }[] = [];
    let successCount = 0;

    for (let i = 0; i < data.length; i++) {
      try {
        const rowData = data[i];
        const customerData = this.mapColumns(rowData, columnMapping);
        this.validateCustomerData(customerData, i + 1, errors);

        if (!errors.find((e) => e.row === i + 1)) {
          await this.customersRepository.save(
            this.customersRepository.create({
              ...customerData,
              source: CustomerSource.CSV_IMPORT,
              ownerId: userId,
            }),
          );
          successCount++;
        }
      } catch (error: any) {
        errors.push({
          row: i + 1,
          message: error?.message || 'Error desconocido',
          data: data[i],
        });
      }
    }

    savedJob.successRows = successCount;
    savedJob.errorRows = errors.length;
    savedJob.errorLog = errors;
    savedJob.status = ImportJobStatus.COMPLETADO;

    return this.importJobsRepository.save(savedJob);
  }

  private mapColumns(row: any, mapping: Record<string, string>): any {
    const result: any = {};
    for (const [field, column] of Object.entries(mapping)) {
      if (column && row[column] !== undefined) {
        result[field] = row[column];
      }
    }
    return result;
  }

  private validateCustomerData(data: any, row: number, errors: any[]): void {
    if (!data.fullName && !data.email && !data.phone) {
      errors.push({
        row,
        message: 'Debe tener al menos nombre, email o teléfono',
        data,
      });
    }
  }

  async findAll(): Promise<ImportJob[]> {
    return this.importJobsRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ImportJob> {
    const job = await this.importJobsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!job) throw new BadRequestException(`Import job with ID ${id} not found`);
    return job;
  }
}
