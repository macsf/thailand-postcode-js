import { BANGKOK_PROVINCE_CODE } from "./indexes.js";
import type { AddressSelection } from "./types.js";

function isBangkok(selection: AddressSelection): boolean {
  if (selection.province?.provinceCode === BANGKOK_PROVINCE_CODE) return true;
  if (selection.province?.provinceNameTh === "กรุงเทพมหานคร") return true;
  return false;
}

/**
 * Format a Thai address string with Bangkok-aware prefixes
 * (เขต/แขวง vs อำเภอ/ตำบล).
 */
export function formatAddress(selection: AddressSelection): string {
  const provinceName = selection.province?.provinceNameTh?.trim() || "";
  const districtName = selection.district?.districtNameTh?.trim() || "";
  const subdistrictName = selection.subdistrict?.subdistrictNameTh?.trim() || "";
  const postalCode =
    selection.postalCode != null && selection.postalCode !== ""
      ? String(selection.postalCode).trim()
      : selection.subdistrict?.postalCode != null
        ? String(selection.subdistrict.postalCode)
        : "";

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
