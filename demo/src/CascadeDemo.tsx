import { useState } from "react";
import {
  AddressCascade,
  type AddressCascadeChange,
} from "thailand-postcode/react";
import { CodeBlock, ValueDisplay } from "./CodeBlock";

export function CascadeDemo() {
  const [result, setResult] = useState<AddressCascadeChange | null>(null);

  return (
    <div>
      <h1 className="demo-section-title">Cascade selects</h1>
      <p className="demo-section-desc">
        Pick province, then district, then subdistrict. Bangkok uses เขต / แขวง;
        other provinces use อำเภอ / ตำบล.
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
          <ValueDisplay value={result?.formatted ?? ""} />
          <CodeBlock
            code={`import { AddressCascade } from "thailand-postcode/react";

<AddressCascade onChange={setResult} />`}
          />
        </div>
      </div>
    </div>
  );
}
