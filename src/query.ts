import {
  addressesByPostalCode,
  districtByCode,
  districtsByProvinceCode,
  provinceByCode,
  provinces as allProvinces,
  subdistrictByCode,
  subdistricts as allSubdistricts,
  subdistrictsByDistrictCode,
  toCodeNumber,
} from "./indexes.js";
import type {
  AddressResult,
  District,
  GetProvincesOptions,
  Province,
  Subdistrict,
} from "./types.js";

export function getProvinces(options: GetProvincesOptions = {}): Province[] {
  const { sort = true } = options;
  if (!sort) return [...allProvinces];
  return [...allProvinces];
}

export function getProvinceByCode(
  provinceCode: number | string
): Province | undefined {
  return provinceByCode.get(toCodeNumber(provinceCode));
}

export function getDistrictsByProvince(
  provinceCode: number | string
): District[] {
  return [...(districtsByProvinceCode.get(toCodeNumber(provinceCode)) ?? [])];
}

export function getDistrictByCode(
  districtCode: number | string
): District | undefined {
  return districtByCode.get(toCodeNumber(districtCode));
}

export function getSubdistrictsByDistrict(
  districtCode: number | string
): Subdistrict[] {
  return [
    ...(subdistrictsByDistrictCode.get(toCodeNumber(districtCode)) ?? []),
  ];
}

export function getSubdistrictByCode(
  subdistrictCode: number | string
): Subdistrict | undefined {
  return subdistrictByCode.get(toCodeNumber(subdistrictCode));
}

export function getByZipcode(
  postalCode: number | string
): AddressResult[] {
  const code = toCodeNumber(postalCode);
  if (Number.isNaN(code)) return [];
  return [...(addressesByPostalCode.get(code) ?? [])];
}

/** Alias for getByZipcode using thailand-geography-json naming. */
export function getByPostalCode(
  postalCode: number | string
): AddressResult[] {
  return getByZipcode(postalCode);
}

function matchesQuery(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle);
}

/**
 * Search provinces, districts, subdistricts, and postal codes by Thai/English name or zip.
 */
export function search(query: string, limit = 50): AddressResult[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const results: AddressResult[] = [];
  const seen = new Set<number>();

  const push = (result: AddressResult) => {
    const key = result.subdistrict.subdistrictCode;
    if (seen.has(key)) return;
    seen.add(key);
    results.push(result);
  };

  if (/^\d{3,5}$/.test(needle)) {
    for (const [postal, rows] of addressesByPostalCode) {
      if (!String(postal).startsWith(needle)) continue;
      for (const row of rows) {
        push(row);
        if (results.length >= limit) return results;
      }
    }
  }

  for (const subdistrict of allSubdistricts) {
    if (results.length >= limit) break;

    const province = provinceByCode.get(subdistrict.provinceCode);
    const district = districtByCode.get(subdistrict.districtCode);
    if (!province || !district) continue;

    const hit =
      matchesQuery(subdistrict.subdistrictNameTh, needle) ||
      matchesQuery(subdistrict.subdistrictNameEn, needle) ||
      matchesQuery(district.districtNameTh, needle) ||
      matchesQuery(district.districtNameEn, needle) ||
      matchesQuery(province.provinceNameTh, needle) ||
      matchesQuery(province.provinceNameEn, needle) ||
      matchesQuery(String(subdistrict.postalCode), needle);

    if (!hit) continue;

    push({
      province,
      district,
      subdistrict,
      postalCode: subdistrict.postalCode,
    });
  }

  return results;
}
