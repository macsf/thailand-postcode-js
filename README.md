# thailand-postcode

Thai province / district / subdistrict / postal-code lookup with an optional React cascade.

Data comes from
[thailand-geography-data/thailand-geography-json](https://github.com/thailand-geography-data/thailand-geography-json)
(MIT), pinned as a git dependency and bundled into `dist/` at build time.

## Install

```bash
pnpm add thailand-postcode
```

React helpers need React 18+:

```bash
pnpm add react react-dom
```

## Query API

```ts
import {
  formatAddress,
  getByZipcode,
  getDistrictsByProvince,
  getProvinces,
  getSubdistrictsByDistrict,
  search,
} from "thailand-postcode";

const provinces = getProvinces(); // Bangkok first, then Thai locale order
const districts = getDistrictsByProvince(10);
const subdistricts = getSubdistrictsByDistrict(1001);
const byZip = getByZipcode(10200);
const hits = search("Chiang Mai");

const formatted = formatAddress({
  province: provinces[0],
  district: districts[0],
  subdistrict: subdistricts[0],
});
// แขวงพระบรมมหาราชวัง เขตพระนคร จังหวัดกรุงเทพมหานคร 10200
```

Bangkok (`provinceCode` `10`) uses `เขต` / `แขวง`. Other provinces use `อำเภอ` / `ตำบล`.

### Types

| Type | Key fields |
| --- | --- |
| `Province` | `provinceCode`, `provinceNameTh`, `provinceNameEn` |
| `District` | `districtCode`, `provinceCode`, `districtNameTh`, `districtNameEn`, `postalCode` |
| `Subdistrict` | `subdistrictCode`, `districtCode`, `provinceCode`, `subdistrictNameTh`, `subdistrictNameEn`, `postalCode` |

Field names match the upstream geography JSON.

## React

`AddressCascade` `onChange` returns a simple JSON payload by default:

```json
{
  "province": { "th": "กรุงเทพมหานคร", "en": "Bangkok" },
  "district": { "th": "พระนคร", "en": "Phra Nakhon" },
  "subdistrict": { "th": "พระบรมมหาราชวัง", "en": "Phra Borom Maha Ratchawang" },
  "postalCode": 10200
}
```

Optional flags:

- `includeFormatted`: adds `formatted: { th, en }`
- `detail`: adds `value` (codes) and full `selection`

```tsx
import { useState } from "react";
import {
  AddressCascade,
  type AddressCascadeChange,
} from "thailand-postcode/react";

export function AddressForm() {
  const [result, setResult] = useState<AddressCascadeChange | null>(null);

  return (
    <>
      <AddressCascade includeFormatted onChange={setResult} />

      {result ? (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      ) : null}

      {/*
        result = {
          province: { th, en },
          district: { th, en },
          subdistrict: { th, en },
          postalCode,
          formatted: { th, en }   // when includeFormatted
          // value, selection      // when detail
        }
      */}
    </>
  );
}
```

Also: `formatAddress`, `formatAddressEn`, `formatAddressPair`.

Hooks: `useProvinces()`, `useDistricts(provinceCode)`, `useSubdistricts(districtCode)`, `useAddressSearch(query)`.

## Demo

Live: [macsf.github.io/thailand-postcode-js](https://macsf.github.io/thailand-postcode-js/)

```bash
pnpm install
pnpm demo          # http://localhost:5173/thailand-postcode-js/
pnpm build:demo    # writes dist-demo/ for GitHub Pages
```

The demo mirrors the date-picker layout: sidebar sections for cascade selects, address search, per-field autosuggest, and postal-code lookup. Pushing to `main` deploys Pages via `.github/workflows/pages.yml`.

## Keeping geography data current

The git SHA in `package.json` is pinned on purpose. A weekly workflow compares it to upstream `main` and opens an issue when newer data exists.

```bash
pnpm check-upstream   # fail if upstream main is ahead
pnpm update-data      # bump dependency, test, build
```

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm build` | Build ESM + typings to `dist/` |
| `pnpm test` | Run Vitest |
| `pnpm typecheck` | TypeScript check |
| `pnpm check-upstream` | Compare pinned geography SHA to upstream |
| `pnpm update-data` | Bump geography dependency, then test and build |
| `pnpm demo` | Start the Vite React demo |
| `pnpm build:demo` | Build the demo to `dist-demo/` |

## License

MIT. Upstream geography data is also MIT-licensed.
