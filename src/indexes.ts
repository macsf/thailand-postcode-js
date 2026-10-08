import districtsJson from "thailand-geography-json/src/districts.json";
import provincesJson from "thailand-geography-json/src/provinces.json";
import subdistrictsJson from "thailand-geography-json/src/subdistricts.json";
import type {
  AddressResult,
  District,
  Province,
  Subdistrict,
} from "./types.js";

/** Bangkok official province code from thailand-geography-json. */
export const BANGKOK_PROVINCE_CODE = 10;

export function sortByThaiName<T>(
  items: T[],
  getName: (item: T) => string,
  options?: { keepFirst?: boolean }
): T[] {
  if (items.length === 0) return [];

  const copy = [...items];
  const first = options?.keepFirst ? copy.shift() : undefined;

  copy.sort((a, b) => {
    const nameA = getName(a);
    const nameB = getName(b);
    const starA = nameA.startsWith("*");
    const starB = nameB.startsWith("*");

    if (starA && !starB) return 1;
    if (!starA && starB) return -1;

    return nameA.localeCompare(nameB, "th");
  });

  return first !== undefined ? [first, ...copy] : copy;
}

function toProvince(raw: (typeof provincesJson)[number]): Province {
  return {
    id: raw.id,
    provinceCode: raw.provinceCode,
    provinceNameTh: raw.provinceNameTh,
    provinceNameEn: raw.provinceNameEn,
  };
}

function toDistrict(raw: (typeof districtsJson)[number]): District {
  return {
    id: raw.id,
    provinceCode: raw.provinceCode,
    districtCode: raw.districtCode,
    districtNameTh: raw.districtNameTh,
    districtNameEn: raw.districtNameEn,
    postalCode: raw.postalCode,
  };
}

function toSubdistrict(raw: (typeof subdistrictsJson)[number]): Subdistrict {
  return {
    id: raw.id,
    provinceCode: raw.provinceCode,
    districtCode: raw.districtCode,
    subdistrictCode: raw.subdistrictCode,
    subdistrictNameTh: raw.subdistrictNameTh,
    subdistrictNameEn: raw.subdistrictNameEn,
    postalCode: raw.postalCode,
  };
}

const mappedProvinces = provincesJson.map(toProvince);
const bangkokIndex = mappedProvinces.findIndex(
  (p) => p.provinceCode === BANGKOK_PROVINCE_CODE
);
if (bangkokIndex > 0) {
  const [bangkok] = mappedProvinces.splice(bangkokIndex, 1);
  mappedProvinces.unshift(bangkok!);
}

export const provinces: Province[] = sortByThaiName(
  mappedProvinces,
  (p) => p.provinceNameTh,
  { keepFirst: true }
);

export const districts: District[] = districtsJson.map(toDistrict);
export const subdistricts: Subdistrict[] = subdistrictsJson.map(toSubdistrict);

export const districtsByProvinceCode = new Map<number, District[]>();
for (const district of districts) {
  const list = districtsByProvinceCode.get(district.provinceCode);
  if (list) {
    list.push(district);
  } else {
    districtsByProvinceCode.set(district.provinceCode, [district]);
  }
}
for (const [provinceCode, list] of districtsByProvinceCode) {
  districtsByProvinceCode.set(
    provinceCode,
    sortByThaiName(list, (d) => d.districtNameTh)
  );
}

export const subdistrictsByDistrictCode = new Map<number, Subdistrict[]>();
for (const subdistrict of subdistricts) {
  const list = subdistrictsByDistrictCode.get(subdistrict.districtCode);
  if (list) {
    list.push(subdistrict);
  } else {
    subdistrictsByDistrictCode.set(subdistrict.districtCode, [subdistrict]);
  }
}
for (const [districtCode, list] of subdistrictsByDistrictCode) {
  subdistrictsByDistrictCode.set(
    districtCode,
    sortByThaiName(list, (s) => s.subdistrictNameTh)
  );
}

export const provinceByCode = new Map(
  provinces.map((province) => [province.provinceCode, province])
);
export const districtByCode = new Map(
  districts.map((district) => [district.districtCode, district])
);
export const subdistrictByCode = new Map(
  subdistricts.map((subdistrict) => [subdistrict.subdistrictCode, subdistrict])
);

export const addressesByPostalCode = new Map<number, AddressResult[]>();
for (const subdistrict of subdistricts) {
  const province = provinceByCode.get(subdistrict.provinceCode);
  const district = districtByCode.get(subdistrict.districtCode);
  if (!province || !district) continue;

  const result: AddressResult = {
    province,
    district,
    subdistrict,
    postalCode: subdistrict.postalCode,
  };

  const list = addressesByPostalCode.get(subdistrict.postalCode);
  if (list) {
    list.push(result);
  } else {
    addressesByPostalCode.set(subdistrict.postalCode, [result]);
  }
}

export function toCodeNumber(value: number | string): number {
  if (typeof value === "number") return value;
  return Number.parseInt(String(value).trim(), 10);
}
