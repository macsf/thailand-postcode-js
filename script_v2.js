import { provinces } from "./json/provinces.js";
import { districts } from "./json/districts.js";
import { subdistricts } from "./json/subdistricts.js";
import { zipcodes } from "./json/zipcodes.js";

function createOption(item, idKey, valueKey) {
  const option = document.createElement("option");
  option.id = item[idKey].trim();
  option.value = item[valueKey].trim();
  option.textContent = item[valueKey].trim();
  return option;
}

function sortProvinces(items) {
  const [first, ...rest] = items;
  return [
    first,
    ...rest.sort((a, b) =>
      a.province_name.localeCompare(b.province_name, "th")
    ),
  ];
}

function sortAlphabetically(a, b, key) {
  const nameA = a[key];
  const nameB = b[key];

  const starA = nameA.startsWith("*");
  const starB = nameB.startsWith("*");

  if (starA && !starB) return 1;
  if (!starA && starB) return -1;

  return nameA.localeCompare(nameB, "th");
}

function loadOptions(items, dropdownId, idKey, valueKey, sortFn) {
  const dropdown = document.getElementById(dropdownId);
  const fragment = document.createDocumentFragment();

  const sortedItems = sortFn ? sortFn(items) : items;

  for (const item of sortedItems) {
    fragment.appendChild(createOption(item, idKey, valueKey));
  }

  dropdown.appendChild(fragment);
}

function optionPlaceholder() {
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = "";
  return placeholderOption;
}

function updateOutput(values) {
  const output = document.getElementById("output");

  if (!values) {
    output.style.display = "none";
  } else {
    output.style.display = "block";
    output.textContent = values;
  }
}

function matchZipcodesToSubdistricts() {
  const matchedData = subdistricts.map((subdistrict) => {
    const zipcodeEntry = zipcodes.find(
      (zipcode) => zipcode.subdistrict_code === subdistrict.subdistrict_code
    );

    if (zipcodeEntry) {
      return {
        ...subdistrict,
        zipcode_name: zipcodeEntry.zipcode_name,
      };
    }

    return subdistrict;
  });

  return matchedData;
}

function loadSubdistricts(subdistricts, district_id) {
  const filtered_subdistrict = subdistricts.filter(
    (item) => item.district_id === district_id
  );
  const matchedSubdistricts = matchZipcodesToSubdistricts(filtered_subdistrict);
  loadOptions(
    matchedSubdistricts,
    "subdistrict",
    "subdistrict_id",
    "subdistrict_name"
  );
}

document.addEventListener("DOMContentLoaded", function () {
  loadOptions(
    provinces,
    "province",
    "province_id",
    "province_name",
    sortProvinces
  );

  const optProvince = document.getElementById("province");
  const optDistrict = document.getElementById("district");
  const optSubdistrict = document.getElementById("subdistrict");

  function getSelectedValues() {
    const province =
      optProvince.options[optProvince.selectedIndex]?.textContent || "";
    const district =
      optDistrict.options[optDistrict.selectedIndex]?.textContent || "";
    const subdistrict =
      optSubdistrict.options[optSubdistrict.selectedIndex]?.textContent || "";

    const selectedSubdistrict = subdistricts.find(
      (item) =>
        item.subdistrict_id ===
        optSubdistrict.options[optSubdistrict.selectedIndex]?.id
    );
    const zipcode = selectedSubdistrict
      ? zipcodes.find(
          (zip) => zip.subdistrict_code === selectedSubdistrict.subdistrict_code
        )?.zipcode_name
      : "";

    let district_prefix, subdistrict_prefix;

    if (province === "กรุงเทพมหานคร") {
      district_prefix = "เขต";
      subdistrict_prefix = "แขวง";
    } else {
      district_prefix = "อำเภอ";
      subdistrict_prefix = "ตำบล";
    }

    const provinceStr = province ? `จังหวัด${province}` : "";
    const districtStr = district ? `${district_prefix}${district}` : "";
    const subdistrictStr = subdistrict
      ? `${subdistrict_prefix}${subdistrict}`
      : "";
    const zipcodeStr = zipcode ? `${zipcode}` : "";

    return [subdistrictStr, districtStr, provinceStr, zipcodeStr]
      .filter((val) => val)
      .join(" ");
  }

  optProvince.addEventListener("change", function () {
    const province_id = optProvince.options[optProvince.selectedIndex].id;

    optDistrict.options.length = 0;
    optDistrict.appendChild(optionPlaceholder());

    optSubdistrict.options.length = 0;
    optSubdistrict.appendChild(optionPlaceholder());

    const filtered_district = districts.filter(
      (item) => item.province_id === province_id
    );
    loadOptions(
      filtered_district,
      "district",
      "district_id",
      "district_name",
      (items) => items.sort((a, b) => sortAlphabetically(a, b, "district_name"))
    );

    updateOutput(getSelectedValues());
  });

  optDistrict.addEventListener("change", function () {
    const district_id = optDistrict.options[optDistrict.selectedIndex].id;

    optSubdistrict.options.length = 0;
    optSubdistrict.appendChild(optionPlaceholder());

    const filtered_subdistrict = subdistricts.filter(
      (item) => item.district_id === district_id
    );
    loadOptions(
      filtered_subdistrict,
      "subdistrict",
      "subdistrict_id",
      "subdistrict_name",
      (items) =>
        items.sort((a, b) => sortAlphabetically(a, b, "subdistrict_name"))
    );

    updateOutput(getSelectedValues());
  });

  optSubdistrict.addEventListener("change", function () {
    updateOutput(getSelectedValues());
  });
});
