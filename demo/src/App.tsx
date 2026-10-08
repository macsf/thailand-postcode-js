import { useState, type ComponentType } from "react";
import pkg from "../../package.json";
import { AutosuggestDemo } from "./AutosuggestDemo";
import { CascadeDemo } from "./CascadeDemo";
import { FieldAutosuggestDemo } from "./FieldAutosuggestDemo";
import { ZipcodeDemo } from "./ZipcodeDemo";

type DemoMode = "cascade" | "autosuggest" | "fields" | "zipcode";

const SECTIONS: { id: DemoMode; label: string; Component: ComponentType }[] = [
  { id: "cascade", label: "1. Cascade", Component: CascadeDemo },
  { id: "autosuggest", label: "2. Address search", Component: AutosuggestDemo },
  { id: "fields", label: "3. Per-field suggest", Component: FieldAutosuggestDemo },
  { id: "zipcode", label: "4. Postal code", Component: ZipcodeDemo },
];

export function App() {
  const [active, setActive] = useState<DemoMode>("cascade");
  const section = SECTIONS.find((item) => item.id === active)!;
  const SectionComponent = section.Component;

  return (
    <div className="demo-layout">
      <aside className="demo-sidebar">
        <div className="demo-sidebar-title">
          Thailand Postcode{" "}
          <span className="demo-version">v{pkg.version}</span>
        </div>
        <nav>
          <ul className="demo-nav">
            {SECTIONS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={[
                    "demo-nav-item",
                    active === item.id ? "active" : "",
                  ].join(" ")}
                  onClick={() => setActive(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="demo-content">
        <SectionComponent />
      </main>
    </div>
  );
}
