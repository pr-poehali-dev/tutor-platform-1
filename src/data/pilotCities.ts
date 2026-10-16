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
  city("novosibirsk", "Новосибирск и область", "в Новосибирске и Новосибирской области", "Новосибирска и области", "НОВОСИБИРСК"),
  city("ekaterinburg", "Екатеринбург и область", "в Екатеринбурге и Свердловской области", "Екатеринбурга и Свердловской области", "ЕКАТЕРИНБУРГ"),
  city("kazan", "Казань и Татарстан", "в Казани и Республике Татарстан", "Казани и Татарстана", "КАЗАНЬ"),
  city("nizhniy-novgorod", "Нижний Новгород и область", "в Нижнем Новгороде и Нижегородской области", "Нижнего Новгорода и области", "НИЖНИЙ НОВГОРОД"),
  city("krasnoyarsk", "Красноярск и край", "в Красноярске и Красноярском крае", "Красноярска и края", "КРАСНОЯРСК"),
  city("chelyabinsk", "Челябинск и область", "в Челябинске и Челябинской области", "Челябинска и области", "ЧЕЛЯБИНСК"),
  city("ufa", "Уфа и Башкортостан", "в Уфе и Республике Башкортостан", "Уфы и Башкортостана", "УФА"),
  city("krasnodar", "Краснодар и край", "в Краснодаре и Краснодарском крае", "Краснодара и края", "КРАСНОДАР"),
  city("rostov-na-donu", "Ростов-на-Дону и область", "в Ростове-на-Дону и Ростовской области", "Ростова-на-Дону и области", "РОСТОВ-НА-ДОНУ"),
  city("omsk", "Омск и область", "в Омске и Омской области", "Омска и области", "ОМСК"),
];

export const DEFAULT_PILOT_CITY = PILOT_CITIES[0];

export function findPilotCity(slug?: string | null): PilotCity | undefined {
  if (!slug) return undefined;
  return PILOT_CITIES.find((c) => c.slug === slug);
}

export const SITE_LABEL = "учисьпро.рф";
