import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(dto);
    return this.productsRepository.save(product);
  }

  async findAll(filters?: { search?: string; category?: string; active?: boolean }): Promise<Product[]> {
    const where: any = {};

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.active !== undefined) {
      where.active = filters.active;
    }

    if (filters?.search) {
      where.name = Like(`%${filters.search}%`);
    }

    return this.productsRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }

  async getStats(): Promise<any> {
    const total = await this.productsRepository.count();
    const active = await this.productsRepository.count({ where: { active: true } });
    const byCategory = await this.productsRepository
      .createQueryBuilder('product')
      .select('product.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('product.category')
      .getRawMany();

    return { total, active, byCategory };
  }

  async seed(): Promise<void> {
    const count = await this.productsRepository.count();
    if (count > 0) return;

    const products: CreateProductDto[] = [
      {
        name: 'XR-8',
        model: 'XR-8',
        description: 'Ruleta electrónica de alto rendimiento con 8 posiciones para jugadores. Diseño Premium con tecnología de vanguardia. Colores de iluminación personalizables a su gusto.',
        category: 'ruleta' as any,
        positions: 8,
        diameterCm: 220,
        basePrice: 45000000,
        imageUrl: '/images/products/xr8.webp',
        features: { certificacion: 'GLI Laboratories', iluminacion: 'LED personalizable', tecnologia: 'Software europeo' },
      },
      {
        name: 'XR-6',
        model: 'XR-6',
        description: 'La versatilidad del XR combinada con un diseño compacto de 6 posiciones. 2 metros de diámetro ideal para espacios optimizados.',
        category: 'ruleta' as any,
        positions: 6,
        diameterCm: 200,
        basePrice: 38000000,
        imageUrl: '/images/products/xr6.webp',
        features: { certificacion: 'GLI Laboratories', diametro: '2 metros', compacta: true },
      },
      {
        name: 'XS-6',
        model: 'XS-6',
        description: 'Única ruleta de 6 puestos con solamente 1,80 mts de diámetro... para salas de juego que buscan más posiciones en espacios reducidos.',
        category: 'ruleta' as any,
        positions: 6,
        diameterCm: 180,
        basePrice: 35000000,
        imageUrl: '/images/products/xs6.webp',
        features: { certificacion: 'GLI Laboratories', diametro: '1.80 metros', compacta: true },
      },
      {
        name: 'XP-5',
        model: 'XP-5',
        description: 'La serie de ruletas diseñadas en Media Luna, para ubicaciones contra la pared.',
        category: 'ruleta' as any,
        positions: 5,
        diameterCm: 190,
        basePrice: 32000000,
        imageUrl: '/images/products/xp5.webp',
        features: { certificacion: 'GLI Laboratories', diseno: 'Media Luna', ubicacion: 'Contra pared' },
      },
      {
        name: 'XP-4',
        model: 'XP-4',
        description: 'La opción más accesible sin comprometer la tecnología. Upgrades a 5, 6 y 8 puestos disponibles.',
        category: 'ruleta' as any,
        positions: 4,
        diameterCm: 180,
        basePrice: 28000000,
        imageUrl: '/images/products/xp4.webp',
        features: { certificacion: 'GLI Laboratories', upgrades: '5, 6 y 8 puestos', accesible: true },
      },
      {
        name: 'XT-Terminal Remota',
        model: 'XT',
        description: 'La novedad en el mercado, ideal para que su casino genere más utilidades con terminal remota para operación centralizada. Conecte múltiples estaciones en diferentes puntos de su casino.',
        category: 'terminal' as any,
        basePrice: 15000000,
        imageUrl: '/images/products/xt.webp',
        features: { certificacion: 'GLI Laboratories', operacion: 'Centralizada', multiplesEstaciones: true },
      },
      {
        name: 'Gabinetes Individuales XG',
        model: 'XG',
        description: 'Diseñados para espacios tipo estadio. Diseño exclusivo y protección de alta gama.',
        category: 'gabinete' as any,
        positions: 1,
        basePrice: 8000000,
        imageUrl: '/images/products/xg.webp',
        features: { certificacion: 'GLI Laboratories', tipo: 'Estadio', proteccion: 'Alta gama' },
      },
    ];

    for (const product of products) {
      await this.create(product);
    }
  }
}
