<template>
  <q-dialog v-model="showDialog" class="theme-dialog">
    <q-card class="theme-card glass">
      <q-card-section class="theme-header">
        <div class="theme-title">
          <q-icon name="palette" size="md" />
          <h3>Choose Your Adventure</h3>
        </div>
        <q-btn flat round icon="close" @click="showDialog = false" />
      </q-card-section>

      <q-card-section class="theme-grid">
        <div
          v-for="theme in themeStore.themes"
          :key="theme.id"
          class="theme-option"
          :class="{
            'theme-selected': theme.id === themeStore.currentTheme,
            'theme-locked': !theme.unlocked,
          }"
          @click="selectTheme(theme)"
        >
          <div class="theme-preview" :style="{ background: theme.preview }">
            <div class="theme-overlay">
              <div class="theme-icon">{{ theme.icon }}</div>
              <div v-if="!theme.unlocked" class="lock-icon">
                <q-icon name="lock" size="sm" />
              </div>
              <div v-if="theme.id === themeStore.currentTheme" class="selected-icon">
                <q-icon name="check_circle" size="sm" color="white" />
              </div>
            </div>
          </div>

          <div class="theme-info">
            <div class="theme-name">{{ theme.name }}</div>
            <div class="theme-description">{{ theme.description }}</div>
            <div v-if="!theme.unlocked && theme.unlockLevel" class="unlock-requirement">
              Unlock at Level {{ theme.unlockLevel }}
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="center" class="theme-actions">
        <q-btn
          push
          color="primary"
          label="Apply Theme"
          @click="applyTheme"
          class="interactive-button"
          :disable="!selectedTheme"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useThemeStore, type Theme } from '../stores/theme-store';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

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
const selectedTheme = ref<string>(themeStore.currentTheme);

const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const triggerHapticFeedback = async (style: ImpactStyle = ImpactStyle.Light) => {
  try {
    await Haptics.impact({ style });
  } catch {
    console.log('Haptics not available');
  }
};

const selectTheme = async (theme: Theme) => {
  if (!theme.unlocked) {
    await triggerHapticFeedback(ImpactStyle.Heavy);
    return;
  }

  await triggerHapticFeedback(ImpactStyle.Light);
  selectedTheme.value = theme.id;
};

const applyTheme = async () => {
  if (selectedTheme.value) {
    await triggerHapticFeedback(ImpactStyle.Medium);
    themeStore.setTheme(selectedTheme.value);
    emit('theme-changed', selectedTheme.value);
    showDialog.value = false;
  }
};
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

.theme-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
}

.theme-option:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.theme-selected {
  border-color: var(--accent-color);
  background: rgba(66, 165, 245, 0.1);
}

.theme-locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.theme-locked:hover {
  transform: none;
  background: rgba(255, 255, 255, 0.05);
}

.theme-preview {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.theme-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
}

.theme-icon {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

.lock-icon,
.selected-icon {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-info {
  flex: 1;
  color: var(--text-primary);
}

.theme-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.theme-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.unlock-requirement {
  font-size: 0.8rem;
  color: var(--warning-color);
  font-weight: 500;
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

@media (min-width: 600px) {
  .theme-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .theme-card {
    width: 95vw;
  }

  .theme-option {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .theme-preview {
    width: 80px;
    height: 80px;
  }
}
</style>
