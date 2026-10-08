declare module "thailand-geography-json/src/provinces.json" {
  const provinces: Array<{
    id: number;
    provinceCode: number;
    provinceNameEn: string;
    provinceNameTh: string;
  }>;
  export default provinces;
}

declare module "thailand-geography-json/src/districts.json" {
  const districts: Array<{
    id: number;
    provinceCode: number;
    districtCode: number;
    districtNameEn: string;
    districtNameTh: string;
    postalCode: number;
  }>;
  export default districts;
}

declare module "thailand-geography-json/src/subdistricts.json" {
  const subdistricts: Array<{
    id: number;
    provinceCode: number;
    districtCode: number;
    subdistrictCode: number;
    subdistrictNameEn: string;
    subdistrictNameTh: string;
    postalCode: number;
  }>;
  export default subdistricts;
}
