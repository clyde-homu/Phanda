<template>
  <q-page class="game-page">
    <!-- Animated Background -->
    <AnimatedBackground />

    <!-- Compact Header -->
    <GameHeader
      :current-level="currentLevel || undefined"
      :user-progress="userProgress"
      :found-words="foundWords"
      :is-game-ready="isGameReady"
      :is-processing-hint="isProcessingHint"
      @back="goBack"
      @use-hint="useHint"
      @show-theme-selector="showThemeSelector = true"
    />

    <!-- Main Game Area -->
    <GameArena
      :current-level="currentLevel"
      :found-words="foundWords"
      :shuffled-letters="shuffledLetters"
      :connected-letter-indices="connectedLetterIndices"
      :current-word="currentWord"
      :is-hint-reveal="isHintReveal"
      :is-shuffling="isShuffling"
      @letter-selection="handleLetterSelection"
      @word-submitted="handleWordSubmission"
      @letters-cleared="handleLettersClear"
      @shuffle-letters="shuffleLetters"
    />

    <!-- Success Celebration -->
    <SuccessDialog
      v-model="showSuccessDialog"
      :current-level="currentLevel"
      @complete="handleLevelComplete"
    />

    <!-- Word Found Animation -->
    <WordFoundDialog v-model="showWordFoundDialog" :last-found-word="lastFoundWord" />

    <!-- Hint Result Dialog -->
    <HintResultDialog v-model="showHintResult" :revealed-word="revealedWord" />

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
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Import all the extracted components
import AnimatedBackground from '../components/GamePage/AnimatedBackground.vue';
import GameHeader from '../components/GamePage/GameHeader.vue';
import GameArena from '../components/GamePage/GameArena.vue';
import SuccessDialog from '../components/GamePage/SuccessDialog.vue';
import WordFoundDialog from '../components/GamePage/WordFoundDialog.vue';
import HintResultDialog from '../components/GamePage/HintResultDialog.vue';
import ThemeSelector from '../components/ThemeSelector.vue';

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
const isHintReveal = ref(false);
const isProcessingHint = ref(false);
const isShuffling = ref(false);

// Computed properties
const availableHints = computed(() => {
  if (!currentLevel) return [];
  return currentLevel.targetWords.filter((word: string) => !foundWords.includes(word));
});

const canUseHint = computed(() => userProgress.gems >= 5);

const isGameReady = computed(() => {
  return !!(
    currentLevel &&
    currentLevel.targetWords &&
    currentLevel.targetWords.length > 0 &&
    shuffledLetters.value.length > 0
  );
});

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
  // Prevent rapid clicks
  if (isProcessingHint.value) {
    console.log('Hint already being processed');
    return;
  }

  // Ensure level is loaded and has words
  if (!currentLevel || !currentLevel.targetWords || currentLevel.targetWords.length === 0) {
    console.warn('Cannot use hint: level not loaded or no target words');
    return;
  }

  if (!canUseHint.value || availableHints.value.length === 0) {
    return;
  }

  // Set processing flag
  isProcessingHint.value = true;

  // Deduct gems
  userProgress.gems -= 5;

  // Get random unrevealed word
  const randomWord = availableHints.value[Math.floor(Math.random() * availableHints.value.length)];

  // Check if randomWord exists (TypeScript safety)
  if (!randomWord) {
    console.error('No available hints found');
    // Refund gems if hint failed
    userProgress.gems += 5;
    return;
  }

  // Mark this as a hint reveal to prevent animation conflicts
  isHintReveal.value = true;

  // Add word to found words
  gameStore.addFoundWord(randomWord);
  revealedWord.value = randomWord;

  // Only show hint result if we have a valid word
  if (revealedWord.value && revealedWord.value.length > 0) {
    // Small delay to ensure all state updates are complete before showing dialog
    await new Promise((resolve) => setTimeout(resolve, 50));
    showHintResult.value = true;
  } else {
    console.error('Cannot show hint dialog: no word to reveal');
    // Refund gems if dialog can't be shown
    userProgress.gems += 5;
    isHintReveal.value = false;
    isProcessingHint.value = false;
    return;
  }

  // Trigger haptic feedback
  await triggerHapticFeedback(ImpactStyle.Medium);

  // Hide hint result after 2 seconds
  setTimeout(() => {
    showHintResult.value = false;
    // Reset flags after animation completes
    setTimeout(() => {
      isHintReveal.value = false;
      isProcessingHint.value = false;
    }, 300);
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
  // Prevent rapid clicks
  if (isShuffling.value) {
    console.log('Shuffle already in progress');
    return;
  }

  isShuffling.value = true;

  await triggerHapticFeedback(ImpactStyle.Light);
  if (currentLevel) {
    // Use nextTick to ensure smooth transition
    const newOrder = shuffleArray(currentLevel.letters);

    // Small delay to prevent flash
    await new Promise((resolve) => setTimeout(resolve, 10));
    shuffledLetters.value = newOrder;

    // Reset flag after animation completes (300ms transition)
    setTimeout(() => {
      isShuffling.value = false;
    }, 350);
  } else {
    isShuffling.value = false;
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
}

/* iOS safe area adjustments */
@supports (padding: env(safe-area-inset-top)) {
  .game-page {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
