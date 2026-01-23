import React, { useState } from "react";
import { Autocomplete, toISODate, useGraphqlQuery, useTranslations } from "@openimis/fe-core";

const LabServicePicker = (props) => {
  const {
    onChange,
    readOnly,
    required,
    withLabel,
    withPlaceholder,
    value,
    label,
    filterOptions,
    pricelistUuid,
    date,
    filterSelectedOptions,
    placeholder,
    extraFragment,
    multiple,
  } = props;
  const [searchString, setSearchString] = useState(null);
  const { formatMessage } = useTranslations("medical");

  const { isLoading, data, error } = useGraphqlQuery(
    `query ($first: Int) {
      medicalLabServices(first: $first) {
        edges {
          node {
            id
            name
            code
            price
            ${extraFragment ?? ""}
          }
        }
      }
    }`,
    { first: 100 },
    { skip: false },
  );

  const allOptions = data?.medicalLabServices?.edges.map((edge) => edge.node) ?? [];
  const normalizedSearch = (searchString ?? "").trim().toLowerCase();
  const filteredOptions =
    normalizedSearch.length === 0
      ? allOptions
      : allOptions.filter((o) =>
          `${o.code ?? ""} ${o.name ?? ""}`.toLowerCase().includes(normalizedSearch),
        );

  return (
    <Autocomplete
      multiple={multiple}
      required={required}
      placeholder={placeholder ?? formatMessage("LabServicePicker.placeholder")}
      label={label ?? formatMessage("LabServicePicker.label")}
      error={error}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={filteredOptions}
      isLoading={isLoading}
      getOptionSelected={(option, value) => option.id === value?.id}
      value={value}
      getOptionLabel={(option) => `${option.code} ${option.name}`}
      onChange={onChange}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default LabServicePicker;
