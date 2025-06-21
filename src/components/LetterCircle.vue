<template>
  <div class="letter-circle-container">
    <div class="letter-circle" ref="circleRef">
      <svg
        class="connection-lines"
        :width="circleSize"
        :height="circleSize"
        :viewBox="`0 0 ${circleSize} ${circleSize}`"
      >
        <path
          v-if="connectionPath"
          :d="connectionPath"
          stroke="#42a5f5"
          stroke-width="6"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="connection-path"
          opacity="0.9"
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
          'letter-drawing': isDrawingLine,
          'letter-nearby':
            isDrawingLine && nearbyIndex === index && !selectedIndices.includes(index),
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

    <div class="center-circle shuffle-center" v-else-if="!isConnecting">
      <q-btn
        round
        color="purple"
        icon="shuffle"
        size="md"
        @click="emit('shuffle-letters')"
        class="shuffle-button"
      >
        <q-tooltip>Shuffle letters</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { validateConnectedWord } from '../utils/word-validator';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface Props {
  letters: string[];
  selectedIndices: number[];
}

interface Emits {
  (e: 'letter-selected', indices: number[], word: string): void;
  (e: 'word-submitted', word: string): void;
  (e: 'letters-cleared'): void;
  (e: 'shuffle-letters'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const circleRef = ref<HTMLElement>();
const circleSize = ref(200);
const radius = computed(() => circleSize.value * 0.4);
const isConnecting = ref(false);
const hoveredIndex = ref(-1);
const animatedIndices = ref<number[]>([]);
const currentSelectedIndices = ref<number[]>([]);
const currentMousePosition = ref({ x: 0, y: 0 });
const isDrawingLine = ref(false);
const nearbyIndex = ref(-1);

const currentWord = computed(() => {
  return currentSelectedIndices.value.map((index) => props.letters[index]).join('');
});

const connectionPath = computed(() => {
  if (currentSelectedIndices.value.length === 0) return '';

  const points = currentSelectedIndices.value.map((index) => {
    const angle = (index * 2 * Math.PI) / props.letters.length - Math.PI / 2;
    const centerPoint = circleSize.value / 2;
    const x = centerPoint + radius.value * Math.cos(angle);
    const y = centerPoint + radius.value * Math.sin(angle);
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

  // If we're actively drawing and have at least one point, add line to current mouse position
  if (isDrawingLine.value && points.length > 0) {
    path += ` L ${currentMousePosition.value.x} ${currentMousePosition.value.y}`;
  }

  return path;
});

const getLetterPosition = (index: number) => {
  const angle = (index * 2 * Math.PI) / props.letters.length - Math.PI / 2;
  const radiusPercent = (radius.value / circleSize.value) * 100;
  const x = 50 + radiusPercent * Math.cos(angle);
  const y = 50 + radiusPercent * Math.sin(angle);

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
  } else {
    // Allow connecting to any letter, no adjacency restriction
    currentSelectedIndices.value.push(index);
    void animateLetterSelection(index);
  }

  isConnecting.value = true;
  isDrawingLine.value = true;
  updateSelection();
};

const handleMouseEnter = (index: number) => {
  if (isConnecting.value && isDrawingLine.value) {
    hoveredIndex.value = index;

    if (currentSelectedIndices.value.includes(index)) {
      // Allow backtracking to previously selected letters
      const indexInSelection = currentSelectedIndices.value.indexOf(index);
      currentSelectedIndices.value = currentSelectedIndices.value.slice(0, indexInSelection + 1);
      updateSelection();
    } else {
      // Allow connecting to any letter
      currentSelectedIndices.value.push(index);
      void animateLetterSelection(index);
      updateSelection();
    }
  }
};

const updateMousePosition = (clientX: number, clientY: number) => {
  if (!circleRef.value) return;

  const rect = circleRef.value.getBoundingClientRect();
  const svgX = ((clientX - rect.left) / rect.width) * circleSize.value;
  const svgY = ((clientY - rect.top) / rect.height) * circleSize.value;

  currentMousePosition.value = { x: svgX, y: svgY };
};

const handleMouseMove = (event: MouseEvent) => {
  if (!isDrawingLine.value) return;
  updateMousePosition(event.clientX, event.clientY);

  // Check if mouse is over a letter for precise connection
  const letterElements = document.querySelectorAll('.letter-item');
  let targetIndex = -1;
  let nearbyTargetIndex = -1;
  let minDistance = Infinity;
  let minNearbyDistance = Infinity;

  letterElements.forEach((element, index) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.sqrt(
      Math.pow(event.clientX - centerX, 2) + Math.pow(event.clientY - centerY, 2),
    );

    // Precise tolerance for mouse - must be close to letter center
    const letterRadius = (rect.width / 2) * 0.7; // 70% of letter radius for mouse precision
    const nearbyRadius = (rect.width / 2) * 0.9; // 90% for nearby detection

    if (distance <= letterRadius && distance < minDistance) {
      targetIndex = index;
      minDistance = distance;
    } else if (distance <= nearbyRadius && distance < minNearbyDistance) {
      nearbyTargetIndex = index;
      minNearbyDistance = distance;
    }
  });

  // Update nearby indicator
  nearbyIndex.value = nearbyTargetIndex;

  if (targetIndex !== -1 && targetIndex !== hoveredIndex.value) {
    handleMouseEnter(targetIndex);
  }
};

const handleTouchMove = (event: TouchEvent) => {
  if (!isDrawingLine.value) return;

  const touch = event.touches[0];
  if (!touch) return;

  // Update line position to follow touch
  updateMousePosition(touch.clientX, touch.clientY);

  // Get all letter elements
  const letterElements = document.querySelectorAll('.letter-item');

  // Find which letter is under the touch point with precise tolerance
  let targetIndex = -1;
  let nearbyTargetIndex = -1;
  let minDistance = Infinity;
  let minNearbyDistance = Infinity;

  letterElements.forEach((element, index) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.sqrt(
      Math.pow(touch.clientX - centerX, 2) + Math.pow(touch.clientY - centerY, 2),
    );

    // More precise tolerance - user must touch closer to the letter center
    const letterRadius = (rect.width / 2) * 0.8; // 80% of letter radius for precision
    const nearbyRadius = rect.width / 2; // Full radius for nearby detection

    if (distance <= letterRadius && distance < minDistance) {
      targetIndex = index;
      minDistance = distance;
    } else if (distance <= nearbyRadius && distance < minNearbyDistance) {
      nearbyTargetIndex = index;
      minNearbyDistance = distance;
    }
  });

  // Update nearby indicator
  nearbyIndex.value = nearbyTargetIndex;

  if (targetIndex !== -1 && targetIndex !== hoveredIndex.value) {
    handleMouseEnter(targetIndex);
  }
};

const handleTouchEnd = () => {
  if (isConnecting.value) {
    isConnecting.value = false;
    isDrawingLine.value = false;
    if (currentSelectedIndices.value.length >= 3) {
      void submitWord();
    } else {
      // Reset if word is too short
      clearSelection();
    }
  }
};

const handleMouseUp = () => {
  if (isConnecting.value) {
    isConnecting.value = false;
    isDrawingLine.value = false;
    if (currentSelectedIndices.value.length >= 3) {
      void submitWord();
    } else {
      // Reset if word is too short
      clearSelection();
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
  isDrawingLine.value = false;
  hoveredIndex.value = -1;
  nearbyIndex.value = -1;
  currentMousePosition.value = { x: 0, y: 0 };
  emit('letters-cleared');
};

const handleClickOutside = (event: MouseEvent) => {
  if (circleRef.value && !circleRef.value.contains(event.target as Node)) {
    clearSelection();
  }
};

const updateCircleSize = () => {
  if (circleRef.value) {
    const rect = circleRef.value.getBoundingClientRect();
    circleSize.value = Math.min(rect.width, rect.height);
  }
};

onMounted(() => {
  updateCircleSize();
  window.addEventListener('resize', updateCircleSize);

  document.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('mouseup', handleMouseUp);
  document.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('resize', updateCircleSize);
});
</script>

<style scoped>
.letter-circle-container {
  position: relative;
  width: min(85vw, 400px);
  height: min(85vw, 400px);
  margin: 0 auto;
  touch-action: none;
  user-select: none;
  /* Ensure consistent aspect ratio */
  aspect-ratio: 1;
}

.letter-circle {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 2px solid var(--glass-border);
  box-shadow: var(--shadow-primary);
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
  filter: drop-shadow(0 0 10px rgba(66, 165, 245, 0.8));
  transition: all 0.1s ease-out;
}

.letter-item {
  position: absolute;
  width: clamp(50px, 12vw, 80px);
  height: clamp(50px, 12vw, 80px);
  cursor: pointer;
  z-index: 2;
  transition: all 0.2s ease;
  user-select: none;
  touch-action: none;
  /* Reduced padding for more precise touch detection */
  padding: clamp(3px, 1vw, 6px);
  margin: calc(-1 * clamp(3px, 1vw, 6px));
}

.letter-content {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(45deg, var(--accent-color), var(--accent-color));
  color: var(--text-primary);
  font-size: clamp(1.2rem, 3.5vw, 2rem);
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-primary);
  transition: all 0.3s ease;
}

.letter-selected .letter-content {
  background: linear-gradient(45deg, var(--success-color), var(--success-color));
  transform: scale(1.1);
  box-shadow: var(--shadow-glow);
  animation: glow 2s ease-in-out infinite alternate;
}

.letter-connecting .letter-content {
  background: linear-gradient(45deg, #ff9800, #f57c00);
  transform: scale(1.05);
}

.letter-item:hover .letter-content {
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(66, 165, 245, 0.3);
}

.letter-drawing .letter-content {
  border: 2px solid rgba(66, 165, 245, 0.6);
  transition: all 0.1s ease;
}

.letter-drawing:hover .letter-content {
  transform: scale(1.08);
  border-color: rgba(66, 165, 245, 1);
}

.letter-nearby .letter-content {
  border: 2px solid rgba(255, 193, 7, 0.6);
  transform: scale(1.03);
  transition: all 0.1s ease;
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
  width: clamp(80px, 20vw, 120px);
  height: clamp(80px, 20vw, 120px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 3;
}

.center-word {
  font-size: clamp(0.9rem, 2.5vw, 1.3rem);
  font-weight: bold;
  color: #333;
  margin-bottom: clamp(4px, 1vw, 8px);
  text-align: center;
  line-height: 1;
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.submit-button {
  width: 35px;
  height: 35px;
  min-height: 35px;
}

.shuffle-center {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.shuffle-button {
  width: 45px;
  height: 45px;
  min-height: 45px;
  background: rgba(156, 39, 176, 0.95) !important;
  box-shadow: 0 4px 20px rgba(156, 39, 176, 0.4);
  transition: all 0.3s ease;
}

.shuffle-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 25px rgba(156, 39, 176, 0.6);
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

/* Large devices - ensure consistency */
@media (min-width: 768px) {
  .letter-circle-container {
    width: min(70vw, 500px);
    height: min(70vw, 500px);
  }

  .letter-item {
    width: clamp(60px, 8vw, 90px);
    height: clamp(60px, 8vw, 90px);
  }

  .letter-content {
    font-size: clamp(1.4rem, 2.5vw, 2.2rem);
  }

  .center-circle {
    width: clamp(100px, 15vw, 140px);
    height: clamp(100px, 15vw, 140px);
  }
}

@media (max-width: 767px) and (min-width: 481px) {
  .letter-circle-container {
    width: min(75vw, 350px);
    height: min(75vw, 350px);
  }
}

@media (max-width: 480px) {
  .letter-circle-container {
    width: min(90vw, 320px);
    height: min(90vw, 320px);
  }

  .letter-item {
    width: clamp(45px, 15vw, 65px);
    height: clamp(45px, 15vw, 65px);
    /* More precise touch targets on mobile */
    padding: clamp(4px, 2vw, 8px);
    margin: calc(-1 * clamp(4px, 2vw, 8px));
  }

  .letter-content {
    font-size: clamp(1rem, 4.5vw, 1.6rem);
  }

  .center-circle {
    width: clamp(70px, 22vw, 100px);
    height: clamp(70px, 22vw, 100px);
  }

  .center-word {
    font-size: clamp(0.8rem, 3.5vw, 1.1rem);
  }

  .shuffle-button {
    width: clamp(35px, 8vw, 45px);
    height: clamp(35px, 8vw, 45px);
    min-height: clamp(35px, 8vw, 45px);
  }
}
</style>
