<template>
  <div class="game-header glass-morphism">
    <q-btn
      flat
      round
      icon="arrow_back"
      color="white"
      size="md"
      @click="$emit('back')"
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
        @click="$emit('use-hint')"
        :disable="
          !props.isGameReady || !canUseHint || availableHints.length === 0 || props.isProcessingHint
        "
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
        @click="$emit('show-theme-selector')"
        class="header-btn pulse-on-hover"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { GameLevel, UserProgress } from 'src/stores/game-store';

interface Props {
  currentLevel: GameLevel | undefined;
  userProgress: UserProgress;
  foundWords: string[];
  isGameReady?: boolean;
  isProcessingHint?: boolean;
}

const props = defineProps<Props>();

defineEmits<{
  back: [];
  'use-hint': [];
  'show-theme-selector': [];
}>();

const availableHints = computed(() => {
  if (!props.currentLevel) return [];
  return props.currentLevel.targetWords.filter((word: string) => !props.foundWords.includes(word));
});

const canUseHint = computed(() => props.userProgress.gems >= 5);
</script>

<style scoped>
/* Game Header */
.game-header {
  position: fixed;
  top: env(safe-area-inset-top, 0);
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  z-index: 10;
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.header-btn {
  transition: all 0.3s ease;
}

.header-btn:hover {
  transform: scale(1.1);
}

/* Level Indicator */
.level-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
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
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-fill {
  transition: stroke-dashoffset 0.5s ease;
}

.progress-text {
  font-size: 14px;
  color: white;
  opacity: 0.9;
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.gems-display {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.gems-count {
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.gems-glow {
  position: absolute;
  inset: -2px;
  background: radial-gradient(circle, rgba(0, 255, 255, 0.4) 0%, transparent 70%);
  filter: blur(10px);
  animation: glow-pulse 2s infinite;
  z-index: -1;
}

.hint-btn {
  transition: all 0.3s ease;
}

.hint-btn.hint-available {
  animation: hint-pulse 2s infinite;
}

@keyframes hint-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

@keyframes glow-pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
}

/* Glass Effects */
.glass-morphism {
  backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.glass-pill {
  border-radius: 20px;
}

.pulse-on-hover {
  transition: transform 0.2s ease;
}

.pulse-on-hover:hover {
  transform: scale(1.1);
}

.custom-tooltip {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
}
</style>
