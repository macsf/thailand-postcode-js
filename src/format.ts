import { BANGKOK_PROVINCE_CODE } from "./indexes.js";
import type { AddressSelection, LocalizedName } from "./types.js";

function isBangkok(selection: AddressSelection): boolean {
  if (selection.province?.provinceCode === BANGKOK_PROVINCE_CODE) return true;
  if (selection.province?.provinceNameTh === "กรุงเทพมหานคร") return true;
  return false;
}

function postalOf(selection: AddressSelection): string {
  if (selection.postalCode != null && selection.postalCode !== "") {
    return String(selection.postalCode).trim();
  }
  if (selection.subdistrict?.postalCode != null) {
    return String(selection.subdistrict.postalCode);
  }
  return "";
}

/**
 * Format a Thai address string with Bangkok-aware prefixes
 * (เขต/แขวง vs อำเภอ/ตำบล).
 */
export function formatAddress(selection: AddressSelection): string {
  const provinceName = selection.province?.provinceNameTh?.trim() || "";
  const districtName = selection.district?.districtNameTh?.trim() || "";
  const subdistrictName = selection.subdistrict?.subdistrictNameTh?.trim() || "";
  const postalCode = postalOf(selection);

  const bangkok = isBangkok(selection);
  const districtPrefix = bangkok ? "เขต" : "อำเภอ";
  const subdistrictPrefix = bangkok ? "แขวง" : "ตำบล";

  const parts = [
    subdistrictName ? `${subdistrictPrefix}${subdistrictName}` : "",
    districtName ? `${districtPrefix}${districtName}` : "",
    provinceName ? `จังหวัด${provinceName}` : "",
    postalCode,
  ];

  return parts.filter(Boolean).join(" ");
}

/** Format an English address line: subdistrict, district, province, postal. */
export function formatAddressEn(selection: AddressSelection): string {
  const parts = [
    selection.subdistrict?.subdistrictNameEn?.trim() || "",
    selection.district?.districtNameEn?.trim() || "",
    selection.province?.provinceNameEn?.trim() || "",
    postalOf(selection),
  ];

  return parts.filter(Boolean).join(", ");
}

/** Thai and English formatted lines. */
export function formatAddressPair(selection: AddressSelection): LocalizedName {
  return {
    th: formatAddress(selection),
    en: formatAddressEn(selection),
  };
}
