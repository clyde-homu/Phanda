<template>
  <q-page class="game-page">
    <!-- Animated Background -->
    <div class="animated-background">
      <div class="floating-orbs">
        <div v-for="n in 8" :key="n" class="orb" :style="getOrbStyle(n)"></div>
      </div>
      <div class="energy-waves">
        <div v-for="n in 3" :key="n" class="wave" :style="`animation-delay: ${n * 0.5}s`"></div>
      </div>
    </div>

    <!-- Compact Header -->
    <div class="game-header glass-morphism">
      <q-btn
        flat
        round
        icon="arrow_back"
        color="white"
        size="md"
        @click="goBack"
        class="header-btn pulse-on-hover"
      />

      <div class="level-indicator">
        <div class="level-ring">
          <div class="level-number">{{ currentLevel?.id }}</div>
          <svg class="progress-ring" width="50" height="50">
            <circle
              class="progress-ring-bg"
              cx="25"
              cy="25"
              r="20"
              stroke="rgba(255,255,255,0.2)"
              stroke-width="3"
              fill="transparent"
            />
            <circle
              class="progress-ring-fill"
              cx="25"
              cy="25"
              r="20"
              stroke="white"
              stroke-width="3"
              fill="transparent"
              :stroke-dasharray="125.6"
              :stroke-dashoffset="
                125.6 * (1 - foundWords.length / (currentLevel?.targetWords.length || 1))
              "
            />
          </svg>
        </div>
        <div class="progress-text">
          {{ foundWords.length }}/{{ currentLevel?.targetWords.length }}
        </div>
      </div>

      <div class="header-actions">
        <div class="gems-display glass-pill">
          <q-icon name="diamond" color="cyan" size="18px" />
          <span class="gems-count">{{ userProgress.gems }}</span>
          <div class="gems-glow"></div>
        </div>

        <!-- Hint Button in Header -->
        <q-btn
          flat
          round
          icon="lightbulb"
          color="amber"
          size="md"
          @click="useHint"
          :disable="!canUseHint || availableHints.length === 0"
          class="hint-btn pulse-on-hover"
          :class="{ 'hint-available': canUseHint && availableHints.length > 0 }"
        >
          <q-tooltip anchor="bottom middle" self="top middle" class="custom-tooltip">
            {{ canUseHint ? `Reveal Word (5 💎)` : 'Need 5 gems' }}
          </q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          icon="palette"
          color="white"
          size="md"
          @click="showThemeSelector = true"
          class="header-btn pulse-on-hover"
        />
      </div>
    </div>

    <!-- Main Game Area -->
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
            <div
              class="counter-item"
              v-for="(word, index) in currentLevel?.targetWords"
              :key="index"
            >
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
          @word-submitted="handleWordSubmission"
          @letters-cleared="handleLettersClear"
          @shuffle-letters="shuffleLetters"
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

    <!-- Success Celebration -->
    <q-dialog v-model="showSuccessDialog" persistent class="success-dialog">
      <q-card class="success-card glass-morphism">
        <div class="celebration-bg">
          <div class="confetti" v-for="n in 20" :key="n" :style="getConfettiStyle(n)"></div>
          <div class="success-rays">
            <div
              v-for="n in 8"
              :key="n"
              class="ray"
              :style="`transform: rotate(${n * 45}deg)`"
            ></div>
          </div>
        </div>

        <q-card-section class="success-content">
          <div class="success-icon-container">
            <q-icon name="celebration" size="80px" color="amber" class="success-icon" />
            <div class="icon-rings">
              <div
                v-for="n in 3"
                :key="n"
                class="success-ring"
                :style="`animation-delay: ${n * 0.2}s`"
              ></div>
            </div>
          </div>

          <h2 class="success-title">Level Complete!</h2>
          <p class="success-message">
            Amazing! You found all {{ currentLevel?.targetWords.length }} words!
          </p>

          <div class="rewards-showcase">
            <div class="reward-item">
              <div class="reward-icon">
                <q-icon name="diamond" color="cyan" size="30px" />
                <div class="reward-sparkle"></div>
              </div>
              <div class="reward-text">+50 Gems</div>
            </div>
            <div class="reward-item">
              <div class="reward-icon">
                <q-icon name="stars" color="amber" size="30px" />
                <div class="reward-sparkle"></div>
              </div>
              <div class="reward-text">+3 Stars</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="success-actions">
          <q-btn
            push
            color="primary"
            size="lg"
            icon="arrow_forward"
            label="Continue Adventure"
            @click="handleLevelComplete"
            class="continue-btn interactive-button"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Word Found Animation -->
    <q-dialog v-model="showWordFoundDialog" no-backdrop-dismiss class="word-found-dialog">
      <q-card class="word-found-card glass-morphism">
        <div class="word-found-bg">
          <div class="success-particles">
            <div v-for="n in 12" :key="n" class="particle" :style="getParticleStyle(n)"></div>
          </div>
        </div>

        <q-card-section class="word-found-content">
          <div class="found-icon-container">
            <q-icon name="check_circle" size="50px" color="green" class="found-icon" />
            <div class="check-glow"></div>
          </div>
          <div class="found-word-text">{{ lastFoundWord }}</div>
          <div class="found-points">
            <q-icon name="diamond" color="cyan" size="20px" />
            <span>+5 Gems</span>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Hint Result Dialog -->
    <q-dialog v-model="showHintResult" no-backdrop-dismiss class="hint-result-dialog">
      <q-card class="hint-result-card glass-morphism">
        <div class="hint-result-bg">
          <div class="hint-particles">
            <div
              v-for="n in 8"
              :key="n"
              class="hint-particle"
              :style="getHintParticleStyle(n)"
            ></div>
          </div>
        </div>

        <q-card-section class="hint-result-content">
          <div class="hint-result-icon-container">
            <q-icon name="lightbulb" size="50px" color="amber" class="hint-result-icon" />
            <div class="hint-glow-effect"></div>
          </div>
          <div class="hint-result-title">Word Revealed!</div>
          <div class="hint-result-word">{{ revealedWord }}</div>
          <div class="hint-cost-display">
            <q-icon name="diamond" color="cyan" size="20px" />
            <span>-5 Gems</span>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Theme Selector -->
    <ThemeSelector v-model="showThemeSelector" @theme-changed="handleThemeChanged" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/game-store';
import { useThemeStore } from '../stores/theme-store';
import { shuffleArray } from '../utils/word-validator';
import LetterCircle from '../components/LetterCircle.vue';
import CrosswordGrid from '../components/CrosswordGrid.vue';
import ThemeSelector from '../components/ThemeSelector.vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const router = useRouter();
const gameStore = useGameStore();
const themeStore = useThemeStore();

const { currentLevel, userProgress, foundWords, connectedLetterIndices, totalCompletedLevels } =
  gameStore;

const shuffledLetters = ref<string[]>([]);
const currentWord = ref('');
const showSuccessDialog = ref(false);
const showWordFoundDialog = ref(false);
const showThemeSelector = ref(false);
const showHintResult = ref(false);
const lastFoundWord = ref('');
const revealedWord = ref('');

// Computed properties
const availableHints = computed(() => {
  if (!currentLevel) return [];
  return currentLevel.targetWords.filter((word: string) => !foundWords.includes(word));
});

const canUseHint = computed(() => userProgress.gems >= 5);

const goBack = async () => {
  gameStore.resetGame();
  await router.push('/levels');
};

const handleLetterSelection = (indices: number[], word: string) => {
  currentWord.value = word;
};

const triggerHapticFeedback = async (style: ImpactStyle = ImpactStyle.Light) => {
  try {
    await Haptics.impact({ style });
  } catch {
    console.log('Haptics not available');
  }
};

const handleWordSubmission = async (word: string) => {
  if (currentLevel && currentLevel.targetWords.includes(word.toUpperCase())) {
    await triggerHapticFeedback(ImpactStyle.Medium);
    gameStore.addFoundWord(word.toUpperCase());
    lastFoundWord.value = word.toUpperCase();
    showWordFoundDialog.value = true;

    setTimeout(() => {
      showWordFoundDialog.value = false;
    }, 1500);

    if (currentLevel && foundWords.length === currentLevel.targetWords.length) {
      setTimeout(() => {
        void triggerHapticFeedback(ImpactStyle.Heavy);
        showSuccessDialog.value = true;
      }, 2000);
    }
  }

  currentWord.value = '';
};

const handleLettersClear = () => {
  currentWord.value = '';
};

const useHint = async () => {
  if (!canUseHint.value || availableHints.value.length === 0) {
    return;
  }

  // Deduct gems
  userProgress.gems -= 5;

  // Get random unrevealed word
  const randomWord = availableHints.value[Math.floor(Math.random() * availableHints.value.length)];

  // Check if randomWord exists (TypeScript safety)
  if (!randomWord) {
    console.error('No available hints found');
    return;
  }

  // Add word to found words
  gameStore.addFoundWord(randomWord);
  revealedWord.value = randomWord;

  // Show hint result
  showHintResult.value = true;

  // Trigger haptic feedback
  await triggerHapticFeedback(ImpactStyle.Medium);

  // Hide hint result after 2 seconds
  setTimeout(() => {
    showHintResult.value = false;
  }, 2000);

  // Check if level is complete
  if (currentLevel && foundWords.length === currentLevel.targetWords.length) {
    setTimeout(() => {
      void triggerHapticFeedback(ImpactStyle.Heavy);
      showSuccessDialog.value = true;
    }, 2500);
  }
};

const shuffleLetters = async () => {
  await triggerHapticFeedback(ImpactStyle.Light);
  if (currentLevel) {
    shuffledLetters.value = shuffleArray(currentLevel.letters);
  }
};

const handleLevelComplete = async () => {
  gameStore.completeLevel();
  gameStore.saveProgress();
  showSuccessDialog.value = false;
  await router.push('/levels');
};

const handleThemeChanged = () => {
  themeStore.checkThemeUnlocks(totalCompletedLevels);
};

// Animation helper functions
const getOrbStyle = (index: number) => {
  const positions = [
    { top: '10%', left: '15%', size: '60px', delay: '0s' },
    { top: '25%', right: '20%', size: '40px', delay: '1s' },
    { top: '60%', left: '10%', size: '80px', delay: '2s' },
    { top: '70%', right: '15%', size: '50px', delay: '3s' },
    { top: '40%', left: '50%', size: '30px', delay: '1.5s' },
    { top: '80%', left: '60%', size: '45px', delay: '2.5s' },
    { top: '15%', left: '70%', size: '35px', delay: '0.5s' },
    { top: '90%', right: '40%', size: '55px', delay: '3.5s' },
  ];

  const pos = positions[index - 1];
  if (!pos) return '';

  return `
    top: ${pos.top};
    ${pos.left ? `left: ${pos.left}` : `right: ${pos.right}`};
    width: ${pos.size};
    height: ${pos.size};
    animation-delay: ${pos.delay};
  `;
};

const getConfettiStyle = (index: number) => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
  const randomColor = colors[index % colors.length];
  const randomLeft = Math.random() * 100;
  const randomDelay = Math.random() * 2;

  return `
    left: ${randomLeft}%;
    background: ${randomColor};
    animation-delay: ${randomDelay}s;
  `;
};

const getParticleStyle = (index: number) => {
  const angle = (index * 30) % 360;
  const distance = 40 + (index % 3) * 15;
  const delay = (index * 0.1) % 1;

  return `
    transform: rotate(${angle}deg) translateX(${distance}px);
    animation-delay: ${delay}s;
  `;
};

const getHintParticleStyle = (index: number) => {
  const angle = (index * 45) % 360;
  const distance = 30 + (index % 2) * 10;
  const delay = (index * 0.15) % 1;

  return `
    transform: rotate(${angle}deg) translateX(${distance}px);
    animation-delay: ${delay}s;
  `;
};

onMounted(async () => {
  if (!currentLevel) {
    await router.push('/levels');
    return;
  }

  shuffledLetters.value = [...currentLevel.letters];
});

watch(
  () => currentLevel,
  (newLevel) => {
    if (newLevel) {
      shuffledLetters.value = [...newLevel.letters];
    }
  },
);
</script>

<style scoped>
.game-page {
  background: var(--primary-bg);
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Animated Background */
.animated-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.floating-orbs {
  position: absolute;
  width: 100%;
  height: 100%;
}

.orb {
  position: absolute;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02));
  border-radius: 50%;
  animation: floatOrb 8s ease-in-out infinite;
  backdrop-filter: blur(2px);
}

@keyframes floatOrb {
  0%,
  100% {
    transform: translateY(0px) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) scale(1.1);
    opacity: 0.6;
  }
}

.energy-waves {
  position: absolute;
  width: 100%;
  height: 100%;
}

.wave {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 300px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: expandWave 4s ease-out infinite;
}

@keyframes expandWave {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

/* Compact Header */
.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  backdrop-filter: blur(25px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  z-index: 100;
  min-height: 60px;
  position: relative;
}

.glass-morphism {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.header-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.hint-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 193, 7, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 193, 7, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.hint-btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(255, 193, 7, 0.2), transparent);
  animation: hintShimmer 2s infinite;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.hint-available:before {
  opacity: 1;
}

.hint-available {
  animation: hintPulse 2s ease-in-out infinite;
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.4);
}

@keyframes hintShimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes hintPulse {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(255, 193, 7, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 193, 7, 0.6);
  }
}

.pulse-on-hover:hover {
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.hint-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 0 25px rgba(255, 193, 7, 0.5);
}

.level-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.level-ring {
  position: relative;
  width: 50px;
  height: 50px;
}

.level-number {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  z-index: 2;
}

.progress-ring {
  transform: rotate(-90deg);
  position: absolute;
  top: 0;
  left: 0;
}

.progress-ring-fill {
  transition: stroke-dashoffset 0.5s ease;
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));
}

.progress-text {
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.gems-display {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.glass-pill {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.gems-count {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.gems-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(0, 255, 255, 0.2), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Game Arena */
.game-arena {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 25px;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.floating-container {
  position: relative;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 25px;
  padding: 20px;
  overflow: hidden;
  animation: containerFloat 6s ease-in-out infinite;
}

@keyframes containerFloat {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}

.section-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  right: -50%;
  bottom: -50%;
  background: radial-gradient(circle, var(--accent-color) 0%, transparent 70%);
  opacity: 0.1;
  animation: glowPulse 4s ease-in-out infinite;
}

@keyframes glowPulse {
  0%,
  100% {
    opacity: 0.05;
    transform: scale(1);
  }
  50% {
    opacity: 0.15;
    transform: scale(1.1);
  }
}

.crossword-glow {
  background: radial-gradient(circle, #4caf50 0%, transparent 70%);
}

.circle-glow {
  background: radial-gradient(circle, #2196f3 0%, transparent 70%);
}

.container-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  z-index: 2;
  position: relative;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.word-counter {
  display: flex;
  gap: 6px;
}

.counter-item {
  position: relative;
}

.counter-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.dot-found {
  background: #4caf50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.6);
  animation: dotFound 0.5s ease-out;
}

@keyframes dotFound {
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

.crossword-container {
  flex-shrink: 0;
}

.letter-circle-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 250px;
}

.magnetic-field {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.magnetic-ring {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: magneticPulse 3s ease-in-out infinite;
}

.magnetic-ring:nth-child(1) {
  width: 200px;
  height: 200px;
  margin: -100px 0 0 -100px;
}
.magnetic-ring:nth-child(2) {
  width: 250px;
  height: 250px;
  margin: -125px 0 0 -125px;
}
.magnetic-ring:nth-child(3) {
  width: 300px;
  height: 300px;
  margin: -150px 0 0 -150px;
}
.magnetic-ring:nth-child(4) {
  width: 350px;
  height: 350px;
  margin: -175px 0 0 -175px;
}
.magnetic-ring:nth-child(5) {
  width: 400px;
  height: 400px;
  margin: -200px 0 0 -200px;
}
.magnetic-ring:nth-child(6) {
  width: 450px;
  height: 450px;
  margin: -225px 0 0 -225px;
}

@keyframes magneticPulse {
  0%,
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 0.3;
    transform: scale(1);
  }
}

.current-word-display {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.word-preview {
  padding: 12px 20px;
  border-radius: 25px;
  min-width: 120px;
  text-align: center;
  animation: wordPreviewAppear 0.3s ease-out;
}

@keyframes wordPreviewAppear {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(10px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

.word-text {
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 5px;
  letter-spacing: 2px;
}

.word-energy-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.energy-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* Success Dialog */
.success-dialog .q-dialog__inner {
  padding: 20px;
}

.success-card {
  border-radius: 30px;
  max-width: 400px;
  width: 90%;
  position: relative;
  overflow: hidden;
  animation: successAppear 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes successAppear {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-10deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.celebration-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.confetti {
  position: absolute;
  width: 8px;
  height: 8px;
  animation: confettiFall 3s ease-out infinite;
}

@keyframes confettiFall {
  0% {
    top: -10px;
    transform: rotate(0deg);
    opacity: 1;
  }
  100% {
    top: 100%;
    transform: rotate(720deg);
    opacity: 0;
  }
}

.success-rays {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.ray {
  position: absolute;
  width: 2px;
  height: 100px;
  background: linear-gradient(to bottom, rgba(255, 193, 7, 0.8), transparent);
  transform-origin: bottom center;
  animation: rayRotate 2s linear infinite;
}

@keyframes rayRotate {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.success-content {
  text-align: center;
  padding: 40px 30px 30px;
  position: relative;
  z-index: 2;
}

.success-icon-container {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.success-icon {
  animation: successIconBounce 1s ease-out;
  filter: drop-shadow(0 0 20px rgba(255, 193, 7, 0.5));
}

@keyframes successIconBounce {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.icon-rings {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.success-ring {
  position: absolute;
  border: 2px solid rgba(255, 193, 7, 0.3);
  border-radius: 50%;
  animation: ringExpand 1.5s ease-out infinite;
}

.success-ring:nth-child(1) {
  width: 80px;
  height: 80px;
  margin: -40px 0 0 -40px;
}
.success-ring:nth-child(2) {
  width: 120px;
  height: 120px;
  margin: -60px 0 0 -60px;
}
.success-ring:nth-child(3) {
  width: 160px;
  height: 160px;
  margin: -80px 0 0 -80px;
}

@keyframes ringExpand {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

.success-title {
  color: white;
  margin: 0 0 15px 0;
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.success-message {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 30px;
  font-size: 1.1rem;
  line-height: 1.4;
}

.rewards-showcase {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 20px;
}

.reward-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.reward-icon {
  position: relative;
  animation: rewardFloat 2s ease-in-out infinite;
}

.reward-sparkle {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 12px;
  height: 12px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8), transparent);
  border-radius: 50%;
  animation: sparkle 1.5s ease-in-out infinite;
}

@keyframes rewardFloat {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes sparkle {
  0%,
  100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

.reward-text {
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.success-actions {
  padding: 20px 30px 30px;
  justify-content: center;
}

.continue-btn {
  width: 100%;
  height: 55px;
  border-radius: 27px;
  font-size: 1.1rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Word Found Dialog */
.word-found-dialog .q-dialog__inner {
  padding: 0;
  align-items: center;
  justify-content: center;
}

.word-found-card {
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  animation: wordFoundAppear 0.5s ease-out;
}

@keyframes wordFoundAppear {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.word-found-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.success-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #4caf50;
  border-radius: 50%;
  animation: particleExplode 1s ease-out;
}

@keyframes particleExplode {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

.word-found-content {
  padding: 30px;
  text-align: center;
  position: relative;
  z-index: 2;
}

.found-icon-container {
  position: relative;
  display: inline-block;
  margin-bottom: 15px;
}

.found-icon {
  animation: checkBounce 0.6s ease-out;
}

@keyframes checkBounce {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.check-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.3), transparent);
  border-radius: 50%;
  animation: checkGlow 1s ease-out;
}

@keyframes checkGlow {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1);
  }
}

.found-word-text {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  letter-spacing: 2px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.found-points {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
}

/* Hint Result Dialog */
.hint-result-dialog .q-dialog__inner {
  padding: 0;
  align-items: center;
  justify-content: center;
}

.hint-result-card {
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  animation: hintResultAppear 0.6s ease-out;
  max-width: 300px;
}

@keyframes hintResultAppear {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-15deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.hint-result-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.hint-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.hint-particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #ffc107;
  border-radius: 50%;
  animation: hintParticleExplode 1.2s ease-out;
}

@keyframes hintParticleExplode {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

.hint-result-content {
  padding: 30px;
  text-align: center;
  position: relative;
  z-index: 2;
}

.hint-result-icon-container {
  position: relative;
  display: inline-block;
  margin-bottom: 15px;
}

.hint-result-icon {
  animation: hintIconBounce 0.8s ease-out;
  filter: drop-shadow(0 0 15px rgba(255, 193, 7, 0.6));
}

@keyframes hintIconBounce {
  0% {
    transform: scale(0) rotate(-180deg);
  }
  50% {
    transform: scale(1.3) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

.hint-glow-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(255, 193, 7, 0.4), transparent);
  border-radius: 50%;
  animation: hintGlowPulse 1.5s ease-out;
}

@keyframes hintGlowPulse {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.5);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1);
  }
}

.hint-result-title {
  color: white;
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.hint-result-word {
  color: #ffc107;
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 15px;
  letter-spacing: 3px;
  text-shadow: 0 2px 15px rgba(255, 193, 7, 0.5);
  animation: wordGlow 1s ease-out;
}

@keyframes wordGlow {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.hint-cost-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  font-size: 1rem;
}

/* Custom Tooltip */
.custom-tooltip {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.85rem;
  backdrop-filter: blur(10px);
}

/* Responsive Design */
@media (max-width: 480px) {
  .game-arena {
    padding: 15px;
    gap: 20px;
  }

  .floating-container {
    padding: 15px;
    border-radius: 20px;
  }

  .game-header {
    padding: 10px 15px;
    min-height: 55px;
  }

  .header-btn,
  .hint-btn {
    width: 40px;
    height: 40px;
  }

  .level-ring {
    width: 45px;
    height: 45px;
  }

  .gems-display {
    padding: 6px 10px;
  }

  .success-card {
    width: 95%;
  }

  .success-content {
    padding: 30px 20px 20px;
  }

  .success-title {
    font-size: 1.6rem;
  }

  .rewards-showcase {
    gap: 30px;
  }

  .word-found-content,
  .hint-result-content {
    padding: 25px;
  }

  .found-word-text {
    font-size: 1.3rem;
  }

  .hint-result-word {
    font-size: 1.5rem;
  }
}

@media (max-width: 360px) {
  .game-arena {
    padding: 12px;
    gap: 15px;
  }

  .header-actions {
    gap: 8px;
  }

  .gems-display {
    padding: 5px 8px;
  }

  .gems-count {
    font-size: 0.8rem;
  }

  .hint-result-word {
    font-size: 1.3rem;
    letter-spacing: 2px;
  }
}
</style>
