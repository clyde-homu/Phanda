<template>
  <div class="crossword-grid">
    <div class="grid-container">
      <div v-for="(row, rowIndex) in displayGrid" :key="rowIndex" class="grid-row">
        <div
          v-for="(cell, colIndex) in row"
          :key="colIndex"
          class="grid-cell"
          :class="{
            'cell-filled': cell.letter,
            'cell-revealed': cell.isRevealed,
            'cell-animated': animatedCells.includes(`${rowIndex}-${colIndex}`),
            'cell-empty': !cell.letter && !cell.isPlaceholder,
          }"
        >
          <div class="cell-content">
            <span v-if="cell.letter" class="cell-letter">{{ cell.letter }}</span>
            <div v-if="cell.number" class="cell-number">{{ cell.number }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { CrosswordCell } from '../stores/game-store';

interface Props {
  grid: CrosswordCell[][];
  targetWords: string[];
  foundWords: string[];
}

interface DisplayCell extends CrosswordCell {
  isPlaceholder?: boolean;
  number?: number | undefined;
}

const props = defineProps<Props>();

const animatedCells = ref<string[]>([]);

const displayGrid = computed(() => {
  if (!props.grid || props.grid.length === 0) return [];

  // Create a larger grid to accommodate all words properly
  const maxRows = Math.max(props.grid.length, 6);
  const maxCols = Math.max(...props.grid.map((row) => row.length), 8);

  const grid: DisplayCell[][] = Array(maxRows)
    .fill(null)
    .map(() =>
      Array(maxCols)
        .fill(null)
        .map(() => ({
          letter: null,
          isRevealed: false,
          wordIndex: -1,
          cellIndex: -1,
          isPlaceholder: true,
        })),
    );

  // Place words in the grid
  props.targetWords.forEach((word, wordIndex) => {
    const isFound = props.foundWords.includes(word);

    if (wordIndex === 0) {
      // First word - horizontal
      const startRow = 1;
      const startCol = 1;
      for (let i = 0; i < word.length; i++) {
        const targetCol = startCol + i;
        if (targetCol < maxCols && grid[startRow] && grid[startRow][targetCol]) {
          grid[startRow][targetCol] = {
            letter: isFound ? (word[i] ?? null) : null,
            isRevealed: isFound,
            wordIndex,
            cellIndex: i,
            isPlaceholder: false,
            number: i === 0 ? wordIndex + 1 : undefined,
          };
        }
      }
    } else if (wordIndex === 1) {
      // Second word - vertical, intersecting with first
      const startRow = 0;
      const startCol = 2;
      for (let i = 0; i < word.length; i++) {
        const targetRow = startRow + i;
        if (targetRow < maxRows && grid[targetRow] && grid[targetRow][startCol]) {
          grid[targetRow][startCol] = {
            letter: isFound ? (word[i] ?? null) : null,
            isRevealed: isFound,
            wordIndex,
            cellIndex: i,
            isPlaceholder: false,
            number: i === 0 ? wordIndex + 1 : undefined,
          };
        }
      }
    } else {
      // Additional words - place them in available spots
      const startRow = Math.min(wordIndex, maxRows - 1);
      const startCol = 0;
      for (let i = 0; i < word.length && startCol + i < maxCols; i++) {
        const targetCol = startCol + i;
        if (grid[startRow] && grid[startRow][targetCol]) {
          grid[startRow][targetCol] = {
            letter: isFound ? (word[i] ?? null) : null,
            isRevealed: isFound,
            wordIndex,
            cellIndex: i,
            isPlaceholder: false,
            number: i === 0 ? wordIndex + 1 : undefined,
          };
        }
      }
    }
  });

  return grid;
});

const animateWordReveal = (word: string) => {
  const wordIndex = props.targetWords.indexOf(word);
  if (wordIndex === -1) return;

  // Find all cells for this word and animate them
  displayGrid.value.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell.wordIndex === wordIndex) {
        const cellKey = `${rowIndex}-${colIndex}`;
        animatedCells.value.push(cellKey);

        setTimeout(() => {
          animatedCells.value = animatedCells.value.filter((key) => key !== cellKey);
        }, 600);
      }
    });
  });
};

watch(
  () => props.foundWords,
  (newFoundWords, oldFoundWords) => {
    // Animate newly found words
    const newWords = newFoundWords.filter((word) => !oldFoundWords?.includes(word));
    newWords.forEach((word) => {
      setTimeout(() => animateWordReveal(word), 100);
    });
  },
  { deep: true },
);
</script>

<style scoped>
.crossword-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 400px;
  margin: 0 auto;
}

.grid-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 12px;
}

.grid-row {
  display: flex;
  gap: 2px;
}

.grid-cell {
  position: relative;
  width: 35px;
  height: 35px;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.cell-empty {
  background: transparent;
  border: none;
}

.cell-filled {
  background: white;
  border-color: #333;
}

.cell-revealed {
  background: linear-gradient(45deg, #e8f5e8, #c8e6c9);
  border-color: #4caf50;
  color: #2e7d32;
}

.cell-animated {
  animation: cellReveal 0.6s ease-out;
}

.cell-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell-letter {
  font-size: 1rem;
  font-weight: bold;
  text-transform: uppercase;
}

.cell-number {
  position: absolute;
  top: 2px;
  left: 2px;
  font-size: 0.6rem;
  font-weight: bold;
  color: #666;
  line-height: 1;
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.word-clues {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.clues-title {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.1rem;
  text-align: center;
}

.clues-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.clue-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: #f9f9f9;
}

.clue-found {
  background: linear-gradient(45deg, #e8f5e8, #c8e6c9);
  border-left: 4px solid #4caf50;
}

.clue-partial {
  background: linear-gradient(45deg, #fff3e0, #ffe0b3);
  border-left: 4px solid #ff9800;
}

.clue-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #42a5f5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  flex-shrink: 0;
}

.clue-found .clue-number {
  background: #4caf50;
}

.clue-content {
  flex: 1;
}

.clue-word {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.clue-length {
  font-size: 0.7rem;
  color: #666;
  margin-top: 2px;
}

.clue-status {
  flex-shrink: 0;
  width: 24px;
  height: 12px;
  position: relative;
}

.progress-indicator {
  height: 4px;
  background: #42a5f5;
  border-radius: 2px;
  transition: width 0.3s ease;
}

@keyframes cellReveal {
  0% {
    transform: scale(0.8);
    background: #fff9c4;
  }
  50% {
    transform: scale(1.1);
    background: #fff176;
  }
  100% {
    transform: scale(1);
    background: linear-gradient(45deg, #e8f5e8, #c8e6c9);
  }
}

@media (max-width: 480px) {
  .crossword-grid {
    max-width: 300px;
  }

  .grid-cell {
    width: 30px;
    height: 30px;
  }

  .cell-letter {
    font-size: 0.9rem;
  }

  .cell-number {
    font-size: 0.5rem;
    width: 10px;
    height: 10px;
  }
}
</style>
