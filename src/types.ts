export interface Province {
  id: number;
  provinceCode: number;
  provinceNameTh: string;
  provinceNameEn: string;
}

export interface District {
  id: number;
  provinceCode: number;
  districtCode: number;
  districtNameTh: string;
  districtNameEn: string;
  postalCode: number;
}

export interface Subdistrict {
  id: number;
  provinceCode: number;
  districtCode: number;
  subdistrictCode: number;
  subdistrictNameTh: string;
  subdistrictNameEn: string;
  postalCode: number;
}

export interface AddressSelection {
  province?: Pick<
    Province,
    "provinceCode" | "provinceNameTh" | "provinceNameEn"
  > | null;
  district?: Pick<
    District,
    "districtCode" | "districtNameTh" | "districtNameEn"
  > | null;
  subdistrict?: Pick<
    Subdistrict,
    | "subdistrictCode"
    | "subdistrictNameTh"
    | "subdistrictNameEn"
    | "postalCode"
  > | null;
  postalCode?: number | string | null;
}

export interface AddressResult {
  province: Province;
  district: District;
  subdistrict: Subdistrict;
  postalCode: number;
}

export interface GetProvincesOptions {
  /** When true (default), Bangkok first then Thai locale order. */
  sort?: boolean;
}
