<template>
  <div class="crossword-grid">
    <div class="grid-container" :style="gridContainerStyle">
      <div
        v-for="cell in optimizedCells"
        :key="cell.id"
        class="crossword-cell"
        :class="{
          'cell-revealed': cell.isRevealed,
          'cell-intersection': cell.isIntersection,
          'cell-animated': animatedCells.includes(cell.id),
          'cell-word-complete': cell.isWordComplete,
        }"
        :style="cell.position"
      >
        <div class="cell-content">
          <div v-if="cell.number" class="cell-number">{{ cell.number }}</div>
          <div class="cell-letter" :class="{ 'letter-revealed': cell.isRevealed }">
            {{ cell.isRevealed ? cell.letter : '' }}
          </div>
          <div v-if="cell.isIntersection" class="intersection-glow"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Props {
  targetWords: string[];
  foundWords: string[];
}

interface OptimizedCell {
  id: string;
  letter: string;
  isRevealed: boolean;
  isIntersection: boolean;
  isWordComplete: boolean;
  wordIds: number[];
  position: {
    gridRow?: number;
    gridColumn?: number;
    '--grid-row'?: number;
    '--grid-column'?: number;
    transform?: string;
  };
  number?: number;
}

interface WordLayout {
  word: string;
  direction: 'horizontal' | 'vertical';
  startRow: number;
  startCol: number;
  cells: OptimizedCell[];
}

const props = defineProps<Props>();
const animatedCells = ref<string[]>([]);

// Create optimized crossword layout
const optimizedCells = computed(() => {
  if (!props.targetWords || props.targetWords.length === 0) return [];

  const words = [...props.targetWords];
  const wordLayouts: WordLayout[] = [];
  const cellMap = new Map<string, OptimizedCell>();

  // Smart word placement algorithm
  const findBestIntersection = (word: string | undefined, placedLayouts: WordLayout[]) => {
    if (!word) return null;
    for (const layout of placedLayouts) {
      for (let i = 0; i < word.length; i++) {
        for (let j = 0; j < layout.word.length; j++) {
          if (word[i] === layout.word[j]) {
            return {
              wordIndex: i,
              layoutIndex: j,
              layout,
              char: word[i],
            };
          }
        }
      }
    }
    return null;
  };

  // Place first word horizontally at center
  if (words[0]) {
    const firstWord = words[0];
    const layout: WordLayout = {
      word: firstWord,
      direction: 'horizontal',
      startRow: 3,
      startCol: 1,
      cells: [],
    };

    for (let i = 0; i < firstWord.length; i++) {
      const cellId = `${layout.startRow}-${layout.startCol + i}`;
      const cell: OptimizedCell = {
        id: cellId,
        letter: firstWord[i] || '',
        isRevealed: props.foundWords.includes(firstWord),
        isIntersection: false,
        isWordComplete: props.foundWords.includes(firstWord),
        wordIds: [0],
        position: {
          '--grid-row': layout.startRow,
          '--grid-column': layout.startCol + i,
          gridRow: layout.startRow,
          gridColumn: layout.startCol + i,
        },
        ...(i === 0 && { number: 1 }),
      };

      layout.cells.push(cell);
      cellMap.set(cellId, cell);
    }

    wordLayouts.push(layout);
  }

  // Place remaining words with intersections
  for (let wordIndex = 1; wordIndex < words.length; wordIndex++) {
    const word = words[wordIndex];
    if (!word) continue;
    const intersection = findBestIntersection(word, wordLayouts);

    if (intersection) {
      const { wordIndex: wIdx, layoutIndex: lIdx, layout } = intersection;
      const direction = layout.direction === 'horizontal' ? 'vertical' : 'horizontal';

      let startRow, startCol;
      if (direction === 'vertical') {
        startRow = layout.startRow - wIdx;
        startCol = layout.startCol + lIdx;
      } else {
        startRow = layout.startRow + lIdx;
        startCol = layout.startCol - wIdx;
      }

      const newLayout: WordLayout = {
        word,
        direction,
        startRow,
        startCol,
        cells: [],
      };

      for (let i = 0; i < word.length; i++) {
        const row = direction === 'horizontal' ? startRow : startRow + i;
        const col = direction === 'horizontal' ? startCol + i : startCol;
        const cellId = `${row}-${col}`;

        let cell = cellMap.get(cellId);
        if (cell) {
          // This is an intersection
          cell.isIntersection = true;
          cell.wordIds.push(wordIndex);
          if (props.foundWords.includes(word)) {
            cell.isRevealed = true;
            cell.isWordComplete = true;
          }
        } else {
          // New cell
          cell = {
            id: cellId,
            letter: word[i] || '',
            isRevealed: props.foundWords.includes(word),
            isIntersection: false,
            isWordComplete: props.foundWords.includes(word),
            wordIds: [wordIndex],
            position: {
              '--grid-row': row,
              '--grid-column': col,
              gridRow: row,
              gridColumn: col,
            },
            ...(i === 0 && { number: wordIndex + 1 }),
          };
          cellMap.set(cellId, cell);
        }

        if (cell) {
          newLayout.cells.push(cell);
        }
      }

      wordLayouts.push(newLayout);
    } else {
      // Place word separately if no intersection found
      const direction = wordIndex % 2 === 0 ? 'horizontal' : 'vertical';
      const offset = Math.floor(wordIndex / 2) * 2;

      const layout: WordLayout = {
        word,
        direction,
        startRow: direction === 'horizontal' ? 1 + offset : 1,
        startCol: direction === 'horizontal' ? 1 : 5 + offset,
        cells: [],
      };

      for (let i = 0; i < word.length; i++) {
        const row = direction === 'horizontal' ? layout.startRow : layout.startRow + i;
        const col = direction === 'horizontal' ? layout.startCol + i : layout.startCol;
        const cellId = `${row}-${col}`;

        const cell: OptimizedCell = {
          id: cellId,
          letter: word[i] || '',
          isRevealed: props.foundWords.includes(word),
          isIntersection: false,
          isWordComplete: props.foundWords.includes(word),
          wordIds: [wordIndex],
          position: {
            '--grid-row': row,
            '--grid-column': col,
            gridRow: row,
            gridColumn: col,
          },
          ...(i === 0 && { number: wordIndex + 1 }),
        };

        layout.cells.push(cell);
        cellMap.set(cellId, cell);
      }

      wordLayouts.push(layout);
    }
  }

  return Array.from(cellMap.values());
});

// Dynamic grid container style
const gridContainerStyle = computed(() => {
  const cells = optimizedCells.value;
  if (cells.length === 0) return {};

  // Calculate grid bounds
  const minRow = Math.min(...cells.map((c) => c.position.gridRow || c.position['--grid-row'] || 1));
  const maxRow = Math.max(...cells.map((c) => c.position.gridRow || c.position['--grid-row'] || 1));
  const minCol = Math.min(
    ...cells.map((c) => c.position.gridColumn || c.position['--grid-column'] || 1),
  );
  const maxCol = Math.max(
    ...cells.map((c) => c.position.gridColumn || c.position['--grid-column'] || 1),
  );

  const gridRows = maxRow - minRow + 1;
  const gridCols = maxCol - minCol + 1;

  // Dynamic cell sizing based on grid dimensions
  const maxDimension = Math.max(gridRows, gridCols);

  // Base cell size calculation
  let baseCellSize = 50;
  if (maxDimension > 6) baseCellSize = 45;
  if (maxDimension > 8) baseCellSize = 40;
  if (maxDimension > 10) baseCellSize = 35;
  if (maxDimension > 12) baseCellSize = 30;

  // Calculate responsive cell size
  // This ensures the grid fits within the viewport
  const maxWidth = `min(${baseCellSize}px, calc((85vw - 50px) / ${gridCols}))`;
  const maxHeight = `min(${baseCellSize}px, calc((35vh - 60px) / ${gridRows}))`;
  const cellSize = `min(${maxWidth}, ${maxHeight})`;

  return {
    '--cell-size': cellSize,
    '--grid-rows': gridRows,
    '--grid-cols': gridCols,
    '--min-row': minRow,
    '--min-col': minCol,
  };
});

const animateWordReveal = (word: string) => {
  const wordIndex = props.targetWords.indexOf(word);
  if (wordIndex === -1) return;

  // Find all cells for this word and animate them with stagger
  const wordCells = optimizedCells.value.filter((cell) => cell.wordIds.includes(wordIndex));

  wordCells.forEach((cell, index) => {
    setTimeout(() => {
      animatedCells.value.push(cell.id);

      setTimeout(() => {
        animatedCells.value = animatedCells.value.filter((id) => id !== cell.id);
      }, 600);
    }, index * 60); // Faster, smoother staggered animation
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
  align-items: center;
  justify-content: center;
  padding: 10px;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  overflow: auto;
}

.grid-container {
  position: relative;
  display: grid;
  grid-template-rows: repeat(var(--grid-rows, 8), var(--cell-size, 50px));
  grid-template-columns: repeat(var(--grid-cols, 8), var(--cell-size, 50px));
  gap: clamp(2px, 0.5vw, 3px);
  padding: clamp(15px, 3vw, 25px);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  margin: auto;
  max-width: 100%;
}

.crossword-cell {
  position: relative;
  width: var(--cell-size, 50px);
  height: var(--cell-size, 50px);
  grid-row: calc(var(--grid-row, 1) - var(--min-row, 0) + 1);
  grid-column: calc(var(--grid-column, 1) - var(--min-col, 0) + 1);
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
  overflow: hidden;
}

.crossword-cell::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.crossword-cell:hover::before {
  opacity: 1;
}

.cell-revealed {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.9), rgba(56, 142, 60, 0.8));
  border-color: rgba(76, 175, 80, 0.8);
  box-shadow:
    0 4px 20px rgba(76, 175, 80, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transform: scale(1.02);
}

.cell-intersection {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.9), rgba(255, 152, 0, 0.8));
  border-color: rgba(255, 193, 7, 0.8);
  box-shadow:
    0 4px 20px rgba(255, 193, 7, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.cell-word-complete {
  animation: wordComplete 0.6s ease-out;
}

.cell-animated {
  animation: cellReveal 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
  transition: all 0.3s ease;
}

.cell-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.cell-letter {
  font-size: calc(var(--cell-size, 50px) * 0.45);
  font-weight: 700;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.letter-revealed {
  color: white;
  font-size: calc(var(--cell-size, 50px) * 0.5);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  animation: letterAppear 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.cell-number {
  position: absolute;
  top: 3px;
  left: 3px;
  font-size: calc(var(--cell-size, 50px) * 0.2);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.2));
  border-radius: 50%;
  width: calc(var(--cell-size, 50px) * 0.28);
  height: calc(var(--cell-size, 50px) * 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 3;
}

.intersection-glow {
  position: absolute;
  inset: -2px;
  background: radial-gradient(circle, rgba(255, 193, 7, 0.3), transparent 70%);
  border-radius: 50%;
  animation: intersectionPulse 2s infinite ease-in-out;
  z-index: 1;
}

@keyframes cellReveal {
  0% {
    transform: scale(0.8);
    opacity: 0;
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.3), rgba(56, 142, 60, 0.2));
  }
  40% {
    transform: scale(1.05);
    opacity: 0.7;
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.6), rgba(56, 142, 60, 0.5));
  }
  100% {
    transform: scale(1.02);
    opacity: 1;
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.9), rgba(56, 142, 60, 0.8));
  }
}

@keyframes letterAppear {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes wordComplete {
  0% {
    box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
  }
  50% {
    box-shadow: 0 8px 40px rgba(76, 175, 80, 0.6);
    transform: scale(1.05);
  }
  100% {
    box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
    transform: scale(1.02);
  }
}

@keyframes intersectionPulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

@media (max-width: 480px) {
  .grid-container {
    padding: 15px;
    gap: 2px;
  }

  .crossword-cell {
    border-radius: 8px;
  }

  .cell-letter {
    font-size: calc(var(--cell-size, 50px) * 0.4);
  }
  /* Additional responsive improvements */
  .crossword-grid {
    width: 100%;
    max-width: 100%;
    overflow: auto;
  }

  .grid-container {
    margin: auto;
    max-width: 100%;
  }

  /* Ensure grid fits in viewport */
  @media (max-width: 768px) {
    .grid-container {
      max-width: calc(100vw - 40px);
    }

    .crossword-grid {
      padding: 5px;
    }
  }

  @media (max-height: 600px) {
    .grid-container {
      max-height: calc(100vh - 200px);
      overflow: auto;
    }
  }

  /* Landscape mode adjustments */
  @media (orientation: landscape) and (max-height: 500px) {
    .grid-container {
      max-height: calc(100vh - 150px);
    }
  }

  .letter-revealed {
    font-size: calc(var(--cell-size, 50px) * 0.45);
  }

  .cell-number {
    font-size: calc(var(--cell-size, 50px) * 0.18);
    width: calc(var(--cell-size, 50px) * 0.25);
    height: calc(var(--cell-size, 50px) * 0.25);
  }
}
</style>
