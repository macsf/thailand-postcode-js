import { useId, useMemo, useState } from "react";
import {
  formatAddress,
  formatAddressPair,
  getByZipcode,
} from "thailand-postcode";
import { CodeBlock } from "./CodeBlock";

export function ZipcodeDemo() {
  const inputId = useId();
  const [zipcode, setZipcode] = useState("");

  const results = useMemo(() => {
    if (!/^\d{5}$/.test(zipcode)) return [];
    return getByZipcode(zipcode);
  }, [zipcode]);

  const isPartial = zipcode.length > 0 && zipcode.length < 5;
  const isComplete = zipcode.length === 5;
  const hasResults = results.length > 0;

  const payload = hasResults
    ? results.map((hit) => ({
        province: {
          th: hit.province.provinceNameTh,
          en: hit.province.provinceNameEn,
        },
        district: {
          th: hit.district.districtNameTh,
          en: hit.district.districtNameEn,
        },
        subdistrict: {
          th: hit.subdistrict.subdistrictNameTh,
          en: hit.subdistrict.subdistrictNameEn,
        },
        postalCode: hit.postalCode,
        formatted: formatAddressPair({
          province: hit.province,
          district: hit.district,
          subdistrict: hit.subdistrict,
          postalCode: hit.postalCode,
        }),
      }))
    : isComplete
      ? []
      : null;

  return (
    <div>
      <h1 className="demo-section-title">Postal code lookup</h1>
      <p className="demo-section-desc">
        <code>getByZipcode</code> rows mapped to the same names + postal shape.
      </p>
      <div className="demo-row">
        <div className="demo-preview">
          <div className="demo-card suggest">
            <label htmlFor={inputId}>รหัสไปรษณีย์</label>
            <input
              id={inputId}
              className="suggest-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={5}
              autoComplete="postal-code"
              spellCheck={false}
              placeholder="เช่น 10200"
              value={zipcode}
              onChange={(event) => {
                setZipcode(event.target.value.replace(/\D/g, "").slice(0, 5));
              }}
            />
            {isPartial ? (
              <p className="hint">พิมพ์ให้ครบ 5 หลัก</p>
            ) : null}

            {isComplete && !hasResults ? (
              <p className="hint" role="status">
                ไม่พบที่อยู่สำหรับรหัสนี้
              </p>
            ) : null}

            {hasResults ? (
              <ul className="result-list" aria-live="polite">
                {results.map((hit) => {
                  const label = formatAddress({
                    province: hit.province,
                    district: hit.district,
                    subdistrict: hit.subdistrict,
                    postalCode: hit.postalCode,
                  });
                  return (
                    <li
                      key={hit.subdistrict.subdistrictCode}
                      className="result-item"
                    >
                      <span className="suggest-option-main">{label}</span>
                      <span className="suggest-option-meta">
                        {hit.subdistrict.subdistrictNameEn},{" "}
                        {hit.district.districtNameEn},{" "}
                        {hit.province.provinceNameEn}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </div>
        <div className="demo-info">
          <div className="demo-value-label">payload</div>
          <pre className="demo-json" aria-live="polite">
            {payload ? JSON.stringify(payload, null, 2) : "null"}
          </pre>
          <CodeBlock
            code={`import { getByZipcode } from "thailand-postcode";

const rows = getByZipcode("10200");`}
          />
        </div>
      </div>
    </div>
  );
}
