<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    no-backdrop-dismiss
    class="hint-result-dialog"
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card class="hint-result-card glass-morphism">
      <div class="hint-result-bg">
        <div class="hint-particles">
          <div v-for="n in 8" :key="n" class="hint-particle" :style="getHintParticleStyle(n)"></div>
        </div>
      </div>

      <q-card-section class="hint-result-content">
        <div class="hint-result-icon-container">
          <q-icon name="lightbulb" size="50px" color="amber" class="hint-result-icon" />
          <div class="hint-glow-effect"></div>
        </div>
        <div class="hint-result-title">Word Revealed!</div>
        <div class="hint-result-word">{{ revealedWord }}</div>
        <div class="hint-cost-display">
          <q-icon name="diamond" color="cyan" size="20px" />
          <span>-5 Gems</span>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  revealedWord: string;
}

defineProps<Props>();

defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const getHintParticleStyle = (index: number) => {
  const angle = (index * 45) % 360;
  const distance = 30 + (index % 2) * 10;
  const delay = (index * 0.15) % 1;

  return `
    transform: rotate(${angle}deg) translateX(${distance}px);
    animation-delay: ${delay}s;
  `;
};
</script>

<style scoped>
/* Hint Result Dialog */
.hint-result-dialog :deep(.q-dialog__inner) {
  padding: 20px;
}

.hint-result-dialog :deep(.q-dialog__backdrop) {
  background-color: rgba(0, 0, 0, 0.5) !important;
  backdrop-filter: blur(2px);
}

.hint-result-card {
  overflow: hidden;
  position: relative;
  min-width: 300px;
  background: rgba(30, 30, 40, 0.95) !important;
}

/* Hint Result Background */
.hint-result-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.hint-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.hint-particle {
  position: absolute;
  width: 3px;
  height: 12px;
  background: linear-gradient(to bottom, rgba(251, 191, 36, 0.8), transparent);
  border-radius: 2px;
  animation: hint-particle-float 2s ease-out forwards;
}

@keyframes hint-particle-float {
  0% {
    opacity: 1;
    transform: rotate(var(--angle, 0deg)) translateX(0) translateY(0);
  }
  100% {
    opacity: 0;
    transform: rotate(var(--angle, 0deg)) translateX(50px) translateY(-30px);
  }
}

/* Hint Result Content */
.hint-result-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 30px 20px;
}

.hint-result-icon-container {
  position: relative;
  display: inline-block;
  margin-bottom: 15px;
}

.hint-result-icon {
  animation: bulb-light-up 0.6s ease;
}

@keyframes bulb-light-up {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.hint-glow-effect {
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.5) 0%, transparent 60%);
  filter: blur(20px);
  animation: hint-glow-pulse 2s ease-in-out infinite;
}

@keyframes hint-glow-pulse {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.hint-result-title {
  font-size: 20px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 10px;
  animation: fade-in-up 0.5s ease 0.2s both;
}

.hint-result-word {
  font-size: 28px;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-bottom: 15px;
  animation: fade-in-up 0.5s ease 0.3s both;
}

.hint-cost-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  animation: fade-in-up 0.5s ease 0.4s both;
}

@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Glass Morphism */
.glass-morphism {
  backdrop-filter: blur(16px);
  background: rgba(30, 30, 40, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
</style>
