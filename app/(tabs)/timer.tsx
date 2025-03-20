import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Pause, RotateCcw } from 'lucide-react-native';
import Animated, { 
  withSpring, 
  useAnimatedStyle, 
  withSequence, 
  withTiming,
  useSharedValue,
  withRepeat
} from 'react-native-reanimated';

export default function TimerScreen() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [inputMinutes, setInputMinutes] = useState('');
  const [inputSeconds, setInputSeconds] = useState('');
  const pulseAnim = useSharedValue(1);
  const totalTimeRef = useRef(0);

  useEffect(() => {
    if (isRunning) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      pulseAnim.value = withTiming(1);
    }
  }, [isRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsRunning(false);
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const startTimer = useCallback(() => {
    const minutes = parseInt(inputMinutes || '0', 10);
    const seconds = parseInt(inputSeconds || '0', 10);
    const totalSeconds = (minutes * 60) + seconds;
    
    if (totalSeconds > 0) {
      totalTimeRef.current = totalSeconds;
      setTimeLeft(totalSeconds);
      setIsRunning(true);
      setInputMinutes('');
      setInputSeconds('');
    }
  }, [inputMinutes, inputSeconds]);

  const toggleTimer = () => {
    if (!isRunning && timeLeft === 0) {
      startTimer();
    } else {
      setIsRunning(!isRunning);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
    totalTimeRef.current = 0;
    setInputMinutes('');
    setInputSeconds('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressStyle = useAnimatedStyle(() => {
    const progress = totalTimeRef.current > 0 ? timeLeft / totalTimeRef.current : 0;
    return {
      width: withSpring(`${progress * 100}%`, { damping: 20, stiffness: 90 }),
    };
  });

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {timeLeft === 0 ? (
          <View style={styles.inputContainer}>
            <View style={styles.timeInput}>
              <TextInput
                style={styles.input}
                value={inputMinutes}
                onChangeText={setInputMinutes}
                placeholder="00"
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={styles.inputLabel}>min</Text>
            </View>
            <Text style={styles.separator}>:</Text>
            <View style={styles.timeInput}>
              <TextInput
                style={styles.input}
                value={inputSeconds}
                onChangeText={setInputSeconds}
                placeholder="00"
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={styles.inputLabel}>sec</Text>
            </View>
          </View>
        ) : (
          <Animated.Text style={[styles.timerText, pulseStyle]}>
            {formatTime(timeLeft)}
          </Animated.Text>
        )}
        
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressBar, progressStyle]} />
        </View>

        <View style={styles.controls}>
          <Pressable
            style={styles.controlButton}
            onPress={toggleTimer}
          >
            <Animated.View>
              {isRunning ? (
                <Pause size={32} color="#ffffff" />
              ) : (
                <Play size={32} color="#ffffff" />
              )}
            </Animated.View>
          </Pressable>

          <Pressable
            style={[styles.controlButton, styles.resetButton]}
            onPress={resetTimer}
          >
            <Animated.View>
              <RotateCcw size={32} color="#4f46e5" />
            </Animated.View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  timeInput: {
    alignItems: 'center',
  },
  input: {
    fontFamily: 'Inter-Bold',
    fontSize: 72,
    color: '#111827',
    width: 120,
    textAlign: 'center',
  },
  inputLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  separator: {
    fontFamily: 'Inter-Bold',
    fontSize: 72,
    color: '#111827',
    marginHorizontal: 8,
  },
  timerText: {
    fontFamily: 'Inter-Bold',
    fontSize: 72,
    color: '#111827',
    marginBottom: 40,
  },
  progressContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 40,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4f46e5',
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resetButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#4f46e5',
  },
});