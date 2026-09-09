import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/constants/use-theme';

import type { GroceryItem } from '../types';
import { ROW_HEIGHT } from './constants';
import { Checkbox } from './checkbox';

type Props = {
  items: GroceryItem[];
  onToggle: (id: string) => void;
  onRename: (id: string, text: string) => void;
  onReorder: (orderedIds: string[]) => void;
};

/** Keeps a value inside a range. Runs on the UI thread during a drag. */
function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

/**
 * The unchecked half of the grocery list, reorderable by dragging the grip
 * handle on the left of each row.
 *
 * How the drag works: every row is exactly ROW_HEIGHT tall, so while a finger
 * is down we can turn the vertical distance travelled into a number of slots
 * moved (`distance / ROW_HEIGHT`, rounded). The dragged row follows the
 * finger; the rows it has passed slide one slot out of its way. Nothing is
 * written to the database until the finger lifts.
 */
export function UncheckedList({ items, onToggle, onRename, onReorder }: Props) {
  // Which row is being dragged, as an index. -1 means "no drag in progress".
  // This lives in a shared value because the UI thread reads it every frame.
  const dragIndex = useSharedValue(-1);
  const dragY = useSharedValue(0);
  // A React copy of the same thing, purely so the row can change colour.
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const commit = useCallback(
    (from: number, to: number) => {
      if (from === to) return;
      const next = items.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onReorder(next.map((i) => i.id));
    },
    [items, onReorder],
  );

  return (
    <View>
      {items.map((item, index) => (
        <Row
          key={item.id}
          item={item}
          index={index}
          count={items.length}
          dragIndex={dragIndex}
          dragY={dragY}
          isDragging={draggingId === item.id}
          setDraggingId={setDraggingId}
          onToggle={onToggle}
          onRename={onRename}
          commit={commit}
        />
      ))}
    </View>
  );
}

type RowProps = {
  item: GroceryItem;
  index: number;
  count: number;
  dragIndex: ReturnType<typeof useSharedValue<number>>;
  dragY: ReturnType<typeof useSharedValue<number>>;
  isDragging: boolean;
  setDraggingId: (id: string | null) => void;
  onToggle: (id: string) => void;
  onRename: (id: string, text: string) => void;
  commit: (from: number, to: number) => void;
};

function Row({
  item,
  index,
  count,
  dragIndex,
  dragY,
  isDragging,
  setDraggingId,
  onToggle,
  onRename,
  commit,
}: RowProps) {
  const { colors } = useTheme();
  const [text, setText] = useState(item.text);

  const pan = Gesture.Pan()
    .activateAfterLongPress(120)
    .onStart(() => {
      dragIndex.value = index;
      dragY.value = 0;
      runOnJS(setDraggingId)(item.id);
    })
    .onUpdate((event) => {
      dragY.value = event.translationY;
    })
    .onEnd(() => {
      const slots = Math.round(dragY.value / ROW_HEIGHT);
      const target = clamp(index + slots, 0, count - 1);
      runOnJS(commit)(index, target);
    })
    .onFinalize(() => {
      dragIndex.value = -1;
      dragY.value = 0;
      runOnJS(setDraggingId)(null);
    });

  const animatedStyle = useAnimatedStyle(() => {
    const active = dragIndex.value;
    if (active === -1) return { transform: [{ translateY: 0 }], zIndex: 0 };

    // The row under the finger simply follows it.
    if (active === index) {
      return { transform: [{ translateY: dragY.value }], zIndex: 10 };
    }

    // Everything else steps aside if the dragged row has passed over it.
    const target = clamp(active + Math.round(dragY.value / ROW_HEIGHT), 0, count - 1);
    let shift = 0;
    if (active < index && index <= target) shift = -ROW_HEIGHT;
    else if (active > index && index >= target) shift = ROW_HEIGHT;

    return {
      transform: [{ translateY: withTiming(shift, { duration: 140 }) }],
      zIndex: 0,
    };
  });

  return (
    <Animated.View
      style={[
        styles.row,
        animatedStyle,
        { backgroundColor: isDragging ? colors.sand : 'transparent' },
      ]}>
      <GestureDetector gesture={pan}>
        <View style={styles.grip} accessibilityLabel={`Reorder ${item.text}`}>
          <MaterialCommunityIcons
            name="drag-vertical"
            size={18}
            color={colors.muted}
            style={styles.gripIcon}
          />
        </View>
      </GestureDetector>

      <Pressable
        onPress={() => onToggle(item.id)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: false }}
        accessibilityLabel={item.text}
        style={styles.checkboxHit}>
        <Checkbox checked={false} />
      </Pressable>

      <TextInput
        value={text}
        onChangeText={setText}
        // Save on blur rather than on every keystroke: one database write per
        // edit instead of one per letter.
        onEndEditing={() => {
          if (text.trim() && text !== item.text) onRename(item.id, text);
          else if (!text.trim()) setText(item.text);
        }}
        style={[styles.input, { color: colors.ink }]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
    borderRadius: 16,
  },
  grip: { width: 34, height: 40, alignItems: 'center', justifyContent: 'center' },
  gripIcon: { opacity: 0.45 },
  checkboxHit: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1,
    minWidth: 0,
    fontFamily: Fonts.body,
    fontSize: 16,
    paddingVertical: 10,
    paddingRight: 8,
  },
});
