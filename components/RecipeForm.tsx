import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { X, Plus, Save } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';

interface RecipeFormProps {
  initialData?: {
    id: string;
    name: string;
    image_url: string;
    base_time: number;
    base_temp: number | null;
    instructions: string[];
  };
  onClose: () => void;
}

export function RecipeForm({ initialData, onClose }: RecipeFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [imageUrl, setImageUrl] = useState(initialData?.image_url ?? '');
  const [baseTime, setBaseTime] = useState(initialData?.base_time?.toString() ?? '');
  const [baseTemp, setBaseTemp] = useState(initialData?.base_temp?.toString() ?? '');
  const [instructions, setInstructions] = useState<string[]>(initialData?.instructions ?? ['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (!name.trim()) return 'Recipe name is required';
    if (!imageUrl.trim()) return 'Image URL is required';
    if (!baseTime.trim() || isNaN(parseInt(baseTime))) return 'Valid cooking time is required';
    if (baseTemp.trim() && isNaN(parseInt(baseTemp))) return 'Temperature must be a valid number';
    if (!instructions.some(i => i.trim())) return 'At least one instruction is required';
    return null;
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleSubmit = async () => {
    try {
      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }

      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Please sign in to continue');

      const recipeData = {
        name: name.trim(),
        image_url: imageUrl.trim(),
        base_time: parseInt(baseTime),
        base_temp: baseTemp.trim() ? parseInt(baseTemp) : null,
        instructions: instructions.filter(i => i.trim()),
        user_id: user.id
      };

      if (initialData?.id) {
        const { error: updateError } = await supabase
          .from('recipes')
          .update(recipeData)
          .eq('id', initialData.id)
          .eq('user_id', user.id); // Ensure user owns the recipe

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('recipes')
          .insert([recipeData]);

        if (insertError) throw insertError;
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {initialData ? 'Edit Recipe' : 'New Recipe'}
        </Text>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <X size={24} color="#6b7280" />
        </Pressable>
      </View>

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Recipe Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter recipe name"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Image URL</Text>
          <TextInput
            style={styles.input}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="Enter Unsplash image URL"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Cooking Time (minutes)</Text>
            <TextInput
              style={styles.input}
              value={baseTime}
              onChangeText={setBaseTime}
              placeholder="Enter time"
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.field, { flex: 1, marginLeft: 12 }]}>
            <Text style={styles.label}>Temperature (°F)</Text>
            <TextInput
              style={styles.input}
              value={baseTemp}
              onChangeText={setBaseTemp}
              placeholder="Enter temp (optional)"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Instructions</Text>
          {instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionRow}>
              <TextInput
                style={[styles.input, styles.instructionInput]}
                value={instruction}
                onChangeText={(value) => updateInstruction(index, value)}
                placeholder={`Step ${index + 1}`}
                multiline
              />
              <Pressable
                style={styles.removeButton}
                onPress={() => removeInstruction(index)}
              >
                <X size={20} color="#ef4444" />
              </Pressable>
            </View>
          ))}
          <Pressable style={styles.addButton} onPress={addInstruction}>
            <Plus size={20} color="#4f46e5" />
            <Text style={styles.addButtonText}>Add Step</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Save size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>
                {initialData ? 'Update Recipe' : 'Create Recipe'}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  form: {
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionInput: {
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  addButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#4f46e5',
    marginLeft: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  submitButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 8,
  },
  error: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#ef4444',
    padding: 20,
    paddingTop: 0,
  },
});