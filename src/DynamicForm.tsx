import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  RadioGroup,
  Radio,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  SvgIcon,
} from "@mui/material";
import DatePickerComponent from "./DatePickerComponent";

const ExpandMore = (props: any) => (
  <SvgIcon {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
  </SvgIcon>
);

export interface FormField {
  key: string;
  label: string;
  type?: "text" | "checkbox" | "radio" | "select" | "hidden" | "date" | "array";
  nestedFields?: FormField[];
  options?: { label: string; value: string }[] | ((formData: Record<string, any>) => { label: string; value: string }[]);
  defaultValue?: any;
  disabled?: boolean;
  required?: boolean;
  dependsOn?: string;
  showIf?: string;
  mapTo?: string;
  doNotMap?: boolean;
  mapFrom?: string;
  valueType?:
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "json"
  | "jsonString"
  | "array";
}

interface DynamicFormProps {
  fields: FormField[];
  disabled?: boolean;
  selectedValues?: Record<string, any> | null;
  submitButtonLabel?: string;
  hideSubmit?: boolean;
  onChange?: (values: Record<string, any>) => void;
  onSubmit?: (values: Record<string, any>) => void;
  onRemove?: (values: Record<string, any>) => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  disabled,
  submitButtonLabel = "Submit",
  selectedValues = {},
  hideSubmit,
  onChange,
  onSubmit,
  onRemove,
}) => {
  const setNestedValue = (
    obj: Record<string, any>,
    path: string,
    value: any,
  ): void => {
    const keys = path.split(".");
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
  };

  const getNestedValue = (obj: Record<string, any>, path: string): any => {
    return path.split(".").reduce((acc, key) => {
      if (acc && typeof acc === "object") {
        return acc[key];
      }
      return undefined;
    }, obj);
  };

  const convertToType = (
    value: unknown,
    type:
      | "string"
      | "number"
      | "boolean"
      | "date"
      | "json"
      | "jsonString"
      | "array",
  ) => {
    try {
      switch (type) {
        case "string":
          return String(value);

        case "number":
          const num = Number(value);
          return isNaN(num) ? null : num;

        case "boolean":
          if (typeof value === "string") {
            return value.toLowerCase() === "true";
          }
          return Boolean(value);

        case "date":
          const date = new Date(value as string | number);
          return isNaN(date.getTime()) ? null : date;

        case "json":
          if (typeof value === "string") {
            try {
              return JSON.parse(value);
            } catch {
              return null;
            }
          }
          return null;

        case "jsonString":
          if (typeof value === "string") {
            try {
              JSON.parse(value);
              return value;
            } catch {
              return null;
            }
          }
          return null;

        case "array":
          if (Array.isArray(value)) {
            return value;
          }
          return [];

        default:
          return null;
      }
    } catch {
      return null;
    }
  };

  const transformFormData = (
    data: Record<string, any>,
  ): Record<string, any> => {
    for (const key in data) {
      const f = fields.find((field) => field.key === key);
      let value = data[key];

      if (f?.valueType) {
        value = convertToType(value, f.valueType);
      }

      if (f?.mapTo) {
        setNestedValue(data, f.mapTo, value);
        delete data[key];
      } else if (!!f?.doNotMap) {
        delete data[key];
      } else {
        data[key] = value;
      }

      if (value === "" || value === undefined || value === null) {
        delete data[key];
      }
    }

    return data;
  };

  const [formData, setFormData] = useState<Record<string, any>>(() =>
    fields.reduce(
      (acc, field) => {
        acc[field.key] =
          selectedValues?.[field.key] ??
          getNestedValue(selectedValues || {}, field.mapFrom || "") ??
          getNestedValue(selectedValues || {}, field.mapTo || "") ??
          field.defaultValue ??
          (field?.type === "checkbox" ? false : "") ??
          (field?.type === "array" ? [] : "");
        return acc;
      },
      {} as Record<string, any>,
    ),
  );
  const [fieldOptions, setFieldOptions] = useState<
    Record<string, { label: string; value: string }[]>
  >({});
  const [editIndex, setEditIndex] = useState<number>(-1);

  const handleChange = (key: string, value: any) => {
    if (onChange) {
      const out = transformFormData({ ...formData, [key]: value });
      onChange(out);
    }
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (onSubmit) {
      const out = transformFormData(formData);
      onSubmit(out);
    }
  };

  const shouldDisplayField = (field: FormField): boolean => {
    if (!field.dependsOn || field.showIf === undefined) return true;
    if (field.showIf === '*' && formData[field.dependsOn] !== undefined) return true;
    return field.showIf
      .split(",")
      .map((a) => a.trim())
      .includes(formData[field.dependsOn]);
  };

  const isNestedFormValid = (field: FormField) =>
    field?.nestedFields?.every((nestedField) => {
      const nestedVal = (formData?.[field.key] ?? [{}])[
        (formData[field.key] ?? [{}]).length - 1
      ]?.[nestedField.key];

      if (nestedField.required) {
        return (
          nestedVal !== "" && nestedVal !== undefined && nestedVal !== null
        );
      } else {
        return true;
      }
    });

  const isFormValid = fields.every((field) => {
    if (!shouldDisplayField(field)) return true;
    if (field.type === "array" && !!field?.nestedFields?.length) {
      return isNestedFormValid(field);
    }
    if (!field.required) return true;

    const value = formData[field.key];

    return value !== "" && value !== undefined && value !== null;
  });

  useEffect(() => {
    const loadOptionsFields = fields.filter(
      (field) => !!field?.options,
    );
    for (const field of loadOptionsFields) {
      const rawOptions = field.options;

      if (typeof rawOptions === 'function') {
        setFieldOptions((prev) => ({
          ...prev,
          [field.key]: rawOptions(formData),
        }));
      } else if (typeof rawOptions === 'object') {
        setFieldOptions((prev) => ({
          ...prev,
          [field.key]: rawOptions,
        }));
      }
    }
  }, [fields]);

  useEffect(() => {
    const loadOptionsFields = fields.filter(
      (field) => !!field?.options && typeof field.options === 'function',
    );
    for (const field of loadOptionsFields) {
      const rawOptions = field.options;

      if (typeof rawOptions === 'function') {
        setFieldOptions((prev) => ({
          ...prev,
          [field.key]: rawOptions(formData),
        }));
      }
    }
  }, [formData]);

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {fields.map((field) => {
        if (!shouldDisplayField(field)) return null;

        const label = field.label;

        switch (field?.type) {
          case "text":
            return (
              <TextField
                key={field.key}
                label={label}
                required={field.required}
                value={formData[field.key]}
                disabled={!!field?.disabled || disabled}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
            );
          case "checkbox":
            return (
              <FormControlLabel
                key={field.key}
                control={
                  <Checkbox
                    disabled={!!field?.disabled || disabled}
                    checked={formData[field.key] || false}
                    onChange={(e) => handleChange(field.key, e.target.checked)}
                  />
                }
                label={label}
              />
            );
          case "radio":
            return (
              <FormControl key={field.key}>
                <Typography variant="body1">{label}</Typography>
                <RadioGroup
                  value={formData[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                >
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {fieldOptions[field.key]?.map((opt) => (
                      <FormControlLabel
                        key={opt.value}
                        value={opt.value}
                        control={
                          <Radio disabled={!!field?.disabled || disabled} />
                        }
                        label={opt.label}
                      />
                    ))}
                  </Box>
                </RadioGroup>
              </FormControl>
            );
          case "select":
            return (
              <FormControl key={field.key} fullWidth required={field.required}>
                <InputLabel>{label}</InputLabel>
                <Select
                  disabled={!!field?.disabled || disabled}
                  value={formData[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  label={field.label}
                >
                  {fieldOptions[field.key]?.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          case "date":
            return (
              <DatePickerComponent
                key={field.key}
                defaultValue={formData[field.key]}
                onChange={(date) => handleChange(field.key, date)}
                disabled={!!field?.disabled || disabled}
                required={!!field?.required}
                label={label}
              />
            );
          case "array":
            return (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="body1" color="textSecondary">
                    {label}:
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {(formData[field.key] || [{}]).map((nestedValue: Record<string, any>, index: number) => (
                    <Accordion
                      expanded={editIndex === index}
                      key={`${field.key}-${index}`}
                      id={`${field.key}-${index}`}
                      sx={{ m: "8px 40px" }}
                    >
                      <AccordionSummary
                        onClick={() =>
                          editIndex === index
                            ? setEditIndex(-1)
                            : setEditIndex(index)
                        }
                        expandIcon={<ExpandMore />}
                      >
                        <Typography
                          color="textSecondary"
                          variant="body2"
                          mb={1}
                        >
                          {field.label} item#{index + 1} -{" "}
                          {formData?.[field.key]?.[index]?.key ??
                            nestedValue?.value}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <DynamicForm
                          hideSubmit={true}
                          disabled={editIndex !== index}
                          selectedValues={nestedValue}
                          fields={field?.nestedFields || []}
                          onChange={(data) => {
                            if (
                              formData[field.key] &&
                              formData[field.key]?.length
                            ) {
                              const updatedValue = [...formData[field.key]];
                              updatedValue[index] = data;
                              handleChange(field.key, []);
                              handleChange(field.key, updatedValue);
                            } else {
                              handleChange(field.key, [data]);
                            }
                          }}
                        />
                      </AccordionDetails>
                      <AccordionActions>
                        <Button
                          onClick={() => {
                            if (
                              formData[field.key] &&
                              formData[field.key].length
                            ) {
                              const updatedValues = formData[field.key].filter(
                                (_: any, idx: number) => idx !== index,
                              );
                              handleChange(field.key, []);
                              handleChange(field.key, updatedValues);
                              setEditIndex(-1);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </AccordionActions>
                    </Accordion>
                  ))}
                </AccordionDetails>
                <AccordionActions>
                  <Button
                    disabled={!isNestedFormValid(field)}
                    onClick={() => {
                      handleChange(field.key, [
                        ...(formData[field.key] ?? [{}]),
                        {},
                      ]);
                    }}
                  >
                    Add
                  </Button>
                </AccordionActions>
              </Accordion>
            );
          case "hidden":
            return null;
          default:
            return (
              <TextField
                key={field.key}
                label={label}
                required={field.required}
                value={formData[field.key]}
                disabled={!!field?.disabled || disabled}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
            );
        }
      })}
      <Box display="flex" justifyContent="space-between">
        {!hideSubmit && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isFormValid || disabled}
          >
            {submitButtonLabel}
          </Button>
        )}
        {!!onRemove && (
          <Button
            variant="contained"
            color="error"
            onClick={() => onRemove(formData)}
          >
            Remove
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default DynamicForm;
