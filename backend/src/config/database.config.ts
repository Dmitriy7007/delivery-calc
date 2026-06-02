import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const databaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5433),
  username: configService.get<string>('DB_USER', 'domingo'),
  password: configService.get<string>('DB_PASSWORD', 'domingo_pass'),
  database: configService.get<string>('DB_NAME', 'domingo_calc'),
  autoLoadEntities: true,
  synchronize: true,
});
