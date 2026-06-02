import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('YANDEX_GEOCODER_API_KEY', '');
    this.logger.log(`Geocoder API key loaded: ${this.apiKey ? 'yes' : 'NO KEY!'}`);
  }

  async geocode(address: string): Promise<{ lng: number; lat: number; formatted: string }> {
    const url = 'https://geocode-maps.yandex.ru/1.x/';
    const params = {
      apikey: this.apiKey,
      geocode: address,
      format: 'json',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params,
          headers: { Referer: 'http://localhost' },
        }),
      );

      const featureMembers = response.data.response.GeoObjectCollection.featureMember;

      if (!featureMembers || featureMembers.length === 0) {
        throw new HttpException('Адрес не найден', HttpStatus.NOT_FOUND);
      }

      const geoObject = featureMembers[0].GeoObject;
      const pos = geoObject.Point.pos;
      const [lng, lat] = pos.split(' ').map(Number);
      const formatted = geoObject.metaDataProperty?.GeocoderMetaData?.text || address;

      return { lng, lat, formatted };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Geocoding failed: ${error.message}`);
      throw new HttpException(
        `Ошибка геокодирования: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async suggest(query: string): Promise<Array<{ title: string; subtitle: string; uri: string }>> {
    const url = 'https://geocode-maps.yandex.ru/1.x/';
    const params = {
      apikey: this.apiKey,
      geocode: query,
      format: 'json',
      results: 7,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params,
          headers: { Referer: 'http://localhost' },
        }),
      );

      const featureMembers = response.data.response.GeoObjectCollection.featureMember || [];

      return featureMembers.map((item: any) => {
        const geoObject = item.GeoObject;
        return {
          title: geoObject.name || '',
          subtitle: geoObject.description || '',
          uri: '',
        };
      });
    } catch (error) {
      this.logger.error(`Suggest failed: ${error.message}`);
      return [];
    }
  }
}
