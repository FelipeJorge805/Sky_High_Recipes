import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../../context/SettingsContext';

const recipes = [
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

export default function RecipeScreen() {
  const { id } = useLocalSearchParams();
  const recipe = recipes.find(r => r.id === id);
  const { temperatureUnit, elevation, elevationUnit } = useSettings();
  
  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Recipe not found</Text>
      </SafeAreaView>
    );
  }

  const elevationValue = Number(elevation);
  const elevationInFeet = elevationUnit === 'm' ? elevationValue * 3.28084 : elevationValue;
  const adjustedTime = calculateAdjustedTime(recipe.base_time, elevationInFeet);
  const adjustedTemp = calculateAdjustedTemp(recipe.base_temp, elevationInFeet);
  const displayTemp = convertTemperature(adjustedTemp, temperatureUnit);

  const formatTemperature = (temp: number | null) => {
    if (temp === null) return 'N/A';
    return `${temp}°${temperatureUnit === 'imperial' ? 'F' : 'C'}`;
  };

  const updatedInstructions = recipe.instructions.map(instruction => {
    if (recipe.base_temp && instruction.includes('°F')) {
      const temp = convertTemperature(adjustedTemp, temperatureUnit);
      return instruction.replace(/\d+°F/, `${temp}°${temperatureUnit === 'imperial' ? 'F' : 'C'}`);
    }
    return instruction;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Image
          source={{ uri: `${recipe.image_url}?w=800&q=80` }}
          style={styles.recipeImage}
        />
        
        <View style={styles.content}>
          <Text style={styles.title}>{recipe.name}</Text>
          
          <View style={styles.timingCard}>
            <View style={styles.timingRow}>
              <Text style={styles.timingLabel}>Base Time:</Text>
              <Text style={styles.timingValue}>{recipe.base_time} minutes</Text>
            </View>
            <View style={styles.timingRow}>
              <Text style={styles.timingLabel}>Adjusted Time:</Text>
              <Text style={styles.timingValue}>{Math.round(adjustedTime)} minutes</Text>
            </View>
            {recipe.base_temp && (
              <>
                <View style={styles.timingRow}>
                  <Text style={styles.timingLabel}>Base Temperature:</Text>
                  <Text style={styles.timingValue}>
                    {formatTemperature(convertTemperature(recipe.base_temp, temperatureUnit))}
                  </Text>
                </View>
                <View style={styles.timingRow}>
                  <Text style={styles.timingLabel}>Adjusted Temperature:</Text>
                  <Text style={styles.timingValue}>{formatTemperature(displayTemp)}</Text>
                </View>
              </>
            )}
          </View>

          <Text style={styles.sectionTitle}>Instructions</Text>
          {updatedInstructions.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>{index + 1}</Text>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollView: {
    flex: 1,
  },
  recipeImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#111827',
    marginBottom: 20,
  },
  timingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timingLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6b7280',
  },
  timingValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#111827',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  instructionText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 20,
  },
});