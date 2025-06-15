import type { GameLevel } from './game-store'

export const GAME_LEVELS: GameLevel[] = [
  {
    id: 1,
    name: "Egypt - Great Pyramid",
    letters: ['C', 'A', 'T', 'R'],
    crosswordGrid: [
      [
        { letter: null, isRevealed: false, wordIndex: 0, cellIndex: 0 },
        { letter: null, isRevealed: false, wordIndex: 0, cellIndex: 1 },
        { letter: null, isRevealed: false, wordIndex: 0, cellIndex: 2 }
      ],
      [
        { letter: null, isRevealed: false, wordIndex: 1, cellIndex: 0 },
        { letter: null, isRevealed: false, wordIndex: 1, cellIndex: 1 },
        { letter: null, isRevealed: false, wordIndex: 1, cellIndex: 2 },
        { letter: null, isRevealed: false, wordIndex: 1, cellIndex: 3 }
      ]
    ],
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
    crosswordGrid: [
      [
        { letter: null, isRevealed: false, wordIndex: 0, cellIndex: 0 },
        { letter: null, isRevealed: false, wordIndex: 0, cellIndex: 1 },
        { letter: null, isRevealed: false, wordIndex: 0, cellIndex: 2 },
        { letter: null, isRevealed: false, wordIndex: 0, cellIndex: 3 }
      ],
      [
        { letter: null, isRevealed: false, wordIndex: 1, cellIndex: 0 },
        { letter: null, isRevealed: false, wordIndex: 1, cellIndex: 1 },
        { letter: null, isRevealed: false, wordIndex: 1, cellIndex: 2 }
      ],
      [
        { letter: null, isRevealed: false, wordIndex: 2, cellIndex: 0 },
        { letter: null, isRevealed: false, wordIndex: 2, cellIndex: 1 },
        { letter: null, isRevealed: false, wordIndex: 2, cellIndex: 2 },
        { letter: null, isRevealed: false, wordIndex: 2, cellIndex: 3 },
        { letter: null, isRevealed: false, wordIndex: 2, cellIndex: 4 }
      ]
    ],
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
    crosswordGrid: [
      [
        { letter: null, isRevealed: false, wordIndex: 0, cellIndex: 0 },
        { letter: null, isRevealed: false, wordIndex: 0, cellIndex: 1 },
        { letter: null, isRevealed: false, wordIndex: 0, cellIndex: 2 }
      ],
      [
        { letter: null, isRevealed: false, wordIndex: 1, cellIndex: 0 },
        { letter: null, isRevealed: false, wordIndex: 1, cellIndex: 1 },
        { letter: null, isRevealed: false, wordIndex: 1, cellIndex: 2 },
        { letter: null, isRevealed: false, wordIndex: 1, cellIndex: 3 }
      ],
      [
        { letter: null, isRevealed: false, wordIndex: 2, cellIndex: 0 },
        { letter: null, isRevealed: false, wordIndex: 2, cellIndex: 1 },
        { letter: null, isRevealed: false, wordIndex: 2, cellIndex: 2 },
        { letter: null, isRevealed: false, wordIndex: 2, cellIndex: 3 },
        { letter: null, isRevealed: false, wordIndex: 2, cellIndex: 4 }
      ]
    ],
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