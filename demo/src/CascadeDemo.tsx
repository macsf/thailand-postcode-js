import { useState } from "react";
import {
  AddressCascade,
  type AddressCascadeChange,
} from "thailand-postcode/react";
import { CodeBlock, JsonDisplay, ValueDisplay } from "./CodeBlock";

export function CascadeDemo() {
  const [result, setResult] = useState<AddressCascadeChange | null>(null);

  return (
    <div>
      <h1 className="demo-section-title">Cascade selects</h1>
      <p className="demo-section-desc">
        <code>onChange</code> receives{" "}
        <code>{"{ value, selection, formatted }"}</code>. Codes are strings for
        form fields; <code>selection</code> holds the resolved names and
        postal code.
      </p>
      <div className="demo-row">
        <div className="demo-preview">
          <div className="demo-card">
            <AddressCascade
              className="cascade"
              selectClassName="select"
              onChange={setResult}
            />
          </div>
        </div>
        <div className="demo-info">
          <ValueDisplay
            label="formatted"
            value={result?.formatted ?? ""}
          />
          <JsonDisplay label="onChange payload" value={result} />
          <CodeBlock
            code={`import { AddressCascade } from "thailand-postcode/react";

<AddressCascade
  onChange={(change) => {
    // change.value.provinceCode
    // change.selection.postalCode
    // change.formatted
  }}
/>`}
          />
        </div>
      </div>
    </div>
  );
}
