<template>
  <q-page class="game-page">
    <div class="game-header">
      <q-btn flat round icon="arrow_back" color="white" @click="goBack" class="back-button" />

      <div class="level-info">
        <div class="level-title">{{ currentLevel?.name }}</div>
        <div class="progress-info">
          {{ foundWords.length }} / {{ currentLevel?.targetWords.length }} Words
        </div>
      </div>

      <div class="game-stats">
        <div class="stat-item">
          <q-icon name="diamond" color="blue" />
          <span>{{ userProgress.gems }}</span>
        </div>
        <q-btn
          flat
          round
          icon="palette"
          color="white"
          @click="showThemeSelector = true"
          class="theme-button"
        >
          <q-tooltip>Change Theme</q-tooltip>
        </q-btn>
      </div>
    </div>

    <div class="game-content">
      <!-- Crossword Grid -->
      <div class="crossword-section">
        <CrosswordGrid
          :target-words="currentLevel?.targetWords || []"
          :found-words="foundWords"
          class="crossword-grid"
        />
      </div>

      <!-- Letter Circle -->
      <div class="letter-circle-section">
        <LetterCircle
          :letters="shuffledLetters"
          :selected-indices="connectedLetterIndices"
          @letter-selected="handleLetterSelection"
          @word-submitted="handleWordSubmission"
          @letters-cleared="handleLettersClear"
          @shuffle-letters="shuffleLetters"
          class="letter-circle"
        />
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <q-btn
          round
          color="orange"
          icon="lightbulb"
          size="md"
          @click="showHints"
          class="hint-button"
        >
          <q-tooltip>Get hints</q-tooltip>
        </q-btn>

        <q-btn
          round
          color="red"
          icon="clear"
          size="md"
          @click="clearSelection"
          :disable="connectedLetterIndices.length === 0"
          class="clear-button"
        >
          <q-tooltip>Clear selection</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Success Dialog -->
    <q-dialog v-model="showSuccessDialog" persistent>
      <q-card class="success-card">
        <q-card-section class="text-center">
          <q-icon name="celebration" size="60px" color="amber" />
          <h3 class="success-title">Level Complete!</h3>
          <p class="success-message">
            Congratulations! You found all {{ currentLevel?.targetWords.length }} words!
          </p>
          <div class="rewards">
            <div class="reward-item">
              <q-icon name="diamond" color="blue" />
              <span>+50 Gems</span>
            </div>
            <div class="reward-item">
              <q-icon name="stars" color="amber" />
              <span>+3 Stars</span>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            push
            color="primary"
            label="Continue"
            @click="handleLevelComplete"
            class="continue-button"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Word Found Animation -->
    <q-dialog v-model="showWordFoundDialog" no-backdrop-dismiss>
      <q-card class="word-found-card">
        <q-card-section class="text-center">
          <div class="word-found-animation">
            <q-icon name="check_circle" size="40px" color="green" />
            <div class="found-word">{{ lastFoundWord }}</div>
            <div class="word-points">+5 Gems</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Hint System -->
    <HintSystem
      v-model="showHintDialog"
      :target-words="currentLevel?.targetWords || []"
      :found-words="foundWords"
      @hint-used="handleHintUsed"
    />

    <!-- Theme Selector -->
    <ThemeSelector v-model="showThemeSelector" @theme-changed="handleThemeChanged" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/game-store';
import { useThemeStore } from '../stores/theme-store';
import { shuffleArray } from '../utils/word-validator';
import LetterCircle from '../components/LetterCircle.vue';
import CrosswordGrid from '../components/CrosswordGrid.vue';
import HintSystem from '../components/HintSystem.vue';
import ThemeSelector from '../components/ThemeSelector.vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const router = useRouter();
const gameStore = useGameStore();
const themeStore = useThemeStore();

const { currentLevel, userProgress, foundWords, connectedLetterIndices } = gameStore;

const shuffledLetters = ref<string[]>([]);
const currentWord = ref('');
const showSuccessDialog = ref(false);
const showWordFoundDialog = ref(false);
const showHintDialog = ref(false);
const showThemeSelector = ref(false);
const lastFoundWord = ref('');

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
    // Haptics not available (web/desktop)
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

    // Check if level is complete
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

const showHints = () => {
  showHintDialog.value = true;
};

const handleHintUsed = (type: string, data?: unknown) => {
  console.log('Hint used:', type, data);
  // Handle different hint types
  switch (type) {
    case 'reveal-letter':
      // Logic to reveal the letter in crossword grid
      break;
    case 'word-hint':
      // Show word hint information
      break;
    case 'smart-shuffle':
      shuffleLetters();
      break;
  }
};

const shuffleLetters = () => {
  if (currentLevel) {
    shuffledLetters.value = shuffleArray(currentLevel.letters);
  }
};

const clearSelection = () => {
  currentWord.value = '';
};

const handleLevelComplete = async () => {
  gameStore.completeLevel();
  gameStore.saveProgress();
  showSuccessDialog.value = false;
  await router.push('/levels');
};

const handleThemeChanged = (themeId: string) => {
  console.log('Theme changed to:', themeId);
  // Check for theme unlocks based on current progress
  themeStore.checkThemeUnlocks(userProgress.completedLevels.length);
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
  display: flex;
  flex-direction: column;
  position: relative;
}

.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--glass-border);
  z-index: 10;
}

.back-button {
  flex-shrink: 0;
}

.level-info {
  flex: 1;
  text-align: center;
  color: white;
}

.level-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.progress-info {
  font-size: 0.9rem;
  opacity: 0.9;
}

.game-stats {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: white;
  font-weight: 500;
}

.theme-button {
  width: 40px;
  height: 40px;
}

.game-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 10px 10px;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  min-height: 0;
}

.crossword-section {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.letter-circle-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  max-height: 40vh;
}

.action-buttons {
  display: flex;
  gap: 20px;
  flex-shrink: 0;
  padding-bottom: 10px;
}

.hint-button,
.clear-button {
  width: 50px;
  height: 50px;
}

.success-card {
  border-radius: 20px;
  max-width: 350px;
  width: 90%;
  margin: 0 auto;
}

.success-title {
  color: #333;
  margin: 20px 0 10px 0;
}

.success-message {
  color: #666;
  margin-bottom: 20px;
}

.rewards {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin: 20px 0;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #333;
}

.continue-button {
  width: 200px;
  height: 45px;
  border-radius: 22px;
}

.word-found-card {
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.word-found-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
}

.found-word {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.word-points {
  font-size: 1rem;
  color: #2196f3;
  font-weight: 500;
}

@media (max-width: 480px) {
  .game-content {
    padding: 15px 8px 8px;
    gap: 15px;
  }

  .action-buttons {
    gap: 15px;
  }

  .hint-button,
  .clear-button {
    width: 45px;
    height: 45px;
  }

  .crossword-grid {
    max-height: 30vh;
  }
}
</style>
