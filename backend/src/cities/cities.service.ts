import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { CreateCityDto, UpdateCityDto } from './dto';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  async create(dto: CreateCityDto): Promise<City> {
    const city = this.cityRepository.create(dto);
    return this.cityRepository.save(city);
  }

  async findAll(): Promise<City[]> {
    return this.cityRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<City> {
    const city = await this.cityRepository.findOneBy({ id });
    if (!city) throw new NotFoundException(`City ${id} not found`);
    return city;
  }

  async update(id: number, dto: UpdateCityDto): Promise<City> {
    const city = await this.findOne(id);
    Object.assign(city, dto);
    return this.cityRepository.save(city);
  }

  async remove(id: number): Promise<void> {
    const city = await this.findOne(id);
    await this.cityRepository.remove(city);
  }
}
