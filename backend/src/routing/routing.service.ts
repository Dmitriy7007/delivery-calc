import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface RouteResult {
  distanceKm: number;
  durationMinutes: number;
}

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('YANDEX_GEOCODER_API_KEY', '');
  }

  /**
   * Получить расстояние по дорогам между двумя точками через Yandex Router API v2.
   *
   * Формат запроса:
   *   https://api.routing.yandex.net/v2/route?waypoints=lat1,lon1|lat2,lon2&apikey=KEY
   *
   * Формат ответа (driving):
   *   { route: { legs: [{ status: "OK", steps: [{ length: <metres>, duration: <seconds>, ... }] }] } }
   */
  async getRouteDistance(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
  ): Promise<RouteResult | null> {
    if (!this.apiKey) {
      this.logger.warn('YANDEX_GEOCODER_API_KEY not set, falling back to haversine');
      return null;
    }

    try {
      // waypoints format: lat,lon|lat,lon  (широта,долгота)
      const waypoints = `${fromLat},${fromLng}|${toLat},${toLng}`;
      const url = `https://api.routing.yandex.net/v2/route?waypoints=${waypoints}&apikey=${this.apiKey}`;

      this.logger.debug(`Router API request: waypoints=${fromLat},${fromLng}|${toLat},${toLng}`);

      const response = await fetch(url);

      if (!response.ok) {
        const text = await response.text();
        this.logger.warn(`Router API ${response.status}: ${text.substring(0, 200)}`);
        return null;
      }

      const data = await response.json();

      // Проверяем наличие route.legs
      if (!data.route?.legs || data.route.legs.length === 0) {
        this.logger.warn('Router API: no route.legs in response');
        return null;
      }

      let totalDistanceMeters = 0;
      let totalDurationSeconds = 0;

      for (const leg of data.route.legs) {
        // Проверяем статус leg
        if (leg.status !== 'OK') {
          this.logger.warn(`Router API: leg status = ${leg.status}`);
          return null;
        }

        // Суммируем steps: каждый step имеет length (метры) и duration (секунды)
        if (leg.steps && Array.isArray(leg.steps)) {
          for (const step of leg.steps) {
            totalDistanceMeters += Number(step.length) || 0;
            totalDurationSeconds += Number(step.duration) || 0;
          }
        }
      }

      if (totalDistanceMeters === 0) {
        this.logger.warn('Router API: total distance is 0');
        return null;
      }

      const distanceKm = Math.round(totalDistanceMeters / 100) / 10; // округление до 0.1 км
      const durationMinutes = Math.round(totalDurationSeconds / 60);

      this.logger.log(
        `Route: ${distanceKm} km, ${durationMinutes} min (${fromLat},${fromLng} → ${toLat},${toLng})`,
      );

      return { distanceKm, durationMinutes };
    } catch (error) {
      this.logger.error(`Router API error: ${error.message}`);
      return null;
    }
  }
}
