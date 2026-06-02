import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CityBoundary } from './entities/city-boundary.entity';

@Injectable()
export class CityBoundariesService {
  constructor(
    @InjectRepository(CityBoundary)
    private readonly boundaryRepository: Repository<CityBoundary>,
  ) {}

  async create(dto: { cityId: number; polygon: any; color?: string }): Promise<CityBoundary> {
    const result = await this.boundaryRepository
      .createQueryBuilder()
      .insert()
      .into(CityBoundary)
      .values({
        cityId: dto.cityId,
        color: dto.color ?? '#3498db',
        polygon: () => `ST_GeomFromGeoJSON('${JSON.stringify(dto.polygon)}')`,
      } as any)
      .returning('*')
      .execute();

    return this.findOne(result.generatedMaps[0].id);
  }

  async findAll(cityId?: number): Promise<CityBoundary[]> {
    const qb = this.boundaryRepository
      .createQueryBuilder('b')
      .select([
        'b.id AS id',
        'b."cityId" AS "cityId"',
        'b.color AS color',
        'b."isActive" AS "isActive"',
        'b."createdAt" AS "createdAt"',
        'b."updatedAt" AS "updatedAt"',
        'ST_AsGeoJSON(b.polygon)::json AS polygon',
      ]);

    if (cityId !== undefined) {
      qb.where('b."cityId" = :cityId', { cityId });
    }

    const raw = await qb.getRawMany();
    return raw.map((r) => this.mapRaw(r));
  }

  async findByCityId(cityId: number): Promise<CityBoundary | null> {
    const raw = await this.boundaryRepository
      .createQueryBuilder('b')
      .select([
        'b.id AS id',
        'b."cityId" AS "cityId"',
        'b.color AS color',
        'b."isActive" AS "isActive"',
        'b."createdAt" AS "createdAt"',
        'b."updatedAt" AS "updatedAt"',
        'ST_AsGeoJSON(b.polygon)::json AS polygon',
      ])
      .where('b."cityId" = :cityId', { cityId })
      .getRawOne();

    return raw ? this.mapRaw(raw) : null;
  }

  async findOne(id: number): Promise<CityBoundary> {
    const raw = await this.boundaryRepository
      .createQueryBuilder('b')
      .select([
        'b.id AS id',
        'b."cityId" AS "cityId"',
        'b.color AS color',
        'b."isActive" AS "isActive"',
        'b."createdAt" AS "createdAt"',
        'b."updatedAt" AS "updatedAt"',
        'ST_AsGeoJSON(b.polygon)::json AS polygon',
      ])
      .where('b.id = :id', { id })
      .getRawOne();

    if (!raw) throw new NotFoundException(`Boundary ${id} not found`);
    return this.mapRaw(raw);
  }

  async update(id: number, dto: { polygon?: any; color?: string; isActive?: boolean }): Promise<CityBoundary> {
    await this.findOne(id);

    const setValues: Record<string, any> = {};
    if (dto.color !== undefined) setValues['color'] = dto.color;
    if (dto.isActive !== undefined) setValues['isActive'] = dto.isActive;
    if (dto.polygon) {
      setValues['polygon'] = () => `ST_GeomFromGeoJSON('${JSON.stringify(dto.polygon)}')`;
    }

    if (Object.keys(setValues).length > 0) {
      await this.boundaryRepository
        .createQueryBuilder()
        .update(CityBoundary)
        .where('id = :id', { id })
        .set(setValues as any)
        .execute();
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const boundary = await this.findOne(id);
    await this.boundaryRepository.delete(boundary.id);
  }

  async isPointInsideCity(cityId: number, lng: number, lat: number): Promise<boolean> {
    const result = await this.boundaryRepository
      .createQueryBuilder('b')
      .select('1')
      .where(
        'b."cityId" = :cityId AND b."isActive" = true AND ST_Contains(b.polygon, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326))',
        { cityId, lng, lat },
      )
      .getRawOne();

    return !!result;
  }

  private mapRaw(raw: any): CityBoundary {
    const b = new CityBoundary();
    b.id = raw.id;
    b.cityId = raw.cityId;
    b.color = raw.color;
    b.isActive = raw.isActive;
    b.polygon = raw.polygon;
    b.createdAt = raw.createdAt;
    b.updatedAt = raw.updatedAt;
    return b;
  }
}
