<template>
  <div class="letter-circle-container">
    <div class="letter-circle" ref="circleRef">
      <svg class="connection-lines" :width="circleSize" :height="circleSize" viewBox="0 0 200 200">
        <path
          v-if="connectionPath"
          :d="connectionPath"
          stroke="#42a5f5"
          stroke-width="4"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="connection-path"
        />
      </svg>

      <div
        v-for="(letter, index) in letters"
        :key="`${letter}-${index}`"
        class="letter-item"
        :class="{
          'letter-selected': selectedIndices.includes(index),
          'letter-connecting': isConnecting && hoveredIndex === index,
          'letter-animated': animatedIndices.includes(index),
        }"
        :style="getLetterPosition(index)"
        @mousedown="startConnection(index)"
        @mouseenter="handleMouseEnter(index)"
        @mouseover="handleMouseEnter(index)"
        @touchstart.prevent="startConnection(index)"
        @touchmove.prevent="handleTouchMove"
        @touchend.prevent="handleTouchEnd"
      >
        <div class="letter-content">
          {{ letter }}
        </div>
        <div class="letter-glow" v-if="selectedIndices.includes(index)"></div>
      </div>
    </div>

    <div class="center-circle" v-if="selectedIndices.length > 0">
      <div class="center-word">{{ currentWord }}</div>
      <q-btn
        round
        color="green"
        icon="check"
        size="sm"
        @click="submitWord"
        :disable="currentWord.length < 3"
        class="submit-button"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { validateConnectedWord, canConnectLetters } from '../utils/word-validator';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface Props {
  letters: string[];
  selectedIndices: number[];
}

interface Emits {
  (e: 'letter-selected', indices: number[], word: string): void;
  (e: 'word-submitted', word: string): void;
  (e: 'letters-cleared'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const circleRef = ref<HTMLElement>();
const circleSize = 200;
const radius = 80;
const isConnecting = ref(false);
const hoveredIndex = ref(-1);
const animatedIndices = ref<number[]>([]);
const currentSelectedIndices = ref<number[]>([]);

const currentWord = computed(() => {
  return currentSelectedIndices.value.map((index) => props.letters[index]).join('');
});

const connectionPath = computed(() => {
  if (currentSelectedIndices.value.length < 2) return '';

  const points = currentSelectedIndices.value.map((index) => {
    const angle = (index * 2 * Math.PI) / props.letters.length - Math.PI / 2;
    const x = 100 + radius * Math.cos(angle);
    const y = 100 + radius * Math.sin(angle);
    return { x, y };
  });

  if (points.length === 0) return '';

  const firstPoint = points[0];
  if (!firstPoint) return '';

  let path = `M ${firstPoint.x} ${firstPoint.y}`;
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    if (point) {
      path += ` L ${point.x} ${point.y}`;
    }
  }

  return path;
});

const getLetterPosition = (index: number) => {
  const angle = (index * 2 * Math.PI) / props.letters.length - Math.PI / 2;
  const x = 50 + (radius / circleSize) * 100 * Math.cos(angle);
  const y = 50 + (radius / circleSize) * 100 * Math.sin(angle);

  return {
    position: 'absolute' as const,
    left: `${x}%`,
    top: `${y}%`,
    transform: 'translate(-50%, -50%)',
  };
};

const startConnection = (index: number) => {
  if (currentSelectedIndices.value.includes(index)) {
    // If clicking on an already selected letter, clear from that point
    const clickedIndex = currentSelectedIndices.value.indexOf(index);
    currentSelectedIndices.value = currentSelectedIndices.value.slice(0, clickedIndex + 1);
  } else if (canConnectLetters(currentSelectedIndices.value, index, props.letters.length)) {
    currentSelectedIndices.value.push(index);
    void animateLetterSelection(index);
  } else if (currentSelectedIndices.value.length === 0) {
    currentSelectedIndices.value = [index];
    void animateLetterSelection(index);
  }

  isConnecting.value = true;
  updateSelection();
};

const handleMouseEnter = (index: number) => {
  if (isConnecting.value) {
    hoveredIndex.value = index;

    if (currentSelectedIndices.value.includes(index)) {
      // Allow backtracking to previously selected letters
      const indexInSelection = currentSelectedIndices.value.indexOf(index);
      currentSelectedIndices.value = currentSelectedIndices.value.slice(0, indexInSelection + 1);
      updateSelection();
    } else if (canConnectLetters(currentSelectedIndices.value, index, props.letters.length)) {
      currentSelectedIndices.value.push(index);
      void animateLetterSelection(index);
      updateSelection();
    }
  }
};

const handleTouchMove = (event: TouchEvent) => {
  if (!isConnecting.value) return;

  const touch = event.touches[0];
  if (!touch) return;

  // Get all letter elements
  const letterElements = document.querySelectorAll('.letter-item');

  // Find which letter is under the touch point with increased tolerance
  let targetIndex = -1;
  let minDistance = Infinity;

  letterElements.forEach((element, index) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.sqrt(
      Math.pow(touch.clientX - centerX, 2) + Math.pow(touch.clientY - centerY, 2),
    );

    // Increased tolerance and find closest letter for smoother interaction
    const tolerance = rect.width / 2 + 30; // Increased from 10 to 30
    if (distance <= tolerance && distance < minDistance) {
      targetIndex = index;
      minDistance = distance;
    }
  });

  if (targetIndex !== -1 && targetIndex !== hoveredIndex.value) {
    handleMouseEnter(targetIndex);
  }
};

const handleTouchEnd = () => {
  if (isConnecting.value) {
    isConnecting.value = false;
    if (currentSelectedIndices.value.length >= 3) {
      void submitWord();
    }
  }
};

const triggerHapticFeedback = async (style: ImpactStyle = ImpactStyle.Light) => {
  try {
    await Haptics.impact({ style });
  } catch {
    // Haptics not available (web/desktop)
    console.log('Haptics not available');
  }
};

const animateLetterSelection = async (index: number) => {
  animatedIndices.value.push(index);
  await triggerHapticFeedback(ImpactStyle.Light);
  setTimeout(() => {
    animatedIndices.value = animatedIndices.value.filter((i) => i !== index);
  }, 300);
};

const updateSelection = () => {
  emit('letter-selected', currentSelectedIndices.value, currentWord.value);
};

const submitWord = async () => {
  if (currentWord.value.length >= 3) {
    const validWord = validateConnectedWord(
      currentSelectedIndices.value
        .map((i) => props.letters[i])
        .filter((letter): letter is string => letter !== undefined),
    );

    if (validWord) {
      await triggerHapticFeedback(ImpactStyle.Medium);
      emit('word-submitted', validWord);
    } else {
      await triggerHapticFeedback(ImpactStyle.Heavy);
    }
  }

  clearSelection();
};

const clearSelection = () => {
  currentSelectedIndices.value = [];
  isConnecting.value = false;
  hoveredIndex.value = -1;
  emit('letters-cleared');
};

const handleClickOutside = (event: MouseEvent) => {
  if (circleRef.value && !circleRef.value.contains(event.target as Node)) {
    clearSelection();
  }
};

onMounted(() => {
  document.addEventListener('mouseup', () => {
    if (isConnecting.value) {
      isConnecting.value = false;
      if (currentSelectedIndices.value.length >= 3) {
        void submitWord();
      }
    }
  });

  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.letter-circle-container {
  position: relative;
  width: min(85vw, 350px);
  height: min(85vw, 350px);
  margin: 0 auto;
  touch-action: none;
  user-select: none;
}

.letter-circle {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.connection-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.connection-path {
  animation: drawPath 0.3s ease-out;
  filter: drop-shadow(0 0 8px rgba(66, 165, 245, 0.6));
}

.letter-item {
  position: absolute;
  width: min(14vw, 70px);
  height: min(14vw, 70px);
  cursor: pointer;
  z-index: 2;
  transition: all 0.2s ease;
  user-select: none;
  touch-action: none;
  /* Add padding for larger touch target */
  padding: 8px;
  margin: -8px;
}

.letter-content {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(45deg, #42a5f5, #478ed1);
  color: white;
  font-size: 1.6rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.letter-selected .letter-content {
  background: linear-gradient(45deg, #4caf50, #45a049);
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.letter-connecting .letter-content {
  background: linear-gradient(45deg, #ff9800, #f57c00);
  transform: scale(1.05);
}

.letter-item:hover .letter-content {
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(66, 165, 245, 0.3);
}

.letter-animated .letter-content {
  animation: letterPulse 0.3s ease-out;
}

.letter-glow {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.3), transparent);
  animation: pulse 1s infinite;
}

.center-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 100px;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 3;
}

.center-word {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  text-align: center;
  line-height: 1;
}

.submit-button {
  width: 35px;
  height: 35px;
  min-height: 35px;
}

@keyframes drawPath {
  from {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
  }
  to {
    stroke-dasharray: 1000;
    stroke-dashoffset: 0;
  }
}

@keyframes letterPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1.1);
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 480px) {
  .letter-circle-container {
    width: min(80vw, 300px);
    height: min(80vw, 300px);
  }

  .letter-item {
    width: min(13vw, 60px);
    height: min(13vw, 60px);
    /* Larger touch targets on mobile */
    padding: 10px;
    margin: -10px;
  }

  .letter-content {
    font-size: min(4.5vw, 1.4rem);
  }

  .center-circle {
    width: min(20vw, 85px);
    height: min(20vw, 85px);
  }

  .center-word {
    font-size: min(3.5vw, 1rem);
  }
}
</style>
