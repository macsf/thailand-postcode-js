"use client";

import { useMemo } from "react";
import {
  getDistrictsByProvince,
  getProvinces,
  getSubdistrictsByDistrict,
  search,
} from "../query.js";
import type { AddressResult, District, Province, Subdistrict } from "../types.js";

export function useProvinces(): Province[] {
  return useMemo(() => getProvinces(), []);
}

export function useDistricts(
  provinceCode: number | string | null | undefined
): District[] {
  return useMemo(
    () =>
      provinceCode != null && provinceCode !== ""
        ? getDistrictsByProvince(provinceCode)
        : [],
    [provinceCode]
  );
}

export function useSubdistricts(
  districtCode: number | string | null | undefined
): Subdistrict[] {
  return useMemo(
    () =>
      districtCode != null && districtCode !== ""
        ? getSubdistrictsByDistrict(districtCode)
        : [],
    [districtCode]
  );
}

export function useAddressSearch(query: string, limit = 50): AddressResult[] {
  return useMemo(() => search(query, limit), [query, limit]);
}
