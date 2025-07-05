<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    class="success-dialog"
  >
    <q-card class="success-card glass-morphism">
      <div class="celebration-bg">
        <div class="confetti" v-for="n in 20" :key="n" :style="getConfettiStyle(n)"></div>
        <div class="success-rays">
          <div v-for="n in 8" :key="n" class="ray" :style="`transform: rotate(${n * 45}deg)`"></div>
        </div>
      </div>

      <q-card-section class="success-content">
        <div class="success-icon-container">
          <q-icon name="celebration" size="80px" color="amber" class="success-icon" />
          <div class="icon-rings">
            <div
              v-for="n in 3"
              :key="n"
              class="success-ring"
              :style="`animation-delay: ${n * 0.2}s`"
            ></div>
          </div>
        </div>

        <h2 class="success-title">Level Complete!</h2>
        <p class="success-message">
          Amazing! You found all {{ currentLevel?.targetWords.length }} words!
        </p>

        <div class="rewards-showcase">
          <div class="reward-item">
            <div class="reward-icon">
              <q-icon name="diamond" color="cyan" size="30px" />
              <div class="reward-sparkle"></div>
            </div>
            <div class="reward-text">+50 Gems</div>
          </div>
          <div class="reward-item">
            <div class="reward-icon">
              <q-icon name="stars" color="amber" size="30px" />
              <div class="reward-sparkle"></div>
            </div>
            <div class="reward-text">+3 Stars</div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="success-actions">
        <q-btn
          push
          color="primary"
          size="lg"
          icon="arrow_forward"
          label="Continue Adventure"
          @click="$emit('complete')"
          class="continue-btn interactive-button"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type { GameLevel } from 'src/stores/game-store';

interface Props {
  modelValue: boolean;
  currentLevel: GameLevel | null;
}

defineProps<Props>();

defineEmits<{
  'update:modelValue': [value: boolean];
  complete: [];
}>();

const getConfettiStyle = (index: number) => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
  const randomColor = colors[index % colors.length];
  const randomLeft = Math.random() * 100;
  const randomDelay = Math.random() * 2;

  return `
    left: ${randomLeft}%;
    background: ${randomColor};
    animation-delay: ${randomDelay}s;
  `;
};
</script>

<style scoped>
/* Success Dialog */
.success-dialog :deep(.q-dialog__inner) {
  padding: 20px;
}

.success-card {
  max-width: 400px;
  overflow: hidden;
  position: relative;
}

/* Celebration Background */
.celebration-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  top: -10px;
  animation: confetti-fall 3s linear infinite;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(400px) rotate(720deg);
    opacity: 0;
  }
}

.success-rays {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
}

.ray {
  position: absolute;
  width: 2px;
  height: 100px;
  background: linear-gradient(to bottom, transparent, rgba(251, 191, 36, 0.3), transparent);
  top: 50%;
  left: 50%;
  transform-origin: bottom;
  animation: ray-spin 4s linear infinite;
}

@keyframes ray-spin {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* Success Content */
.success-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 40px 20px;
}

.success-icon-container {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.success-icon {
  animation: success-bounce 0.6s ease;
}

@keyframes success-bounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.icon-rings {
  position: absolute;
  inset: -20px;
  pointer-events: none;
}

.success-ring {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(251, 191, 36, 0.3);
  border-radius: 50%;
  animation: ring-expand 1.5s ease-out infinite;
}

@keyframes ring-expand {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.success-title {
  color: white;
  font-size: 28px;
  margin: 0 0 10px 0;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.success-message {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  margin: 0 0 30px 0;
}

/* Rewards Showcase */
.rewards-showcase {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 20px;
}

.reward-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.reward-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: reward-pulse 2s ease-in-out infinite;
}

@keyframes reward-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.reward-sparkle {
  position: absolute;
  inset: -10px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  filter: blur(10px);
  animation: sparkle-rotate 3s linear infinite;
}

@keyframes sparkle-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.reward-text {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

/* Success Actions */
.success-actions {
  position: relative;
  z-index: 1;
  justify-content: center;
  padding: 20px;
}

.continue-btn {
  min-width: 200px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Glass Morphism */
.glass-morphism {
  backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.interactive-button {
  transition: all 0.3s ease;
}

.interactive-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}
</style>
