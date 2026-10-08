"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { formatAddressPair } from "../format.js";
import {
  getDistrictByCode,
  getProvinceByCode,
  getSubdistrictByCode,
} from "../query.js";
import type {
  AddressSelection,
  District,
  LocalizedName,
  Province,
  Subdistrict,
} from "../types.js";
import { useDistricts, useProvinces, useSubdistricts } from "./hooks.js";

export interface AddressCascadeValue {
  provinceCode: string;
  districtCode: string;
  subdistrictCode: string;
}

/**
 * Default form payload: names (th/en) + postal.
 * Set `includeFormatted` for `formatted`, or `detail` for codes/`selection`.
 */
export interface AddressCascadeChange {
  province: LocalizedName | null;
  district: LocalizedName | null;
  subdistrict: LocalizedName | null;
  postalCode: number | null;
  formatted?: LocalizedName;
  value?: AddressCascadeValue;
  selection?: AddressSelection;
}

export interface AddressCascadeProps {
  value?: Partial<AddressCascadeValue>;
  defaultValue?: Partial<AddressCascadeValue>;
  onChange?: (change: AddressCascadeChange) => void;
  /** Include `formatted: { th, en }` on the payload. */
  includeFormatted?: boolean;
  /** Include `value` (codes) and full `selection` on the payload. */
  detail?: boolean;
  labels?: {
    province?: string;
    district?: string;
    subdistrict?: string;
  };
  placeholders?: {
    province?: string;
    district?: string;
    subdistrict?: string;
  };
  className?: string;
  selectClassName?: string;
  disabled?: boolean;
  namePrefix?: string;
}

function emptyValue(): AddressCascadeValue {
  return { provinceCode: "", districtCode: "", subdistrictCode: "" };
}

function buildSelection(
  provinceCode: string,
  districtCode: string,
  subdistrictCode: string
): AddressSelection {
  const province = provinceCode ? getProvinceByCode(provinceCode) : undefined;
  const district = districtCode ? getDistrictByCode(districtCode) : undefined;
  const subdistrict = subdistrictCode
    ? getSubdistrictByCode(subdistrictCode)
    : undefined;

  return {
    province: province
      ? {
          provinceCode: province.provinceCode,
          provinceNameTh: province.provinceNameTh,
          provinceNameEn: province.provinceNameEn,
        }
      : null,
    district: district
      ? {
          districtCode: district.districtCode,
          districtNameTh: district.districtNameTh,
          districtNameEn: district.districtNameEn,
        }
      : null,
    subdistrict: subdistrict
      ? {
          subdistrictCode: subdistrict.subdistrictCode,
          subdistrictNameTh: subdistrict.subdistrictNameTh,
          subdistrictNameEn: subdistrict.subdistrictNameEn,
          postalCode: subdistrict.postalCode,
        }
      : null,
    postalCode: subdistrict?.postalCode ?? null,
  };
}

function toLocalized(
  th: string | undefined,
  en: string | undefined
): LocalizedName | null {
  if (!th && !en) return null;
  return { th: th ?? "", en: en ?? "" };
}

function emitChange(
  next: AddressCascadeValue,
  options: {
    includeFormatted: boolean;
    detail: boolean;
  },
  onChange?: (change: AddressCascadeChange) => void
) {
  const selection = buildSelection(
    next.provinceCode,
    next.districtCode,
    next.subdistrictCode
  );

  const change: AddressCascadeChange = {
    province: toLocalized(
      selection.province?.provinceNameTh,
      selection.province?.provinceNameEn
    ),
    district: toLocalized(
      selection.district?.districtNameTh,
      selection.district?.districtNameEn
    ),
    subdistrict: toLocalized(
      selection.subdistrict?.subdistrictNameTh,
      selection.subdistrict?.subdistrictNameEn
    ),
    postalCode: (() => {
      if (typeof selection.postalCode === "number") {
        return Number.isFinite(selection.postalCode)
          ? selection.postalCode
          : null;
      }
      if (selection.postalCode == null || selection.postalCode === "") {
        return null;
      }
      const parsed = Number(selection.postalCode);
      return Number.isFinite(parsed) ? parsed : null;
    })(),
  };

  if (options.includeFormatted) {
    change.formatted = formatAddressPair(selection);
  }

  if (options.detail) {
    change.value = next;
    change.selection = selection;
  }

  onChange?.(change);
}

export function AddressCascade({
  value,
  defaultValue,
  onChange,
  includeFormatted = false,
  detail = false,
  labels,
  placeholders,
  className,
  selectClassName,
  disabled = false,
  namePrefix = "address",
}: AddressCascadeProps) {
  const reactId = useId();
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<AddressCascadeValue>(() => ({
    ...emptyValue(),
    ...defaultValue,
  }));

  const current: AddressCascadeValue = isControlled
    ? { ...emptyValue(), ...value }
    : internal;

  const provinces = useProvinces();
  const districts = useDistricts(current.provinceCode || null);
  const subdistricts = useSubdistricts(current.districtCode || null);

  const update = useCallback(
    (patch: Partial<AddressCascadeValue>) => {
      const next: AddressCascadeValue = {
        ...current,
        ...patch,
      };

      if (!isControlled) {
        setInternal(next);
      }
      emitChange(next, { includeFormatted, detail }, onChange);
    },
    [current, detail, includeFormatted, isControlled, onChange]
  );

  const handleProvince = useCallback(
    (provinceCode: string) => {
      update({ provinceCode, districtCode: "", subdistrictCode: "" });
    },
    [update]
  );

  const handleDistrict = useCallback(
    (districtCode: string) => {
      update({ districtCode, subdistrictCode: "" });
    },
    [update]
  );

  const handleSubdistrict = useCallback(
    (subdistrictCode: string) => {
      update({ subdistrictCode });
    },
    [update]
  );

  const fieldLabels = useMemo(
    () => ({
      province: labels?.province ?? "จังหวัด",
      district: labels?.district ?? "เขต/อำเภอ",
      subdistrict: labels?.subdistrict ?? "แขวง/ตำบล",
    }),
    [labels]
  );

  const fieldPlaceholders = useMemo(
    () => ({
      province: placeholders?.province ?? "",
      district: placeholders?.district ?? "",
      subdistrict: placeholders?.subdistrict ?? "",
    }),
    [placeholders]
  );

  return (
    <div className={className} data-thailand-postcode-cascade="">
      <CascadeSelect
        id={`${reactId}-province`}
        name={`${namePrefix}-province`}
        label={fieldLabels.province}
        value={current.provinceCode}
        placeholder={fieldPlaceholders.province}
        disabled={disabled}
        className={selectClassName}
        options={provinces}
        getOptionId={(item: Province) => String(item.provinceCode)}
        getOptionLabel={(item: Province) => item.provinceNameTh}
        onChange={handleProvince}
      />
      <CascadeSelect
        id={`${reactId}-district`}
        name={`${namePrefix}-district`}
        label={fieldLabels.district}
        value={current.districtCode}
        placeholder={fieldPlaceholders.district}
        disabled={disabled || !current.provinceCode}
        className={selectClassName}
        options={districts}
        getOptionId={(item: District) => String(item.districtCode)}
        getOptionLabel={(item: District) => item.districtNameTh}
        onChange={handleDistrict}
      />
      <CascadeSelect
        id={`${reactId}-subdistrict`}
        name={`${namePrefix}-subdistrict`}
        label={fieldLabels.subdistrict}
        value={current.subdistrictCode}
        placeholder={fieldPlaceholders.subdistrict}
        disabled={disabled || !current.districtCode}
        className={selectClassName}
        options={subdistricts}
        getOptionId={(item: Subdistrict) => String(item.subdistrictCode)}
        getOptionLabel={(item: Subdistrict) => item.subdistrictNameTh}
        onChange={handleSubdistrict}
      />
    </div>
  );
}

interface CascadeSelectProps<T> {
  id: string;
  name: string;
  label: string;
  value: string;
  placeholder: string;
  disabled: boolean;
  className?: string;
  options: T[];
  getOptionId: (item: T) => string;
  getOptionLabel: (item: T) => string;
  onChange: (value: string) => void;
}

function CascadeSelect<T>({
  id,
  name,
  label,
  value,
  placeholder,
  disabled,
  className,
  options,
  getOptionId,
  getOptionLabel,
  onChange,
}: CascadeSelectProps<T>) {
  return (
    <div data-field={name}>
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        className={className}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((item) => {
          const optionId = getOptionId(item);
          return (
            <option key={optionId} value={optionId}>
              {getOptionLabel(item)}
            </option>
          );
        })}
      </select>
    </div>
  );
}
