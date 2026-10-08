import { describe, expect, it } from "vitest";
import {
  formatAddress,
  formatAddressEn,
  formatAddressPair,
  getByZipcode,
  getDistrictsByProvince,
  getProvinces,
  getSubdistrictsByDistrict,
  search,
} from "../src/index.js";

describe("getProvinces", () => {
  it("puts Bangkok first then sorts remaining names in Thai order", () => {
    const provinces = getProvinces();
    expect(provinces).toHaveLength(77);
    expect(provinces[0]?.provinceNameTh).toBe("กรุงเทพมหานคร");
    expect(provinces[0]?.provinceCode).toBe(10);
    expect(
      provinces[1]!.provinceNameTh.localeCompare(
        provinces[2]!.provinceNameTh,
        "th"
      )
    ).toBeLessThanOrEqual(0);
  });
});

describe("cascade lookups", () => {
  it("returns Bangkok districts for province code 10", () => {
    const districts = getDistrictsByProvince(10);
    expect(districts.length).toBeGreaterThan(0);
    expect(districts.every((d) => d.provinceCode === 10)).toBe(true);
  });

  it("includes postalCode on subdistricts for a district", () => {
    const subdistricts = getSubdistrictsByDistrict(1001);
    expect(subdistricts.length).toBeGreaterThan(0);
    expect(String(subdistricts[0]?.postalCode)).toMatch(/^\d{5}$/);
  });

  it("sorts district names in Thai locale order", () => {
    const districts = getDistrictsByProvince(10);
    const names = districts.map((d) => d.districtNameTh);
    const sorted = [...names].sort((a, b) => a.localeCompare(b, "th"));
    expect(names).toEqual(sorted);
  });
});

describe("getByZipcode", () => {
  it("returns address rows for a known Bangkok postal code", () => {
    const rows = getByZipcode(10200);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]?.province.provinceNameTh).toBe("กรุงเทพมหานคร");
    expect(rows[0]?.postalCode).toBe(10200);
    expect(rows[0]?.subdistrict.subdistrictNameTh).toBeTruthy();
  });
});

describe("search", () => {
  it("finds addresses by English province name", () => {
    const rows = search("Chiang Mai");
    expect(rows.length).toBeGreaterThan(0);
    expect(
      rows.some((r) => r.province.provinceNameEn === "Chiang Mai")
    ).toBe(true);
  });

  it("finds addresses by postal code prefix", () => {
    const rows = search("1020");
    expect(rows.every((r) => String(r.postalCode).startsWith("1020"))).toBe(
      true
    );
  });
});

describe("formatAddress", () => {
  it("uses Bangkok prefixes for กรุงเทพมหานคร", () => {
    const formatted = formatAddress({
      province: {
        provinceCode: 10,
        provinceNameTh: "กรุงเทพมหานคร",
        provinceNameEn: "Bangkok",
      },
      district: {
        districtCode: 1001,
        districtNameTh: "พระนคร",
        districtNameEn: "Phra Nakhon",
      },
      subdistrict: {
        subdistrictCode: 100101,
        subdistrictNameTh: "พระบรมมหาราชวัง",
        subdistrictNameEn: "Phra Borom Maha Ratchawang",
        postalCode: 10200,
      },
    });

    expect(formatted).toBe(
      "แขวงพระบรมมหาราชวัง เขตพระนคร จังหวัดกรุงเทพมหานคร 10200"
    );
  });

  it("uses อำเภอ/ตำบล outside Bangkok", () => {
    const formatted = formatAddress({
      province: {
        provinceCode: 50,
        provinceNameTh: "เชียงใหม่",
        provinceNameEn: "Chiang Mai",
      },
      district: {
        districtCode: 5001,
        districtNameTh: "เมืองเชียงใหม่",
        districtNameEn: "Mueang Chiang Mai",
      },
      subdistrict: {
        subdistrictCode: 500101,
        subdistrictNameTh: "ศรีภูมิ",
        subdistrictNameEn: "Si Phum",
        postalCode: 50200,
      },
    });

    expect(formatted).toBe(
      "ตำบลศรีภูมิ อำเภอเมืองเชียงใหม่ จังหวัดเชียงใหม่ 50200"
    );
  });

  it("formats English names and a th/en pair", () => {
    const selection = {
      province: {
        provinceCode: 10,
        provinceNameTh: "กรุงเทพมหานคร",
        provinceNameEn: "Bangkok",
      },
      district: {
        districtCode: 1001,
        districtNameTh: "พระนคร",
        districtNameEn: "Phra Nakhon",
      },
      subdistrict: {
        subdistrictCode: 100101,
        subdistrictNameTh: "พระบรมมหาราชวัง",
        subdistrictNameEn: "Phra Borom Maha Ratchawang",
        postalCode: 10200,
      },
    };

    expect(formatAddressEn(selection)).toBe(
      "Phra Borom Maha Ratchawang, Phra Nakhon, Bangkok, 10200"
    );
    expect(formatAddressPair(selection)).toEqual({
      th: "แขวงพระบรมมหาราชวัง เขตพระนคร จังหวัดกรุงเทพมหานคร 10200",
      en: "Phra Borom Maha Ratchawang, Phra Nakhon, Bangkok, 10200",
    });
  });
});
