import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface GameLevel {
  id: number;
  name: string;
  letters: string[];
  crosswordGrid: CrosswordCell[][];
  targetWords: string[];
  isUnlocked: boolean;
  isCompleted: boolean;
  stars: number;
  landmark: string;
  language: string;
}

export interface CrosswordCell {
  letter: string | null;
  isRevealed: boolean;
  wordIndex: number;
  cellIndex: number;
}

export interface LanguageProgress {
  currentLevel: number;
  completedLevels: number[];
  totalStars: number;
}

export interface UserProgress {
  gems: number;
  hintsUsed: number;
  languages: Record<string, LanguageProgress>;
  selectedLanguage: string;
}

export const useGameStore = defineStore('game', () => {
  // User state
  const userProgress = ref<UserProgress>({
    gems: 100,
    hintsUsed: 0,
    selectedLanguage: 'english',
    languages: {
      english: {
        currentLevel: 1,
        completedLevels: [],
        totalStars: 0,
      },
    },
  });

  // Game state
  const currentLevel = ref<GameLevel | null>(null);
  const selectedLetters = ref<string[]>([]);
  const connectedLetterIndices = ref<number[]>([]);
  const foundWords = ref<string[]>([]);
  const isGameActive = ref(false);
  const isAuthenticated = ref(false);

  // Computed properties
  const currentLanguageProgress = computed(() => {
    const progress = userProgress.value.languages[userProgress.value.selectedLanguage] || {
      currentLevel: 1,
      completedLevels: [],
      totalStars: 0,
    };
    console.log(
      'Current language progress computed:',
      userProgress.value.selectedLanguage,
      progress,
    );
    return progress;
  });

  const totalStars = computed(() => {
    return Object.values(userProgress.value.languages).reduce(
      (total, lang) => total + lang.totalStars,
      0,
    );
  });

  const totalCompletedLevels = computed(() => {
    return Object.values(userProgress.value.languages).reduce(
      (total, lang) => total + lang.completedLevels.length,
      0,
    );
  });

  const currentLevelProgress = computed(() => {
    if (!currentLevel.value) return 0;
    return (foundWords.value.length / currentLevel.value.targetWords.length) * 100;
  });

  const canUseHint = computed(() => userProgress.value.gems >= 20);

  // Actions
  const authenticateUser = () => {
    isAuthenticated.value = true;
  };

  const initializeNewUser = () => {
    userProgress.value = {
      gems: 100,
      hintsUsed: 0,
      selectedLanguage: 'english',
      languages: {
        english: {
          currentLevel: 1,
          completedLevels: [],
          totalStars: 0,
        },
      },
    };
    saveProgress();
  };

  const setSelectedLanguage = (language: string) => {
    console.log(
      'Setting selected language from',
      userProgress.value.selectedLanguage,
      'to',
      language,
    );
    userProgress.value.selectedLanguage = language;
    if (!userProgress.value.languages[language]) {
      userProgress.value.languages[language] = {
        currentLevel: 1,
        completedLevels: [],
        totalStars: 0,
      };
      console.log('Created new language progress for', language);
    }
    console.log('Selected language is now:', userProgress.value.selectedLanguage);
    console.log('Full user progress:', JSON.stringify(userProgress.value, null, 2));
    saveProgress();
  };

  const setCurrentLevel = (level: GameLevel) => {
    currentLevel.value = level;
    selectedLetters.value = [];
    connectedLetterIndices.value = [];
    foundWords.value = [];
    isGameActive.value = true;
  };

  const addFoundWord = (word: string) => {
    if (!foundWords.value.includes(word)) {
      foundWords.value.push(word);
      userProgress.value.gems += 5;
    }
  };

  const useHint = () => {
    if (canUseHint.value) {
      userProgress.value.gems -= 20;
      userProgress.value.hintsUsed++;
      return true;
    }
    return false;
  };

  const completeLevel = () => {
    if (currentLevel.value) {
      const levelId = currentLevel.value.id;
      const language = userProgress.value.selectedLanguage;

      // Ensure language progress exists
      if (!userProgress.value.languages[language]) {
        userProgress.value.languages[language] = {
          currentLevel: 1,
          completedLevels: [],
          totalStars: 0,
        };
      }

      const langProgress = userProgress.value.languages[language];

      if (!langProgress.completedLevels.includes(levelId)) {
        langProgress.completedLevels.push(levelId);
        langProgress.totalStars += 3;
        userProgress.value.gems += 50;
      }
      langProgress.currentLevel = Math.max(langProgress.currentLevel, levelId + 1);
      saveProgress();
    }
  };

  const resetGame = () => {
    selectedLetters.value = [];
    connectedLetterIndices.value = [];
    isGameActive.value = false;
  };

  const saveProgress = () => {
    console.log('Saving progress:', JSON.stringify(userProgress.value, null, 2));
    localStorage.setItem('phanda-progress', JSON.stringify(userProgress.value));
  };

  const loadProgress = () => {
    const saved = localStorage.getItem('phanda-progress');
    if (saved) {
      const loadedProgress = JSON.parse(saved);
      console.log('Loading progress:', loadedProgress);
      // Ensure backward compatibility
      if (loadedProgress.currentLevel !== undefined) {
        // Old format - convert to new format
        userProgress.value = {
          gems: loadedProgress.gems || 100,
          hintsUsed: loadedProgress.hintsUsed || 0,
          selectedLanguage: 'english',
          languages: {
            english: {
              currentLevel: loadedProgress.currentLevel || 1,
              completedLevels: loadedProgress.completedLevels || [],
              totalStars: loadedProgress.totalStars || 0,
            },
          },
        };
      } else {
        userProgress.value = loadedProgress;
      }
      console.log('Final loaded progress:', userProgress.value);
    }
  };

  return {
    // State
    userProgress,
    currentLevel,
    selectedLetters,
    connectedLetterIndices,
    foundWords,
    isGameActive,
    isAuthenticated,

    // Computed
    currentLanguageProgress,
    totalStars,
    totalCompletedLevels,
    currentLevelProgress,
    canUseHint,

    // Actions
    authenticateUser,
    initializeNewUser,
    setSelectedLanguage,
    setCurrentLevel,
    addFoundWord,
    useHint,
    completeLevel,
    resetGame,
    saveProgress,
    loadProgress,
  };
});
