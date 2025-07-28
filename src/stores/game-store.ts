import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { languageApi, levelApi, progressApi } from '../services/api';
import type { Language, Level, UserProgress } from '../services/api';

// Re-export types for convenience
export type { UserProgress };
import { useAuthStore } from './auth-store';

export interface GameLevel {
  id: number;
  languageId: string;
  name: string;
  letters: string[];
  crosswordGrid: CrosswordCell[][];
  targetWords: string[];
  isUnlocked: boolean;
  isCompleted: boolean;
  stars: number;
  landmark: string;
  orderIndex: number;
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
  hintsUsed: number;
}

export interface LocalUserProgress {
  gems: number;
  hintsUsed: number;
  languages: Record<string, LanguageProgress>;
  selectedLanguage: string;
}

export const useGameStore = defineStore('game', () => {
  // Get auth store
  const authStore = useAuthStore();

  // User state - local progress for offline support
  const userProgress = ref<LocalUserProgress>({
    gems: 100,
    hintsUsed: 0,
    selectedLanguage: 'english',
    languages: {
      english: {
        currentLevel: 1,
        completedLevels: [],
        totalStars: 0,
        hintsUsed: 0,
      },
    },
  });

  // API data state
  const languages = ref<Language[]>([]);
  const levels = ref<Level[]>([]);
  const apiProgress = ref<UserProgress[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Game state
  const currentLevel = ref<GameLevel | null>(null);
  const selectedLetters = ref<string[]>([]);
  const connectedLetterIndices = ref<number[]>([]);
  const foundWords = ref<string[]>([]);
  const isGameActive = ref(false);
  const isAuthenticated = ref(false);

  // Computed properties
  const currentLanguageProgress = computed(() => {
    const selectedLang = userProgress.value.selectedLanguage;
    const progress = userProgress.value.languages[selectedLang];

    const fallbackProgress = {
      currentLevel: 1,
      completedLevels: [],
      totalStars: 0,
      hintsUsed: 0,
    };

    const finalProgress = progress ?? fallbackProgress;

    console.log('Current language progress computed:', selectedLang, finalProgress);
    return finalProgress;
  });

  const totalStars = computed(() => {
    return Object.values(userProgress.value.languages).reduce(
      (total, lang) => total + lang.totalStars,
      0
    );
  });

  const totalCompletedLevels = computed(() => {
    return Object.values(userProgress.value.languages).reduce(
      (total, lang) => total + lang.completedLevels.length,
      0
    );
  });

  const currentLevelProgress = computed(() => {
    if (!currentLevel.value) return 0;
    return (foundWords.value.length / currentLevel.value.targetWords.length) * 100;
  });

  const canUseHint = computed(() => userProgress.value.gems >= 20);

  // API Actions
  const loadLanguages = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      languages.value = await languageApi.getAll();
      console.log('Loaded languages:', languages.value);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load languages';
      error.value = errorMessage;
      console.error('Failed to load languages:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const loadLevels = async (languageId?: string) => {
    try {
      isLoading.value = true;
      error.value = null;
      levels.value = await levelApi.getByLanguage(languageId);
      console.log('Loaded levels:', levels.value);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load levels';
      error.value = errorMessage;
      console.error('Failed to load levels:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const loadProgress = async () => {
    if (!authStore.isAuthenticated) {
      console.log('User not authenticated, loading local progress');
      loadLocalProgress();
      return;
    }

    try {
      isLoading.value = true;
      error.value = null;
      apiProgress.value = await progressApi.getAll();

      // Sync API progress with local state
      syncProgressFromAPI();

      console.log('Loaded progress from API:', apiProgress.value);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load progress';
      error.value = errorMessage;
      console.error('Failed to load progress:', err);
      // Fallback to local progress if API fails
      loadLocalProgress();
    } finally {
      isLoading.value = false;
    }
  };

  const syncProgressFromAPI = () => {
    if (!apiProgress.value.length) return;

    // Convert API progress to local format
    const languageProgressMap: Record<string, LanguageProgress> = {};

    for (const progress of apiProgress.value) {
      languageProgressMap[progress.languageId] = {
        currentLevel: progress.currentLevel,
        completedLevels: progress.completedLevels,
        totalStars: progress.totalStars,
        hintsUsed: progress.hintsUsed,
      };
    }

    // Update local progress with API data
    userProgress.value.languages = languageProgressMap;

    // Get user gems from auth store
    if (authStore.user) {
      userProgress.value.gems = authStore.user.totalGems;
      userProgress.value.hintsUsed = authStore.user.totalHintsUsed;
    }
  };

  const completeLevel = async () => {
    if (!currentLevel.value) return;

    const levelId = currentLevel.value.id;
    const languageId = userProgress.value.selectedLanguage;
    const stars = 3; // Could be calculated based on performance
    const hintsUsed = userProgress.value.hintsUsed;

    if (authStore.isAuthenticated) {
      try {
        // Send to API
        const updatedProgress = await progressApi.completeLevel({
          levelId,
          languageId,
          stars,
          hintsUsed,
        });

        // Update local state with API response
        syncProgressFromAPI();

        console.log('Level completed via API:', updatedProgress);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to complete level';
        error.value = errorMessage;
        console.error('Failed to complete level via API:', err);
        // Fallback to local completion
        completeLevelLocally();
      }
    } else {
      completeLevelLocally();
    }
  };

  const completeLevelLocally = () => {
    if (!currentLevel.value) return;

    const levelId = currentLevel.value.id;
    const language = userProgress.value.selectedLanguage;

    // Ensure language progress exists
    if (!userProgress.value.languages[language]) {
      userProgress.value.languages[language] = {
        currentLevel: 1,
        completedLevels: [],
        totalStars: 0,
        hintsUsed: 0,
      };
    }

    const langProgress = userProgress.value.languages[language];

    if (!langProgress.completedLevels.includes(levelId)) {
      langProgress.completedLevels.push(levelId);
      langProgress.totalStars += 3;
      userProgress.value.gems += 50;
    }

    langProgress.currentLevel = Math.max(langProgress.currentLevel, levelId + 1);
    saveLocalProgress();
  };

  const useHint = async () => {
    if (!canUseHint.value) return false;

    if (authStore.isAuthenticated) {
      try {
        const result = await progressApi.useHint();
        userProgress.value.gems = result.remainingGems;
        userProgress.value.hintsUsed++;

        // Update auth store user data
        if (authStore.user) {
          authStore.updateUser({
            totalGems: result.remainingGems,
            totalHintsUsed: authStore.user.totalHintsUsed + 1,
          });
        }

        console.log('Hint used via API:', result);
        return true;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to use hint';
        error.value = errorMessage;
        console.error('Failed to use hint via API:', err);
        // Fallback to local hint usage
        return useHintLocally();
      }
    } else {
      return useHintLocally();
    }
  };

  const useHintLocally = () => {
    if (!canUseHint.value) return false;

    userProgress.value.gems -= 20;
    userProgress.value.hintsUsed++;
    saveLocalProgress();
    return true;
  };

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
          hintsUsed: 0,
        },
      },
    };
    saveLocalProgress();
  };

  const setSelectedLanguage = (language: string) => {
    console.log(
      'Setting selected language from',
      userProgress.value.selectedLanguage,
      'to',
      language
    );
    userProgress.value.selectedLanguage = language;
    // Safe access to languages object
    const currentLangProgress = userProgress.value.languages[language];
    if (!currentLangProgress) {
      userProgress.value.languages[language] = {
        currentLevel: 1,
        completedLevels: [],
        totalStars: 0,
        hintsUsed: 0,
      };
      console.log('Created new language progress for', language);
    }
    console.log('Selected language is now:', userProgress.value.selectedLanguage);
    console.log('Full user progress:', JSON.stringify(userProgress.value, null, 2));
    saveLocalProgress();
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

  const resetGame = () => {
    selectedLetters.value = [];
    connectedLetterIndices.value = [];
    isGameActive.value = false;
  };

  const updateUserProgress = (updates: Partial<LocalUserProgress>) => {
    userProgress.value = { ...userProgress.value, ...updates };
    saveLocalProgress();
  };

  const saveLocalProgress = () => {
    console.log('Saving local progress:', JSON.stringify(userProgress.value, null, 2));
    localStorage.setItem('phanda-progress', JSON.stringify(userProgress.value));
  };

  const loadLocalProgress = () => {
    const saved = localStorage.getItem('phanda-progress');
    if (saved) {
      const loadedProgress = JSON.parse(saved);
      console.log('Loading local progress:', loadedProgress);
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
              hintsUsed: 0,
            },
          },
        };
      } else {
        userProgress.value = loadedProgress;
      }
      console.log('Final loaded local progress:', userProgress.value);
    }
  };

  // Initialize data when store is created
  const initializeStore = async () => {
    try {
      // Always load languages and levels (public data)
      await Promise.all([loadLanguages(), loadLevels()]);

      // Load progress (API if authenticated, local otherwise)
      await loadProgress();
    } catch (err) {
      console.error('Failed to initialize store:', err);
      // Fallback to local data
      loadLocalProgress();
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

    // API State
    languages,
    levels,
    apiProgress,
    isLoading,
    error,

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
    updateUserProgress,

    // API Actions
    loadLanguages,
    loadLevels,
    loadProgress,
    initializeStore,

    // Local Actions
    saveLocalProgress,
    loadLocalProgress,
  };
});
