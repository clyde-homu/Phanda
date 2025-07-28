<template>
  <q-dialog v-model="showDialog" class="theme-dialog">
    <q-card class="theme-card glass">
      <q-card-section class="theme-header">
        <div class="theme-title">
          <q-icon name="auto_awesome" size="md" />
          <h3>UNISA Academic Theme</h3>
        </div>
        <q-btn flat round icon="close" @click="showDialog = false" />
      </q-card-section>

      <q-card-section class="theme-showcase">
        <div class="current-theme-display">
          <div class="theme-preview-large flame-glow" :style="{ background: currentTheme.preview }">
            <div class="theme-overlay">
              <div class="theme-icon-large">{{ currentTheme.icon }}</div>
              <div class="active-indicator">
                <q-icon name="check_circle" size="lg" />
              </div>
            </div>
          </div>

          <div class="theme-details">
            <div class="theme-name-large">{{ currentTheme.name }}</div>
            <div class="theme-description-large">{{ currentTheme.description }}</div>
            <div class="theme-features">
              <div class="feature-tag flame-glow">🟠 UNISA Orange</div>
              <div class="feature-tag water-glow">🔵 UNISA Blue</div>
              <div class="feature-tag">✨ Particle Effects</div>
              <div class="feature-tag">💎 Glass Morphism</div>
            </div>
          </div>
        </div>

        <div class="theme-message">
          <q-icon name="info" size="sm" />
          <span>This is the ultimate theme crafted specifically for the best gaming experience!</span>
        </div>
      </q-card-section>

      <q-card-actions align="center" class="theme-actions">
        <q-btn
          push
          color="primary"
          label="Awesome! Close"
          @click="showDialog = false"
          class="interactive-button flame-glow"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '../stores/theme-store';

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'theme-changed', theme: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const themeStore = useThemeStore();

const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// Get current theme data with fallback
const currentTheme = computed(() => themeStore.currentThemeData || {
  name: 'UNISA Academic',
  description: 'Professional blue representing trust and intellect, with vibrant orange for innovation and creativity',
  icon: '🎓📚',
  preview: 'linear-gradient(135deg, #001a4d 0%, #003d82 50%, #ff6600 100%)',
});
</script>

<style scoped>
.theme-dialog {
  backdrop-filter: blur(10px);
}

.theme-card {
  max-width: 500px;
  width: 90vw;
  border-radius: 20px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}

.theme-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--glass-border);
}

.theme-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-primary);
}

.theme-title h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.theme-showcase {
  padding: 20px;
}

.current-theme-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.theme-preview-large {
  width: 120px;
  height: 120px;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  border: 3px solid var(--fire-secondary);
}

.theme-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(1px);
}

.theme-icon-large {
  font-size: 36px;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.7));
}

.active-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  color: var(--fire-light);
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-details {
  text-align: center;
  color: var(--text-primary);
}

.theme-name-large {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  background: var(--fire-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.theme-description-large {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
  line-height: 1.4;
}

.theme-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.feature-tag {
  padding: 6px 12px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.theme-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--glass-bg-intense);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  backdrop-filter: blur(15px);
}

.theme-actions {
  padding: 20px;
  border-top: 1px solid var(--glass-border);
}

.interactive-button {
  min-width: 150px;
  height: 45px;
  border-radius: 22px;
  font-weight: 600;
  text-transform: none;
}

@media (max-width: 480px) {
  .theme-card {
    width: 95vw;
  }

  .theme-showcase {
    padding: 15px;
  }

  .theme-preview-large {
    width: 100px;
    height: 100px;
  }

  .theme-icon-large {
    font-size: 28px;
  }

  .theme-name-large {
    font-size: 1.3rem;
  }

  .theme-description-large {
    font-size: 0.9rem;
  }

  .feature-tag {
    font-size: 0.8rem;
    padding: 4px 8px;
  }
}
</style>
