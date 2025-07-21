import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import DynamicForm, { FormField } from 'react-dynoform';

export default function App() {
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
      key: 'gender',
      label: 'Gender',
      type: 'radio',
      options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
      ],
    }
  ];

  const handleSubmit = (data: any) => {
    console.log('Form Data:', data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Dynoform Mobile</Text>
        <DynamicForm fields={formFields} onSubmit={handleSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    fontWeight: 'bold',
  },
});
