import { useState } from "react";
import { AutosuggestDemo } from "./AutosuggestDemo";
import { CascadeDemo } from "./CascadeDemo";
import { FieldAutosuggestDemo } from "./FieldAutosuggestDemo";
import { ZipcodeDemo } from "./ZipcodeDemo";

type DemoMode = "cascade" | "autosuggest" | "fields" | "zipcode";

const modes: { id: DemoMode; label: string; description: string }[] = [
  {
    id: "cascade",
    label: "Cascade",
    description: "Province, district, subdistrict, and zipcode cascade.",
  },
  {
    id: "autosuggest",
    label: "Search",
    description: "Type a place name or zipcode to search addresses.",
  },
  {
    id: "fields",
    label: "Fields",
    description: "Autosuggest each field: province, district, then subdistrict.",
  },
  {
    id: "zipcode",
    label: "Zipcode",
    description: "Look up addresses by a 5-digit postal code.",
  },
];

export function App() {
  const [mode, setMode] = useState<DemoMode>("cascade");
  const active = modes.find((item) => item.id === mode)!;

  return (
    <main className="page">
      <header className="header">
        <h1>Thailand Postcode</h1>
        <p>{active.description}</p>
      </header>

      <div className="mode-switch" role="tablist" aria-label="Demo Mode">
        {modes.map((item) => {
          const isSelected = item.id === mode;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={isSelected ? "mode-btn is-selected" : "mode-btn"}
              onClick={() => setMode(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {mode === "cascade" ? (
        <CascadeDemo />
      ) : mode === "autosuggest" ? (
        <AutosuggestDemo />
      ) : mode === "fields" ? (
        <FieldAutosuggestDemo />
      ) : (
        <ZipcodeDemo />
      )}
    </main>
  );
}
