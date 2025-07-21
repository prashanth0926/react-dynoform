import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  Button,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

export interface FormField {
  key: string;
  label: string;
  type?: 'text' | 'checkbox' | 'radio' | 'select' | 'array' | 'group';
  options?: { label: string; value: any }[];
  defaultValue?: any;
  disabled?: boolean;
  required?: boolean;
  nestedFields?: FormField[];
}

interface DynamicFormProps {
  fields: FormField[];
  selectedValues?: Record<string, any>;
  onChange?: (values: Record<string, any>) => void;
  onSubmit?: (values: Record<string, any>) => void;
  submitButtonLabel?: string;
  hideSubmit?: boolean;
  disabled?: boolean;
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  label: { marginBottom: 4, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRb: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#000',
  },
  radioLabel: { marginLeft: 8 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
});

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  selectedValues = {},
  onChange,
  onSubmit,
  submitButtonLabel = 'Submit',
  hideSubmit,
  disabled,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    const initial = fields.reduce(
      (acc, f) => {
        acc[f.key] =
          selectedValues[f.key] ?? f.defaultValue ?? (f.type === 'checkbox' ? false : '');
        return acc;
      },
      {} as Record<string, any>
    );
    setFormData(initial);
  }, [fields, selectedValues]);

  const handleChange = (key: string, value: any) => {
    const newData = { ...formData, [key]: value };
    setFormData(newData);
    onChange?.(newData);
  };

  const renderField = (field: FormField) => {
    const options = field.options ?? [];

    switch (field.type) {
      case 'text':
        return (
          <View key={field.key}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={styles.input}
              value={formData[field.key]}
              editable={!disabled && !field.disabled}
              onChangeText={(text: string) => handleChange(field.key, text)}
            />
          </View>
        );
      case 'checkbox':
        return (
          <View key={field.key} style={styles.checkboxContainer}>
            <Switch
              value={!!formData[field.key]}
              disabled={disabled || field.disabled}
              onValueChange={(val: boolean) => handleChange(field.key, val)}
            />
            <Text style={{ marginLeft: 8 }}>{field.label}</Text>
          </View>
        );
      case 'select':
        return (
          <View key={field.key}>
            <Text style={styles.label}>{field.label}</Text>
            <Picker
              selectedValue={formData[field.key]}
              enabled={!disabled && !field.disabled}
              onValueChange={(val: string | number) => handleChange(field.key, val)}
            >
              {options.map((opt) => (
                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
              ))}
            </Picker>
          </View>
        );
      case 'radio':
        return (
          <View key={field.key}>
            <Text style={styles.label}>{field.label}</Text>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.radioOption}
                onPress={() => handleChange(field.key, opt.value)}
                disabled={disabled || field.disabled}
              >
                <View style={styles.radioCircle}>
                  {formData[field.key] === opt.value && <View style={styles.selectedRb} />}
                </View>
                <Text style={styles.radioLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {fields.map(renderField)}
      {!hideSubmit && (
        <Button
          title={submitButtonLabel}
          onPress={() => onSubmit?.(formData)}
          disabled={disabled}
        />
      )}
    </ScrollView>
  );
};

export default DynamicForm;
