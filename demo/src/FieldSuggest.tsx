import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

export interface FieldSuggestOption {
  id: string;
  label: string;
  meta?: string;
}

interface FieldSuggestProps {
  label: string;
  placeholder?: string;
  value: string;
  options: FieldSuggestOption[];
  disabled?: boolean;
  onPick: (option: FieldSuggestOption) => void;
  onClear: () => void;
}

export function FieldSuggest({
  label,
  placeholder = "",
  value,
  options,
  disabled = false,
  onPick,
  onClear,
}: FieldSuggestProps) {
  const reactId = useId();
  const inputId = `${reactId}-input`;
  const listboxId = `${reactId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle || query === value) return options.slice(0, 20);
    return options
      .filter(
        (option) =>
          option.label.toLowerCase().includes(needle) ||
          option.meta?.toLowerCase().includes(needle)
      )
      .slice(0, 20);
  }, [options, query, value]);

  const showList = isOpen && !disabled;

  useEffect(() => {
    setActiveIndex(-1);
  }, [query, isOpen]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        if (!value) setQuery("");
        else setQuery(value);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [value]);

  function pick(option: FieldSuggestOption) {
    setQuery(option.label);
    setIsOpen(false);
    setActiveIndex(-1);
    onPick(option);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showList || filtered.length === 0) {
      if (event.key === "Escape") setIsOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % filtered.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        index <= 0 ? filtered.length - 1 : index - 1
      );
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      pick(filtered[activeIndex]!);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      setQuery(value);
    }
  }

  return (
    <div className="field-suggest" ref={rootRef} data-disabled={disabled || undefined}>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        className="suggest-input"
        type="search"
        role="combobox"
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        value={query}
        disabled={disabled}
        aria-expanded={showList}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
        }
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          setIsOpen(true);
          if (value && next !== value) onClear();
        }}
        onFocus={() => {
          if (!disabled) setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />

      {showList ? (
        <ul
          id={listboxId}
          className="suggest-list field-suggest-list"
          role="listbox"
          aria-label={label}
        >
          {filtered.length === 0 ? (
            <li className="suggest-empty" role="presentation">
              ไม่พบผลลัพธ์
            </li>
          ) : (
            filtered.map((option, index) => {
              const isActive = index === activeIndex;
              return (
                <li
                  key={option.id}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={isActive}
                  className={
                    isActive ? "suggest-option is-active" : "suggest-option"
                  }
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    pick(option);
                  }}
                >
                  <span className="suggest-option-main">{option.label}</span>
                  {option.meta ? (
                    <span className="suggest-option-meta">{option.meta}</span>
                  ) : null}
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
