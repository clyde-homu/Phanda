<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    no-backdrop-dismiss
    class="word-found-dialog"
  >
    <q-card class="word-found-card glass-morphism">
      <div class="word-found-bg">
        <div class="success-particles">
          <div v-for="n in 12" :key="n" class="particle" :style="getParticleStyle(n)"></div>
        </div>
      </div>

      <q-card-section class="word-found-content">
        <div class="found-icon-container">
          <q-icon name="check_circle" size="50px" color="green" class="found-icon" />
          <div class="check-glow"></div>
        </div>
        <div class="found-word-text">{{ lastFoundWord }}</div>
        <div class="found-points">
          <q-icon name="diamond" color="cyan" size="20px" />
          <span>+5 Gems</span>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  lastFoundWord: string;
}

defineProps<Props>();

defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const getParticleStyle = (index: number) => {
  const angle = (index * 30) % 360;
  const distance = 40 + (index % 3) * 15;
  const delay = (index * 0.1) % 1;

  return `
    transform: rotate(${angle}deg) translateX(${distance}px);
    animation-delay: ${delay}s;
  `;
};
</script>

<style scoped>
/* Word Found Dialog */
.word-found-dialog :deep(.q-dialog__inner) {
  padding: 20px;
}

.word-found-card {
  overflow: hidden;
  position: relative;
  min-width: 300px;
}

/* Word Found Background */
.word-found-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.success-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(34, 197, 94, 0.8);
  border-radius: 50%;
  animation: particle-explode 1s ease-out forwards;
}

@keyframes particle-explode {
  0% {
    opacity: 1;
    transform: rotate(var(--angle, 0deg)) translateX(0);
  }
  100% {
    opacity: 0;
    transform: rotate(var(--angle, 0deg)) translateX(60px);
  }
}

/* Word Found Content */
.word-found-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 30px 20px;
}

.found-icon-container {
  position: relative;
  display: inline-block;
  margin-bottom: 15px;
}

.found-icon {
  animation: check-pop 0.4s ease;
}

@keyframes check-pop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.check-glow {
  position: absolute;
  inset: -15px;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, transparent 70%);
  filter: blur(15px);
  animation: glow-pulse 1.5s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.found-word-text {
  font-size: 24px;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 10px;
  animation: word-slide-up 0.5s ease;
}

@keyframes word-slide-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.found-points {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  animation: points-fade-in 0.6s ease 0.3s both;
}

@keyframes points-fade-in {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Glass Morphism */
.glass-morphism {
  backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  will-change: transform;
  backface-visibility: hidden;
}
</style>
