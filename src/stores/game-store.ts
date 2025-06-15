import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface GameLevel {
  id: number
  name: string
  letters: string[]
  crosswordGrid: CrosswordCell[][]
  targetWords: string[]
  isUnlocked: boolean
  isCompleted: boolean
  stars: number
  landmark: string
}

export interface CrosswordCell {
  letter: string | null
  isRevealed: boolean
  wordIndex: number
  cellIndex: number
}

export interface UserProgress {
  currentLevel: number
  gems: number
  totalStars: number
  completedLevels: number[]
  hintsUsed: number
}

export const useGameStore = defineStore('game', () => {
  // User state
  const userProgress = ref<UserProgress>({
    currentLevel: 1,
    gems: 100,
    totalStars: 0,
    completedLevels: [],
    hintsUsed: 0
  })

  // Game state
  const currentLevel = ref<GameLevel | null>(null)
  const selectedLetters = ref<string[]>([])
  const connectedLetterIndices = ref<number[]>([])
  const foundWords = ref<string[]>([])
  const isGameActive = ref(false)
  const isAuthenticated = ref(false)

  // Computed properties
  const currentLevelProgress = computed(() => {
    if (!currentLevel.value) return 0
    return (foundWords.value.length / currentLevel.value.targetWords.length) * 100
  })

  const canUseHint = computed(() => userProgress.value.gems >= 20)

  // Actions
  const authenticateUser = () => {
    isAuthenticated.value = true
  }

  const setCurrentLevel = (level: GameLevel) => {
    currentLevel.value = level
    selectedLetters.value = []
    connectedLetterIndices.value = []
    foundWords.value = []
    isGameActive.value = true
  }

  const addFoundWord = (word: string) => {
    if (!foundWords.value.includes(word)) {
      foundWords.value.push(word)
      userProgress.value.gems += 5
    }
  }

  const useHint = () => {
    if (canUseHint.value) {
      userProgress.value.gems -= 20
      userProgress.value.hintsUsed++
      return true
    }
    return false
  }

  const completeLevel = () => {
    if (currentLevel.value) {
      const levelId = currentLevel.value.id
      if (!userProgress.value.completedLevels.includes(levelId)) {
        userProgress.value.completedLevels.push(levelId)
        userProgress.value.gems += 50
        userProgress.value.totalStars += 3
      }
      userProgress.value.currentLevel = Math.max(userProgress.value.currentLevel, levelId + 1)
    }
  }

  const resetGame = () => {
    selectedLetters.value = []
    connectedLetterIndices.value = []
    isGameActive.value = false
  }

  const saveProgress = () => {
    localStorage.setItem('phanda-progress', JSON.stringify(userProgress.value))
  }

  const loadProgress = () => {
    const saved = localStorage.getItem('phanda-progress')
    if (saved) {
      userProgress.value = JSON.parse(saved)
    }
  }

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
    currentLevelProgress,
    canUseHint,
    
    // Actions
    authenticateUser,
    setCurrentLevel,
    addFoundWord,
    useHint,
    completeLevel,
    resetGame,
    saveProgress,
    loadProgress
  }
})