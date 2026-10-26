import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Sleepiness } from '../store/types';

const LEVELS: Sleepiness[] = [1, 2, 3, 4, 5];

type Props = {
  value: Sleepiness | undefined;
  onSelect: (value: Sleepiness) => void;
};

/** 眠気の自己評価(1: すっきり 〜 5: とても眠い)。選ばなくてもよい */
export function SleepinessPicker({ value, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {LEVELS.map((level) => {
          const selected = value === level;
          return (
            <Pressable
              key={level}
              onPress={() => onSelect(level)}
              style={[styles.button, selected && styles.selected]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`眠気 ${level}`}
            >
              {/* 色だけに頼らず、選んだものは太字・太枠にする */}
              <Text style={[styles.label, selected && styles.selectedLabel]}>{level}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.row}>
        <Text style={styles.hint}>1 すっきり</Text>
        <Text style={styles.hint}>5 とても眠い</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    borderWidth: 3,
    borderColor: '#2f6fd6',
    backgroundColor: '#e3edfc',
  },
  label: {
    fontSize: 20,
  },
  selectedLabel: {
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 14,
    color: '#555',
  },
});
