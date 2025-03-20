import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSettings } from '../../context/SettingsContext';
import { Plus, Search, Trash2, CreditCard as Edit2 } from 'lucide-react-native';

interface Recipe {
  id: string;
  name: string;
  image_url: string;
  base_time: number;
  base_temp: number | null;
  instructions: string[];
}

const defaultRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Classic Chocolate Chip Cookies',
    image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e',
    base_time: 12,
    base_temp: 350,
    instructions: [
      'Preheat oven to 350°F',
      'Cream butter and sugars',
      'Add eggs and vanilla',
      'Mix in dry ingredients',
      'Form cookies and place on baking sheet',
      'Bake for 12 minutes or until edges are lightly browned'
    ]
  },
  {
    id: '2',
    name: 'Artisan Sourdough Bread',
    image_url: 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb',
    base_time: 45,
    base_temp: 450,
    instructions: [
      'Preheat oven to 450°F',
      'Score the bread',
      'Place in preheated Dutch oven',
      'Bake covered for 30 minutes',
      'Remove lid and bake for additional 15 minutes'
    ]
  }
];

function calculateAdjustedTime(baseTime: number, elevation: number): number {
  if (elevation < 3000) return baseTime;
  if (elevation < 5000) return baseTime * 1.1;
  if (elevation < 7000) return baseTime * 1.15;
  return baseTime * 1.2;
}

function calculateAdjustedTemp(baseTemp: number | null, elevation: number): number | null {
  if (!baseTemp) return null;
  const reduction = Math.floor(elevation / 1000) * 2;
  return baseTemp - reduction;
}

function convertTemperature(temp: number | null, unit: 'imperial' | 'metric'): number | null {
  if (temp === null) return null;
  return unit === 'metric' ? Math.round((temp - 32) * 5/9) : temp;
}

export default function RecipesScreen() {
  const router = useRouter();
  const { temperatureUnit, elevation, elevationUnit } = useSettings();
  const [recipes] = useState<Recipe[]>(defaultRecipes);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTemperature = (temp: number | null) => {
    if (temp === null) return '';
    return ` at ${temp}°${temperatureUnit === 'imperial' ? 'F' : 'C'}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Altitude-Adjusted Recipes</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search recipes..."
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredRecipes.length === 0 ? (
          <Text style={styles.message}>No recipes found</Text>
        ) : (
          filteredRecipes.map((recipe) => {
            const elevationValue = Number(elevation);
            const elevationInFeet = elevationUnit === 'm' ? elevationValue * 3.28084 : elevationValue;
            const adjustedTime = Math.round(calculateAdjustedTime(recipe.base_time, elevationInFeet));
            const adjustedTemp = calculateAdjustedTemp(recipe.base_temp, elevationInFeet);
            const displayTemp = convertTemperature(adjustedTemp, temperatureUnit);

            return (
              <Pressable
                key={recipe.id}
                style={styles.recipeCard}
                onPress={() => router.push(`/recipe/${recipe.id}`)}
              >
                <Image
                  source={{ uri: `${recipe.image_url}?w=800&q=80` }}
                  style={styles.recipeImage}
                />
                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeName}>{recipe.name}</Text>
                  <Text style={styles.recipeTime}>
                    {adjustedTime} minutes
                    {formatTemperature(displayTemp)}
                  </Text>
                  {recipe.base_temp && (
                    <Text style={styles.adjustedNote}>
                      Adjusted for {elevationUnit === 'ft' ? 
                        `${elevationValue.toLocaleString()} ft` : 
                        `${elevationValue.toLocaleString()} m`}
                    </Text>
                  )}
                </View>
                <View style={styles.actions}>
                  <Pressable
                    style={styles.actionButton}
                  >
                    <Edit2 size={20} color="#4f46e5" />
                  </Pressable>
                  <Pressable
                    style={styles.actionButton}
                  >
                    <Trash2 size={20} color="#ef4444" />
                  </Pressable>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      <Pressable
        style={styles.fab}
      >
        <Plus size={24} color="#ffffff" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#111827',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  recipeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recipeImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  recipeInfo: {
    padding: 16,
    paddingRight: 60,
  },
  recipeName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 4,
  },
  recipeTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4f46e5',
    marginBottom: 4,
  },
  adjustedNote: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  actions: {
    position: 'absolute',
    right: 16,
    top: 16,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 4,
  },
  actionButton: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  message: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 20,
  },
  error: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#ef4444',
    padding: 20,
    paddingTop: 0,
  },
});