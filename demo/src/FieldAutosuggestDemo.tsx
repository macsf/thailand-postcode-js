import { useMemo, useState } from "react";
import { formatAddress } from "thailand-postcode";
import {
  useDistricts,
  useProvinces,
  useSubdistricts,
} from "thailand-postcode/react";
import {
  FieldSuggest,
  type FieldSuggestOption,
} from "./FieldSuggest";

export function FieldAutosuggestDemo() {
  const [province, setProvince] = useState<FieldSuggestOption | null>(null);
  const [district, setDistrict] = useState<FieldSuggestOption | null>(null);
  const [subdistrict, setSubdistrict] = useState<FieldSuggestOption | null>(
    null
  );

  const provinces = useProvinces();
  const districts = useDistricts(province?.id ?? null);
  const subdistricts = useSubdistricts(district?.id ?? null);

  const provinceOptions = useMemo(
    () =>
      provinces.map((item) => ({
        id: String(item.provinceCode),
        label: item.provinceNameTh,
        meta: item.provinceNameEn,
      })),
    [provinces]
  );

  const districtOptions = useMemo(
    () =>
      districts.map((item) => ({
        id: String(item.districtCode),
        label: item.districtNameTh,
        meta: item.districtNameEn,
      })),
    [districts]
  );

  const subdistrictOptions = useMemo(
    () =>
      subdistricts.map((item) => ({
        id: String(item.subdistrictCode),
        label: item.subdistrictNameTh,
        meta: `${item.subdistrictNameEn} · ${item.postalCode}`,
      })),
    [subdistricts]
  );

  const selectedSubdistrict = useMemo(
    () =>
      subdistrict
        ? subdistricts.find(
            (item) => String(item.subdistrictCode) === subdistrict.id
          )
        : undefined,
    [subdistrict, subdistricts]
  );

  const formatted =
    province && district && selectedSubdistrict
      ? formatAddress({
          province: {
            provinceCode: Number(province.id),
            provinceNameTh: province.label,
            provinceNameEn: province.meta ?? "",
          },
          district: {
            districtCode: Number(district.id),
            districtNameTh: district.label,
            districtNameEn: district.meta ?? "",
          },
          subdistrict: {
            subdistrictCode: selectedSubdistrict.subdistrictCode,
            subdistrictNameTh: selectedSubdistrict.subdistrictNameTh,
            subdistrictNameEn: selectedSubdistrict.subdistrictNameEn,
            postalCode: selectedSubdistrict.postalCode,
          },
          postalCode: selectedSubdistrict.postalCode,
        })
      : "";

  return (
    <>
      <div className="cascade field-cascade">
        <FieldSuggest
          label="จังหวัด"
          placeholder="พิมพ์ชื่อจังหวัด"
          value={province?.label ?? ""}
          options={provinceOptions}
          onPick={(option) => {
            setProvince(option);
            setDistrict(null);
            setSubdistrict(null);
          }}
          onClear={() => {
            setProvince(null);
            setDistrict(null);
            setSubdistrict(null);
          }}
        />
        <FieldSuggest
          label="เขต/อำเภอ"
          placeholder="พิมพ์ชื่อเขตหรืออำเภอ"
          value={district?.label ?? ""}
          options={districtOptions}
          disabled={!province}
          onPick={(option) => {
            setDistrict(option);
            setSubdistrict(null);
          }}
          onClear={() => {
            setDistrict(null);
            setSubdistrict(null);
          }}
        />
        <FieldSuggest
          label="แขวง/ตำบล"
          placeholder="พิมพ์ชื่อแขวงหรือตำบล"
          value={subdistrict?.label ?? ""}
          options={subdistrictOptions}
          disabled={!district}
          onPick={setSubdistrict}
          onClear={() => setSubdistrict(null)}
        />
      </div>

      {formatted ? (
        <output className="output" aria-live="polite">
          {formatted}
        </output>
      ) : null}
    </>
  );
}
