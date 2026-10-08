import { useState } from "react";
import {
  AddressCascade,
  type AddressCascadeChange,
} from "thailand-postcode/react";

export function App() {
  const [result, setResult] = useState<AddressCascadeChange | null>(null);

  return (
    <main className="page">
      <header className="header">
        <h1>Thailand Postcode</h1>
        <p>Province, district, subdistrict, and zipcode cascade.</p>
      </header>

      <AddressCascade
        className="cascade"
        selectClassName="select"
        onChange={setResult}
      />

      {result?.formatted ? (
        <output className="output" aria-live="polite">
          {result.formatted}
        </output>
      ) : null}
    </main>
  );
}
