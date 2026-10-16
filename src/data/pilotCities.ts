/** Города пилотного проекта для школ. Промокод = название города (любое написание).
 *  Самара — первый пилот, её страница остаётся по старому адресу /samara. */
export interface PilotCity {
  slug: string;
  name: string;
  /** «в Казани» */
  nameIn: string;
  /** «школ Казани» */
  nameGen: string;
  promo: string;
  /** Страница активации для учеников */
  path: string;
  qr: string;
}

const city = (slug: string, name: string, nameIn: string, nameGen: string, promo: string): PilotCity => ({
  slug,
  name,
  nameIn,
  nameGen,
  promo,
  path: slug === "samara" ? "/samara" : `/pilot/${slug}`,
  qr: slug === "samara" ? "/qr-samara.svg" : `/qr-pilot-${slug}.svg`,
});

export const PILOT_CITIES: PilotCity[] = [
  city("samara", "Самара и область", "в Самаре и Самарской области", "Самары и области", "САМАРА"),
  city("novosibirsk", "Новосибирск", "в Новосибирске", "Новосибирска", "НОВОСИБИРСК"),
  city("ekaterinburg", "Екатеринбург", "в Екатеринбурге", "Екатеринбурга", "ЕКАТЕРИНБУРГ"),
  city("kazan", "Казань", "в Казани", "Казани", "КАЗАНЬ"),
  city("nizhniy-novgorod", "Нижний Новгород", "в Нижнем Новгороде", "Нижнего Новгорода", "НИЖНИЙ НОВГОРОД"),
  city("krasnoyarsk", "Красноярск", "в Красноярске", "Красноярска", "КРАСНОЯРСК"),
  city("chelyabinsk", "Челябинск", "в Челябинске", "Челябинска", "ЧЕЛЯБИНСК"),
  city("ufa", "Уфа", "в Уфе", "Уфы", "УФА"),
  city("krasnodar", "Краснодар", "в Краснодаре", "Краснодара", "КРАСНОДАР"),
  city("rostov-na-donu", "Ростов-на-Дону", "в Ростове-на-Дону", "Ростова-на-Дону", "РОСТОВ-НА-ДОНУ"),
  city("omsk", "Омск", "в Омске", "Омска", "ОМСК"),
];

export const DEFAULT_PILOT_CITY = PILOT_CITIES[0];

export function findPilotCity(slug?: string | null): PilotCity | undefined {
  if (!slug) return undefined;
  return PILOT_CITIES.find((c) => c.slug === slug);
}

export const SITE_LABEL = "учисьпро.рф";
