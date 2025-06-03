# 🧩 DynamicForm – JSON-based Dynamic Form Builder for React

A flexible and extensible form-rendering React component powered by a JSON configuration. Built with TypeScript and Material UI, it supports nested fields, conditional rendering, and dynamic data loading.

> ⚙️ Built with React, TypeScript, and MUI (v5)  
> 📦 Ideal for internal tools, admin panels, and dashboards

---

## 📦 Installation

```bash
npm install react-dynoform
# or
yarn add react-dynoform
```

---

## 🚀 Usage

```tsx
import React from 'react';
import DynamicForm, { FormField } from 'react-dynoform';

const formFields: FormField[] = [
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    required: true,
  },
  {
    key: 'subscribe',
    label: 'Subscribe to newsletter',
    type: 'checkbox',
  },
  {
    key: 'dob',
    label: 'Date of Birth',
    type: 'date',
  },
  {
    key: 'gender',
    label: 'Gender',
    type: 'radio',
    options: [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
    ],
  },
];

export default function App() {
  return (
    <DynamicForm
      fields={formFields}
      onSubmit={(data) => console.log('Submitted:', data)}
    />
  );
}
```

---

## 🛠 Features

- ✅ Supports `text`, `select`, `checkbox`, `radio`, `date`, `array`, `hidden`
- 📚 Nested forms (`type: 'array'`) with collapsible sections
- ⚡ Dynamic `select` options from API (`loadOptionsApi`)
- 🎯 Conditional rendering via `dependsOn` and `showIf`
- 🔄 Bi-directional data mapping (`mapTo`, `mapFrom`, `doNotMap`)
- 🔐 Full support for validation and controlled components
- 🧪 Type-safe props with TypeScript

---

## 📘 FormField Schema

```ts
interface FormField {
  key: string;
  label: string;
  type?: "text" | "checkbox" | "radio" | "select" | "hidden" | "date" | "array";
  nestedFields?: FormField[];
  options?: { label: string; value: string }[] | ((formData: Record<string, any>) => { label: string; value: string }[]);
  defaultValue?: any;
  disabled?: boolean;
  required?: boolean;
  dependsOn?: string;
  showIf?: string; // "*" for any value, or comma-separated values
  mapTo?: string;
  doNotMap?: boolean;
  mapFrom?: string;
  valueType?: "string" | "number" | "boolean" | "date" | "json" | "jsonString" | "array";
}
```

---

## 📤 Props

| Prop                | Type                                       | Description                            |
|---------------------|--------------------------------------------|----------------------------------------|
| `fields`            | `FormField[]`                              | Configuration array                    |
| `disabled?`         | `boolean`                                  | Disables all inputs                    |
| `selectedValues?`   | `Record<string, any>`                      | Pre-filled values                      |
| `submitButtonLabel?`| `string`                                   | Custom submit label                    |
| `hideSubmit?`       | `boolean`                                  | Hide the submit button                 |
| `onChange?`         | `(data: Record<string, any>) => void`     | Called on any change                   |
| `onSubmit?`         | `(data: Record<string, any>) => void`     | Called on submit                       |
| `onRemove?`         | `(data: Record<string, any>) => void`     | Called when delete is clicked         |

---

## 🧩 Supported Field Types

- `text`: Single-line text input
- `checkbox`: Boolean checkbox
- `radio`: Select one from multiple options
- `select`: Dropdown with options or async API loading
- `date`: MUI-compatible date picker
- `hidden`: Hidden input for internal values
- `array`: Nested and repeatable field sets

---

## 🔁 Conditional Display Logic

You can make fields appear based on another field's value using:

- `dependsOn`: key of the controlling field
- `showIf`: comma-separated list of values to match (`*` = any value)

Example:

```ts
{
  key: "state",
  label: "State",
  type: "text",
  dependsOn: "country",
  showIf: "USA,Canada"
}
```

---

## 🧪 Development

Clone locally:

```bash
git clone https://github.com/your-org/dynafield.git
cd dynafield
npm install
```

Build for production:

```bash
npm run build
```

---

## 📜 License

MIT © 2025 Prashanth Molakala
