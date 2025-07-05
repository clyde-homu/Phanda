<template>
  <div class="game-arena">
    <!-- Crossword Section with Floating Effect -->
    <div class="crossword-container floating-container">
      <div class="section-glow crossword-glow"></div>
      <div class="container-header">
        <div class="section-title">
          <q-icon name="grid_on" color="white" size="20px" />
          <span>{{ currentLevel?.name }}</span>
        </div>
        <div class="word-counter animate-counter">
          <div class="counter-item" v-for="(word, index) in currentLevel?.targetWords" :key="index">
            <div class="counter-dot" :class="{ 'dot-found': foundWords.includes(word) }"></div>
          </div>
        </div>
      </div>

      <CrosswordGrid
        :target-words="currentLevel?.targetWords || []"
        :found-words="foundWords"
        class="enhanced-crossword"
      />
    </div>

    <!-- Letter Circle Section with Magnetic Effect -->
    <div class="letter-circle-container floating-container">
      <div class="section-glow circle-glow"></div>
      <div class="magnetic-field">
        <div
          v-for="n in 6"
          :key="n"
          class="magnetic-ring"
          :style="`animation-delay: ${n * 0.3}s`"
        ></div>
      </div>

      <LetterCircle
        :letters="shuffledLetters"
        :selected-indices="connectedLetterIndices"
        @letter-selected="handleLetterSelection"
        @word-submitted="$emit('word-submitted', $event)"
        @letters-cleared="$emit('letters-cleared')"
        @shuffle-letters="$emit('shuffle-letters')"
        class="enhanced-letter-circle"
      />

      <!-- Current Word Display -->
      <div class="current-word-display" v-if="currentWord">
        <div class="word-preview glass-morphism">
          <div class="word-text">{{ currentWord }}</div>
          <div class="word-energy-bar">
            <div class="energy-fill" :style="`width: ${(currentWord.length / 8) * 100}%`"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameLevel } from 'src/stores/game-store';
import CrosswordGrid from '../CrosswordGrid.vue';
import LetterCircle from '../LetterCircle.vue';

interface Props {
  currentLevel: GameLevel | null;
  foundWords: string[];
  shuffledLetters: string[];
  connectedLetterIndices: number[];
  currentWord: string;
}

defineProps<Props>();

const emit = defineEmits<{
  'letter-selection': [indices: number[], word: string];
  'word-submitted': [word: string];
  'letters-cleared': [];
  'shuffle-letters': [];
}>();

const handleLetterSelection = (indices: number[], word: string) => {
  emit('letter-selection', indices, word);
};
</script>

<style scoped>
/* Game Arena */
.game-arena {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  padding-top: 80px;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 100vw;
  /* Prevent body scroll */
  -webkit-overflow-scrolling: touch;
  /* Optimize scrolling performance */
  will-change: scroll-position;
}

/* Floating Container Base */
.floating-container {
  position: relative;
  backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.floating-container:hover {
  transform: translateY(-2px);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* Section Glow */
.section-glow {
  position: absolute;
  inset: -20px;
  border-radius: 40px;
  z-index: -1;
  opacity: 0.3;
  filter: blur(40px);
}

.crossword-glow {
  background: radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, transparent 70%);
}

.circle-glow {
  background: radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, transparent 70%);
}

/* Container Header */
.container-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  opacity: 0.9;
}

/* Word Counter */
.word-counter {
  display: flex;
  gap: 4px;
}

.counter-item {
  width: 8px;
  height: 8px;
}

.counter-dot {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.counter-dot.dot-found {
  background: var(--secondary-color);
  box-shadow: 0 0 8px var(--secondary-color);
  animation: dot-pulse 0.6s ease;
}

@keyframes dot-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}

/* Crossword Container */
.crossword-container {
  flex-shrink: 0;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.enhanced-crossword {
  margin: 0 auto;
  width: 100%;
  max-width: 100%;
}

/* Letter Circle Container */
.letter-circle-container {
  position: relative;
  flex-shrink: 0;
}

/* Magnetic Field Effect */
.magnetic-field {
  position: absolute;
  inset: -50px;
  pointer-events: none;
  z-index: -1;
}

.magnetic-ring {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(168, 85, 247, 0.1);
  border-radius: 50%;
  animation: magnetic-pulse 3s infinite ease-out;
}

@keyframes magnetic-pulse {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.enhanced-letter-circle {
  position: relative;
  z-index: 1;
}

/* Current Word Display */
.current-word-display {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.word-preview {
  padding: 10px 20px;
  border-radius: 20px;
  min-width: 120px;
  text-align: center;
}

.word-text {
  font-size: 20px;
  font-weight: 600;
  color: white;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.word-energy-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.energy-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  transition: width 0.3s ease;
  box-shadow: 0 0 10px var(--primary-color);
}

/* Glass Morphism */
.glass-morphism {
  backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .game-arena {
    padding: 15px;
    padding-top: 80px;
    gap: 15px;
  }

  .floating-container {
    padding: 15px;
  }

  .section-title {
    font-size: 14px;
  }

  .word-text {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .game-arena {
    padding: 10px;
    gap: 10px;
  }

  .floating-container {
    padding: 12px;
    border-radius: 16px;
  }
}
</style>
