import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useSettings } from '../../context/SettingsContext';

export default function SettingsScreen() {
  const { temperatureUnit, elevationUnit, elevation, updateSettings } = useSettings();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [localElevation, setLocalElevation] = useState(elevation);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setErrorMsg('Elevation detection is not available on web.');
      return;
    }

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        if (location.coords.altitude) {
          const altitudeInMeters = location.coords.altitude;
          const value = elevationUnit === 'ft' 
            ? Math.round(altitudeInMeters * 3.28084)
            : Math.round(altitudeInMeters);
          setLocalElevation(value.toString());
          updateSettings({ elevation: value.toString() });
        }
      } catch (error) {
        setErrorMsg('Could not detect elevation');
      }
    })();
  }, [elevationUnit]);

  const toggleTemperatureUnit = () => {
    updateSettings({ 
      temperatureUnit: temperatureUnit === 'imperial' ? 'metric' : 'imperial' 
    });
  };

  const toggleElevationUnit = () => {
    const newUnit = elevationUnit === 'ft' ? 'm' : 'ft';
    const value = Number(localElevation);
    const converted = newUnit === 'ft' 
      ? Math.round(value * 3.28084)
      : Math.round(value / 3.28084);
    
    setLocalElevation(converted.toString());
    updateSettings({ 
      elevationUnit: newUnit,
      elevation: converted.toString()
    });
  };

  const handleElevationChange = (value: string) => {
    setLocalElevation(value);
    updateSettings({ elevation: value });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Temperature Unit</Text>
          <Pressable 
            style={styles.unitToggle} 
            onPress={toggleTemperatureUnit}
          >
            <Text style={styles.unitToggleText}>
              {temperatureUnit === 'imperial' ? '°F' : '°C'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Elevation</Text>
          <Text style={styles.sectionSubtitle}>
            Enter your elevation above sea level
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={localElevation}
              onChangeText={handleElevationChange}
              placeholder="Enter elevation"
              keyboardType="numeric"
            />
            <Pressable 
              style={styles.unitToggle}
              onPress={toggleElevationUnit}
            >
              <Text style={styles.unitToggleText}>{elevationUnit}</Text>
            </Pressable>
          </View>

          {errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : null}

          <Text style={styles.hint}>
            Tip: Cooking times and temperatures need to be adjusted at high elevations due to lower air pressure.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Elevation Adjustments</Text>
          <Text style={styles.infoText}>
            • Above {elevationUnit === 'ft' ? '3,000 ft' : '914 m'}: Increase time by 5-10%{'\n'}
            • Above {elevationUnit === 'ft' ? '5,000 ft' : '1,524 m'}: Increase time by 10-15%{'\n'}
            • Above {elevationUnit === 'ft' ? '7,000 ft' : '2,134 m'}: Increase time by 15-20%
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 20,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#111827',
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#ffffff',
  },
  unitToggle: {
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitToggleText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#ef4444',
    marginTop: 8,
  },
  hint: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
  },
  infoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
    marginBottom: 8,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
  },
});