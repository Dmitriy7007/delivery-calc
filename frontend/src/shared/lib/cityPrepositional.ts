/**
 * Converts a Russian city name to prepositional case (предложный падеж).
 * Used in "Введите адрес в [городе]..."
 */

// Lookup table for irregular/common cities
const CITY_PREPOSITIONAL: Record<string, string> = {
  'Москва': 'Москве',
  'Санкт-Петербург': 'Санкт-Петербурге',
  'Новосибирск': 'Новосибирске',
  'Екатеринбург': 'Екатеринбурге',
  'Казань': 'Казани',
  'Челябинск': 'Челябинске',
  'Красноярск': 'Красноярске',
  'Новокузнецк': 'Новокузнецке',
  'Уфа': 'Уфе',
  'Самара': 'Самаре',
  'Ростов-на-Дону': 'Ростове-на-Дону',
  'Краснодар': 'Краснодаре',
  'Воронеж': 'Воронеже',
  'Пермь': 'Перми',
  'Омск': 'Омске',
  'Тюмень': 'Тюмени',
  'Томск': 'Томске',
  'Барнаул': 'Барнауле',
  'Иркутск': 'Иркутске',
  'Хабаровск': 'Хабаровске',
  'Владивосток': 'Владивостоке',
  'Нижний Новгород': 'Нижнем Новгороде',
  'Саратов': 'Саратове',
  'Волгоград': 'Волгограде',
  'Тольятти': 'Тольятти',
  'Ижевск': 'Ижевске',
  'Ульяновск': 'Ульяновске',
  'Кемерово': 'Кемерово',
  'Рязань': 'Рязани',
  'Астрахань': 'Астрахани',
  'Набережные Челны': 'Набережных Челнах',
  'Пенза': 'Пензе',
  'Киров': 'Кирове',
  'Липецк': 'Липецке',
  'Тула': 'Туле',
  'Курск': 'Курске',
  'Улан-Удэ': 'Улан-Удэ',
  'Чита': 'Чите',
  'Белгород': 'Белгороде',
  'Ярославль': 'Ярославле',
  'Владимир': 'Владимире',
  'Иваново': 'Иваново',
  'Смоленск': 'Смоленске',
  'Брянск': 'Брянске',
  'Тверь': 'Твери',
  'Ставрополь': 'Ставрополе',
  'Симферополь': 'Симферополе',
  'Севастополь': 'Севастополе',
};

/**
 * Returns city name in prepositional case, with a best-effort fallback for unknown cities.
 */
export function cityInPrepositional(cityName: string): string {
  if (!cityName) return 'городе';

  // Check lookup table first
  if (CITY_PREPOSITIONAL[cityName]) {
    return CITY_PREPOSITIONAL[cityName];
  }

  // Fallback: apply simple Russian morphology rules
  const lower = cityName.toLowerCase();

  // ends in "ь" → "и"  (Пермь → Перми, Казань → Казани, Тверь → Твери)
  if (lower.endsWith('ь')) {
    return cityName.slice(0, -1) + 'и';
  }

  // ends in "а" → "е"  (Москва → Москве, Самара → Самаре)
  if (lower.endsWith('а')) {
    return cityName.slice(0, -1) + 'е';
  }

  // ends in "я" → "е"  (Казань already covered, but for others like Костромя)
  if (lower.endsWith('я')) {
    return cityName.slice(0, -1) + 'е';
  }

  // ends in "о" or "е" → unchanged  (Иваново, Кемерово, Тольятти-like)
  if (lower.endsWith('о') || lower.endsWith('е') || lower.endsWith('и') || lower.endsWith('у')) {
    return cityName;
  }

  // ends in consonant → add "е"  (Омск → Омске, Новокузнецк → Новокузнецке)
  return cityName + 'е';
}
