import React, { useState, useEffect } from "react";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";

export interface DatePickerComponentProps {
  fieldKey?: string; // renamed from `key` to avoid conflict with React's reserved `key`
  label?: string;
  defaultValue?: string | Date | Dayjs;
  onChange: (date: string | null) => void;
  disabled?: boolean;
  required?: boolean;
}

const DatePickerComponent: React.FC<DatePickerComponentProps> = ({
  fieldKey,
  label,
  defaultValue,
  onChange,
  disabled = false,
  required = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(
    defaultValue ? dayjs(defaultValue) : null
  );

  useEffect(() => {
    if (defaultValue) {
      setSelectedDate(dayjs(defaultValue));
    }
  }, [defaultValue]);

  const handleDateChange = (newDate: Dayjs | null) => {
    setSelectedDate(newDate);
    onChange(newDate?.toISOString() ?? null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        key={fieldKey}
        label={label}
        value={selectedDate}
        onChange={handleDateChange}
        disabled={disabled}
        slotProps={{
          textField: {
            required: required,
            InputLabelProps: { shrink: true },
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default DatePickerComponent;
