import type { GameLevel } from './game-store'

export const GAME_LEVELS: GameLevel[] = [
  {
    id: 1,
    name: "Egypt - Great Pyramid",
    letters: ['C', 'A', 'T', 'R'],
    crosswordGrid: [],
    targetWords: ['CAT', 'CART'],
    isUnlocked: true,
    isCompleted: false,
    stars: 0,
    landmark: "pyramid.jpg"
  },
  {
    id: 2,
    name: "Paris - Eiffel Tower",
    letters: ['L', 'O', 'V', 'E', 'R'],
    crosswordGrid: [],
    targetWords: ['LOVE', 'ORE', 'LOVER'],
    isUnlocked: false,
    isCompleted: false,
    stars: 0,
    landmark: "eiffel.jpg"
  },
  {
    id: 3,
    name: "Rome - Colosseum",
    letters: ['S', 'U', 'N', 'M', 'O', 'R'],
    crosswordGrid: [],
    targetWords: ['SUN', 'WORN', 'MOURN'],
    isUnlocked: false,
    isCompleted: false,
    stars: 0,
    landmark: "colosseum.jpg"
  }
]

export const getLevel = (id: number): GameLevel | undefined => {
  return GAME_LEVELS.find(level => level.id === id)
}

export const getUnlockedLevels = (completedLevels: number[]): GameLevel[] => {
  return GAME_LEVELS.map(level => ({
    ...level,
    isUnlocked: level.id === 1 || completedLevels.includes(level.id - 1),
    isCompleted: completedLevels.includes(level.id)
  }))
}