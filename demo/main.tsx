import React from 'react';
import { createRoot } from 'react-dom/client';
import DynamicForm, { FormField } from '../src/DynamicForm';

const App = () => {
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
      valueType: 'isoDateString',
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
    {
      key: 'favFood',
      label: 'Favorite Food',
      type: 'select',
      dependsOn: 'gender',
      showIf: '*',
      options: ({ gender }) =>
        gender === 'male'
          ? [
              { label: 'Chicken Wings', value: 'chicken wings' },
              { label: 'Burger', value: 'burger' },
            ]
          : [
              { label: 'Ice Cream', value: 'ice cream' },
              { label: 'French Fries', value: 'french fries' },
            ],
    },
  ];

  const handleSubmit = (data: any) => {
    console.log('Submitted:', data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>DynamicForm Demo</h2>
      <DynamicForm fields={formFields} onSubmit={handleSubmit} />
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
