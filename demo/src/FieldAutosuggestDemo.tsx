import { useMemo, useState } from "react";
import { formatAddressPair } from "thailand-postcode";
import {
  useDistricts,
  useProvinces,
  useSubdistricts,
} from "thailand-postcode/react";
import { CodeBlock } from "./CodeBlock";
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

  const payload = useMemo(() => {
    if (!province && !district && !selectedSubdistrict) return null;

    const selection = {
      province: province
        ? {
            provinceCode: Number(province.id),
            provinceNameTh: province.label,
            provinceNameEn: province.meta ?? "",
          }
        : null,
      district: district
        ? {
            districtCode: Number(district.id),
            districtNameTh: district.label,
            districtNameEn: district.meta ?? "",
          }
        : null,
      subdistrict: selectedSubdistrict
        ? {
            subdistrictCode: selectedSubdistrict.subdistrictCode,
            subdistrictNameTh: selectedSubdistrict.subdistrictNameTh,
            subdistrictNameEn: selectedSubdistrict.subdistrictNameEn,
            postalCode: selectedSubdistrict.postalCode,
          }
        : null,
      postalCode: selectedSubdistrict?.postalCode ?? null,
    };

    return {
      province: province
        ? { th: province.label, en: province.meta ?? "" }
        : null,
      district: district
        ? { th: district.label, en: district.meta ?? "" }
        : null,
      subdistrict: selectedSubdistrict
        ? {
            th: selectedSubdistrict.subdistrictNameTh,
            en: selectedSubdistrict.subdistrictNameEn,
          }
        : null,
      postalCode: selectedSubdistrict?.postalCode ?? null,
      formatted: formatAddressPair(selection),
    };
  }, [province, district, selectedSubdistrict]);

  return (
    <div>
      <h1 className="demo-section-title">Per-field autosuggest</h1>
      <p className="demo-section-desc">
        Same simplified payload shape as the cascade form.
      </p>
      <div className="demo-row">
        <div className="demo-preview">
          <div className="demo-card cascade field-cascade">
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
        </div>
        <div className="demo-info">
          <div className="demo-value-label">payload</div>
          <pre className="demo-json" aria-live="polite">
            {payload ? JSON.stringify(payload, null, 2) : "null"}
          </pre>
          <CodeBlock
            code={`import {
  useProvinces,
  useDistricts,
  useSubdistricts,
} from "thailand-postcode/react";`}
          />
        </div>
      </div>
    </div>
  );
}
