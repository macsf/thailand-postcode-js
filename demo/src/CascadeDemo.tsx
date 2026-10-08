import { useState } from "react";
import {
  AddressCascade,
  type AddressCascadeChange,
} from "thailand-postcode/react";

export function CascadeDemo() {
  const [result, setResult] = useState<AddressCascadeChange | null>(null);

  return (
    <>
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
    </>
  );
}
