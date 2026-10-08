import { useState } from "react";
import {
  AddressCascade,
  type AddressCascadeChange,
} from "thailand-postcode/react";
import { CodeBlock } from "./CodeBlock";

export function CascadeDemo() {
  const [result, setResult] = useState<AddressCascadeChange | null>(null);
  const [includeFormatted, setIncludeFormatted] = useState(true);
  const [detail, setDetail] = useState(false);

  return (
    <div>
      <h1 className="demo-section-title">Cascade selects</h1>
      <p className="demo-section-desc">
        Default payload is names (th/en) plus postal. Toggle{" "}
        <code>includeFormatted</code> or <code>detail</code> for extras.
      </p>
      <div className="demo-row">
        <div className="demo-preview">
          <div className="demo-card">
            <div className="demo-flags">
              <label className="demo-flag">
                <input
                  type="checkbox"
                  checked={includeFormatted}
                  onChange={(event) => {
                    setIncludeFormatted(event.target.checked);
                    setResult(null);
                  }}
                />
                includeFormatted
              </label>
              <label className="demo-flag">
                <input
                  type="checkbox"
                  checked={detail}
                  onChange={(event) => {
                    setDetail(event.target.checked);
                    setResult(null);
                  }}
                />
                detail
              </label>
            </div>
            <AddressCascade
              key={`${includeFormatted}-${detail}`}
              className="cascade"
              selectClassName="select"
              includeFormatted={includeFormatted}
              detail={detail}
              onChange={setResult}
            />
          </div>

          <div className="demo-output-block">
            <div className="demo-value-label">onChange payload</div>
            <pre className="demo-json" aria-live="polite">
              {result ? JSON.stringify(result, null, 2) : "null"}
            </pre>
          </div>
        </div>

        <div className="demo-info">
          <CodeBlock
            code={`import { useState } from "react";
import {
  AddressCascade,
  type AddressCascadeChange,
} from "thailand-postcode/react";

export function AddressForm() {
  const [result, setResult] = useState<AddressCascadeChange | null>(null);

  return (
    <>
      <AddressCascade
        includeFormatted={${includeFormatted}}
        detail={${detail}}
        onChange={setResult}
      />
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </>
  );
}`}
          />
        </div>
      </div>
    </div>
  );
}
