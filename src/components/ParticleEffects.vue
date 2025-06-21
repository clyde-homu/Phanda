<template>
  <div class="particles-container" v-if="showParticles">
    <div class="particles">
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="particle"
        :style="particle.style"
      ></div>
    </div>

    <!-- Success burst particles -->
    <div v-if="showSuccessBurst" class="success-burst">
      <div
        v-for="burst in successParticles"
        :key="burst.id"
        class="burst-particle"
        :style="burst.style"
      >
        {{ burst.emoji }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Particle {
  id: number;
  style: Record<string, string>;
}

interface BurstParticle extends Particle {
  emoji: string;
}

interface Props {
  intensity?: number;
  showParticles?: boolean;
}

interface Emits {
  (e: 'burst-complete'): void;
}

const props = withDefaults(defineProps<Props>(), {
  intensity: 20,
  showParticles: true,
});

const emit = defineEmits<Emits>();

const particles = ref<Particle[]>([]);
const successParticles = ref<BurstParticle[]>([]);
const showSuccessBurst = ref(false);
let animationFrame: number;
let particleId = 0;

const createParticle = (): Particle => {
  const size = Math.random() * 4 + 2;
  const x = Math.random() * 100;
  const y = Math.random() * 100;
  const duration = Math.random() * 10 + 5;
  const delay = Math.random() * 5;
  const opacity = Math.random() * 0.7 + 0.3;

  return {
    id: particleId++,
    style: {
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
      opacity: opacity.toString(),
      background: 'var(--particle-color)',
    },
  };
};

const createSuccessBurst = (centerX: number = 50, centerY: number = 50) => {
  const emojis = ['✨', '🎉', '⭐', '💫', '🌟', '🎊'];
  const burstParticles: BurstParticle[] = [];

  for (let i = 0; i < 12; i++) {
    const angle = i * 30 * (Math.PI / 180);
    const distance = Math.random() * 200 + 100;
    const x = centerX + Math.cos(angle) * ((distance / window.innerWidth) * 100);
    const y = centerY + Math.sin(angle) * ((distance / window.innerHeight) * 100);
    const duration = Math.random() * 1 + 1.5;
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    burstParticles.push({
      id: particleId++,
      emoji: emoji || '✨',
      style: {
        left: `${centerX}%`,
        top: `${centerY}%`,
        '--end-x': `${x}%`,
        '--end-y': `${y}%`,
        animationDuration: `${duration}s`,
        fontSize: `${Math.random() * 10 + 15}px`,
      },
    });
  }

  return burstParticles;
};

const initializeParticles = () => {
  particles.value = [];
  for (let i = 0; i < props.intensity; i++) {
    particles.value.push(createParticle());
  }
};

const triggerSuccessBurst = (x?: number, y?: number) => {
  showSuccessBurst.value = true;
  successParticles.value = createSuccessBurst(x, y);

  setTimeout(() => {
    showSuccessBurst.value = false;
    successParticles.value = [];
    emit('burst-complete');
  }, 2000);
};

const updateParticles = () => {
  // Occasionally add new particles to replace old ones
  if (Math.random() < 0.02) {
    const oldestIndex = particles.value.findIndex(() => Math.random() < 0.1);
    if (oldestIndex !== -1) {
      particles.value[oldestIndex] = createParticle();
    }
  }

  animationFrame = requestAnimationFrame(updateParticles);
};

onMounted(() => {
  if (props.showParticles) {
    initializeParticles();
    updateParticles();
  }
});

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
});

// Expose methods for parent components
defineExpose({
  triggerSuccessBurst,
});
</script>

<style scoped>
.particles-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: var(--particle-color);
  animation: float 6s ease-in-out infinite;
  opacity: 0.7;
}

.particle:nth-child(odd) {
  animation-delay: -2s;
  animation-duration: 8s;
}

.particle:nth-child(even) {
  animation-delay: -4s;
  animation-duration: 10s;
}

.particle:nth-child(3n) {
  animation-delay: -1s;
  animation-duration: 7s;
}

.success-burst {
  position: absolute;
  width: 100%;
  height: 100%;
}

.burst-particle {
  position: absolute;
  font-size: 20px;
  animation: burst 2s ease-out forwards;
  pointer-events: none;
  z-index: 1000;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) translateX(0px) rotate(0deg);
    opacity: 0.7;
  }
  25% {
    transform: translateY(-20px) translateX(10px) rotate(90deg);
    opacity: 1;
  }
  50% {
    transform: translateY(-10px) translateX(-5px) rotate(180deg);
    opacity: 0.8;
  }
  75% {
    transform: translateY(-30px) translateX(15px) rotate(270deg);
    opacity: 0.9;
  }
}

@keyframes burst {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: translate(calc(var(--end-x) - 50%), calc(var(--end-y) - 50%)) scale(1.2)
      rotate(180deg);
    opacity: 1;
  }
  100% {
    transform: translate(calc(var(--end-x) - 50%), calc(var(--end-y) - 50%)) scale(0.5)
      rotate(360deg);
    opacity: 0;
  }
}

/* Theme-specific particle effects */
[data-theme='ocean'] .particle {
  background: radial-gradient(circle, rgba(0, 188, 212, 0.8), rgba(0, 150, 136, 0.6));
  box-shadow: 0 0 10px rgba(0, 188, 212, 0.5);
}

[data-theme='forest'] .particle {
  background: radial-gradient(circle, rgba(76, 175, 80, 0.8), rgba(139, 195, 74, 0.6));
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}

[data-theme='sunset'] .particle {
  background: radial-gradient(circle, rgba(255, 87, 34, 0.8), rgba(255, 193, 7, 0.6));
  box-shadow: 0 0 10px rgba(255, 87, 34, 0.5);
}

[data-theme='galaxy'] .particle {
  background: radial-gradient(circle, rgba(233, 30, 99, 0.8), rgba(156, 39, 176, 0.6));
  box-shadow: 0 0 15px rgba(233, 30, 99, 0.7);
}

[data-theme='neon'] .particle {
  background: radial-gradient(circle, rgba(0, 255, 255, 0.9), rgba(0, 255, 0, 0.7));
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .particle {
    animation: none;
    opacity: 0.3;
  }

  .burst-particle {
    animation: none;
    opacity: 0;
  }

  .particles-container {
    display: none;
  }
}

/* Performance optimization for mobile */
@media (max-width: 768px) {
  .particle {
    width: 3px !important;
    height: 3px !important;
  }

  .burst-particle {
    font-size: 16px;
  }
}
</style>
