import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { formatAddress, type AddressResult } from "thailand-postcode";
import { useAddressSearch } from "thailand-postcode/react";
import { CodeBlock, ValueDisplay } from "./CodeBlock";

function resultLabel(hit: AddressResult): string {
  return formatAddress({
    province: hit.province,
    district: hit.district,
    subdistrict: hit.subdistrict,
    postalCode: hit.postalCode,
  });
}

export function AutosuggestDemo() {
  const listboxId = useId();
  const inputId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AddressResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const results = useAddressSearch(query, 12);
  const showList = isOpen && query.trim().length > 0;

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function pick(hit: AddressResult) {
    setSelected(hit);
    setQuery(resultLabel(hit));
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showList || results.length === 0) {
      if (event.key === "Escape") setIsOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        index <= 0 ? results.length - 1 : index - 1
      );
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      pick(results[activeIndex]!);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
    }
  }

  return (
    <div>
      <h1 className="demo-section-title">Address search</h1>
      <p className="demo-section-desc">
        Type a Thai or English place name, or a postal code, via{" "}
        <code>useAddressSearch</code>.
      </p>
      <div className="demo-row">
        <div className="demo-preview">
          <div className="demo-card suggest" ref={rootRef}>
            <label htmlFor={inputId}>ค้นหาที่อยู่</label>
            <input
              id={inputId}
              className="suggest-input"
              type="search"
              role="combobox"
              autoComplete="off"
              spellCheck={false}
              placeholder="ชื่อจังหวัด อำเภอ ตำบล หรือรหัสไปรษณีย์"
              value={query}
              aria-expanded={showList}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={
                activeIndex >= 0
                  ? `${listboxId}-option-${activeIndex}`
                  : undefined
              }
              onChange={(event) => {
                setQuery(event.target.value);
                setSelected(null);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
            />

            {showList ? (
              <ul
                id={listboxId}
                className="suggest-list"
                role="listbox"
                aria-label="ผลการค้นหา"
              >
                {results.length === 0 ? (
                  <li className="suggest-empty" role="presentation">
                    ไม่พบผลลัพธ์
                  </li>
                ) : (
                  results.map((hit, index) => {
                    const label = resultLabel(hit);
                    const isActive = index === activeIndex;
                    return (
                      <li
                        key={hit.subdistrict.subdistrictCode}
                        id={`${listboxId}-option-${index}`}
                        role="option"
                        aria-selected={isActive}
                        className={
                          isActive
                            ? "suggest-option is-active"
                            : "suggest-option"
                        }
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          pick(hit);
                        }}
                      >
                        <span className="suggest-option-main">{label}</span>
                        <span className="suggest-option-meta">
                          {hit.subdistrict.subdistrictNameEn},{" "}
                          {hit.district.districtNameEn},{" "}
                          {hit.province.provinceNameEn}
                        </span>
                      </li>
                    );
                  })
                )}
              </ul>
            ) : null}
          </div>
        </div>
        <div className="demo-info">
          <ValueDisplay
            value={selected ? resultLabel(selected) : ""}
          />
          <CodeBlock
            code={`import { useAddressSearch } from "thailand-postcode/react";

const results = useAddressSearch(query, 12);`}
          />
        </div>
      </div>
    </div>
  );
}
