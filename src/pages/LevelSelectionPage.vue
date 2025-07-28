<template>
  <q-page class="level-selection-page">
    <ParticleEffects />

    <!-- Header -->
    <div class="page-header glass">
      <div class="header-content">
        <div class="player-stats">
          <div class="stat">
            <q-icon name="diamond" color="blue" />
            <span>{{ gameStore.userProgress.gems }}</span>
          </div>
          <div class="stat">
            <q-icon name="stars" color="amber" />
            <span>{{ gameStore.totalStars }}</span>
          </div>
          <q-btn
            flat
            round
            icon="palette"
            color="white"
            @click="showThemeSelector = true"
            class="theme-button interactive-button"
          >
            <q-tooltip>Change Theme</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Language Selection -->
    <div class="language-section">
      <div class="section-header">
        <h3 class="section-title">
          <q-icon name="language" class="section-icon" />
          Select Language
        </h3>
        <div class="language-progress">
          {{ currentLanguageProgress.completedLevels.length }} /
          {{ availableLevels.length }} completed
        </div>
      </div>

      <div class="languages-container">
        <div class="languages-scroll">
          <div
            v-for="language in allLanguages"
            :key="language.id"
            class="language-card"
            :class="{
              'language-active': selectedLanguage === language.id,
            }"
            @click="selectLanguage(language)"
          >
            <div class="language-flag">{{ language.flag }}</div>
            <div class="language-info">
              <div class="language-name">{{ language.name }}</div>
              <div class="language-stats">
                <q-icon name="stars" color="amber" size="14px" />
                <span>{{ getLanguageStars(language.id) }}</span>
              </div>
            </div>
            <div v-if="selectedLanguage === language.id" class="active-indicator">
              <q-icon name="check_circle" color="green" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Levels Grid Section -->
    <div class="levels-section">
      <div class="section-header">
        <h3 class="section-title">
          <q-icon name="map" class="section-icon" />
          {{ getLanguageName(selectedLanguage) }} Adventures
        </h3>
        <div class="level-progress-bar">
          <div
            class="progress-fill"
            :style="{
              width: `${(currentLanguageProgress.completedLevels.length / availableLevels.length) * 100}%`,
            }"
          ></div>
        </div>
      </div>

      <!-- Scrollable Levels Container -->
      <div class="levels-scroll-container">
        <div class="levels-grid" :key="selectedLanguage">
          <div
            v-for="level in availableLevels"
            :key="`${selectedLanguage}-${level.id}`"
            class="level-item"
            :class="{
              'level-locked': !level.isUnlocked,
              'level-completed': level.isCompleted,
              'level-current': level.id === currentLanguageProgress.currentLevel,
            }"
            @click="selectLevel(level)"
          >
            <q-card
              class="level-card interactive-button"
              :class="{
                'card-locked': !level.isUnlocked,
                'card-completed': level.isCompleted,
                'card-current': level.id === currentLanguageProgress.currentLevel,
              }"
            >
              <!-- Card Background with Gradient -->
              <div class="card-background" :style="getCardGradient(level)">
                <!-- Floating Particles -->
                <div class="card-particles">
                  <div
                    v-for="n in 3"
                    :key="n"
                    class="floating-particle"
                    :style="getParticleStyle(n)"
                  ></div>
                </div>

                <!-- Landmark Icon -->
                <div class="landmark-container">
                  <div class="landmark-glow"></div>
                  <q-icon
                    :name="getLandmarkIcon(level.landmark)"
                    size="40px"
                    :color="level.isUnlocked ? 'white' : 'grey-5'"
                    class="landmark-icon"
                  />
                </div>

                <!-- Level Number -->
                <div class="level-number-badge">
                  <span class="level-number">{{ level.id }}</span>
                </div>

                <!-- Status Overlays -->
                <div class="level-overlay" v-if="!level.isUnlocked">
                  <div class="lock-container">
                    <q-icon name="lock" size="28px" color="white" class="lock-icon" />
                  </div>
                </div>

                <div class="completion-badge" v-if="level.isCompleted">
                  <q-icon name="check_circle" size="24px" color="white" class="completion-icon" />
                </div>

                <!-- Progress Ring for Current Level -->
                <div
                  v-if="level.id === currentLanguageProgress.currentLevel && !level.isCompleted"
                  class="progress-ring"
                >
                  <svg class="progress-ring-svg" width="60" height="60">
                    <circle
                      class="progress-ring-circle-bg"
                      stroke="rgba(255,255,255,0.3)"
                      stroke-width="3"
                      fill="transparent"
                      r="27"
                      cx="30"
                      cy="30"
                    />
                    <circle
                      class="progress-ring-circle"
                      stroke="white"
                      stroke-width="3"
                      fill="transparent"
                      r="27"
                      cx="30"
                      cy="30"
                      :stroke-dasharray="169.65"
                      :stroke-dashoffset="169.65 * (1 - 0.3)"
                    />
                  </svg>
                </div>
              </div>

              <!-- Card Content -->
              <q-card-section class="level-info">
                <div class="level-header">
                  <div class="level-name">{{ level.name }}</div>
                  <div class="level-difficulty">
                    <q-icon
                      v-for="n in getDifficultyLevel(level)"
                      :key="n"
                      name="star"
                      size="12px"
                      color="amber"
                    />
                  </div>
                </div>

                <div class="level-stats">
                  <div class="stat-item">
                    <q-icon name="quiz" size="16px" color="primary" />
                    <span>{{ level.targetWords.length }} words</span>
                  </div>
                  <div class="stat-item">
                    <q-icon name="timer" size="16px" color="orange" />
                    <span>{{ getEstimatedTime(level) }}</span>
                  </div>
                </div>

                <!-- Stars Display for Completed Levels -->
                <div class="level-stars" v-if="level.isCompleted">
                  <div class="stars-container">
                    <q-icon
                      v-for="star in 3"
                      :key="star"
                      name="star"
                      :color="star <= level.stars ? 'amber' : 'grey-4'"
                      size="16px"
                      class="star-icon"
                    />
                  </div>
                  <span class="stars-text">Perfect!</span>
                </div>

                <!-- Action Button for Unlocked Levels -->
                <div class="level-action" v-else-if="level.isUnlocked">
                  <q-btn
                    unelevated
                    :color="
                      level.id === currentLanguageProgress.currentLevel ? 'accent' : 'primary'
                    "
                    :label="
                      level.id === currentLanguageProgress.currentLevel ? 'CONTINUE' : 'START'
                    "
                    size="sm"
                    class="action-btn"
                    @click.stop="startLevel(level)"
                  >
                    <q-icon
                      :name="
                        level.id === currentLanguageProgress.currentLevel
                          ? 'play_circle'
                          : 'play_arrow'
                      "
                      left
                      size="18px"
                    />
                  </q-btn>
                </div>

                <!-- Locked State -->
                <div class="level-locked-info" v-else>
                  <span class="locked-text">Complete previous levels</span>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Coming Soon Cards -->
          <div
            v-for="n in Math.max(0, 6 - availableLevels.length)"
            :key="`coming-soon-${n}`"
            class="level-item level-coming-soon"
          >
            <q-card class="level-card card-coming-soon">
              <div class="card-background coming-soon-bg">
                <div class="coming-soon-particles">
                  <div v-for="p in 2" :key="p" class="coming-soon-particle"></div>
                </div>
                <div class="coming-soon-icon-container">
                  <q-icon
                    name="hourglass_empty"
                    size="36px"
                    color="grey-6"
                    class="coming-soon-icon"
                  />
                </div>
              </div>
              <q-card-section class="level-info">
                <div class="coming-soon-content">
                  <div class="coming-soon-title">Coming Soon</div>
                  <div class="coming-soon-subtitle">New adventures await!</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Level Preview Dialog -->
    <q-dialog v-model="showLevelDialog" position="bottom">
      <q-card class="level-preview-card glass">
        <q-card-section class="preview-header">
          <div class="preview-title">{{ selectedLevel?.name }}</div>
          <q-btn flat round icon="close" @click="showLevelDialog = false" />
        </q-card-section>

        <q-card-section class="preview-content">
          <div class="preview-stats">
            <div class="preview-stat">
              <q-icon name="quiz" color="primary" />
              <span>{{ selectedLevel?.targetWords.length }} Words</span>
            </div>
            <div class="preview-stat">
              <q-icon name="timer" color="orange" />
              <span>{{ getEstimatedTime(selectedLevel) }}</span>
            </div>
            <div class="preview-stat">
              <q-icon name="language" color="blue" />
              <span>{{ getLanguageName(selectedLevel?.languageId || '') }}</span>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn
            push
            color="primary"
            size="lg"
            icon="play_arrow"
            label="START ADVENTURE"
            @click="startLevel(selectedLevel!)"
            :disable="!selectedLevel?.isUnlocked"
            class="start-button interactive-button"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Theme Selector -->
    <ThemeSelector v-model="showThemeSelector" @theme-changed="handleThemeChanged" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/game-store';
import { useThemeStore } from '../stores/theme-store';
import ThemeSelector from '../components/ThemeSelector.vue';
import ParticleEffects from '../components/ParticleEffects.vue';
import type { GameLevel } from '../stores/game-store';
import type { Language } from '../services/api';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const router = useRouter();
const gameStore = useGameStore();
const themeStore = useThemeStore();

const showLevelDialog = ref(false);
const showThemeSelector = ref(false);
const selectedLevel = ref<GameLevel | null>(null);

const selectedLanguage = computed(() => {
  return gameStore.userProgress.selectedLanguage;
});

const currentLanguageProgress = computed(() => {
  const progress = gameStore.userProgress.languages[selectedLanguage.value] || {
    currentLevel: 1,
    completedLevels: [] as number[],
    totalStars: 0,
    hintsUsed: 0,
  };
  return progress;
});

const allLanguages = computed(() => {
  return gameStore.languages.map(lang => ({
    ...lang,
    isUnlocked: true
  }));
});

const availableLevels = computed(() => {
  const levels = gameStore.levels.filter(level => 
    level.languageId === selectedLanguage.value
  );
  
  return levels.map(level => ({
    id: level.id,
    languageId: level.languageId,
    name: level.name,
    letters: level.letters,
    crosswordGrid: [],
    targetWords: level.targetWords,
    isUnlocked: level.orderIndex === 1 || currentLanguageProgress.value.completedLevels.includes(level.id - 1),
    isCompleted: currentLanguageProgress.value.completedLevels.includes(level.id),
    stars: 3, // Could be stored in progress data
    landmark: 'pyramid.jpg', // Default landmark
    orderIndex: level.orderIndex,
  } as GameLevel));
});

const triggerHapticFeedback = async (style: ImpactStyle = ImpactStyle.Light) => {
  try {
    await Haptics.impact({ style });
  } catch {
    console.log('Haptics not available');
  }
};

const getLandmarkIcon = (landmark: string): string => {
  const iconMap: Record<string, string> = {
    'pyramid.jpg': 'terrain',
    'eiffel.jpg': 'tower',
    'colosseum.jpg': 'stadium',
    'fuji.jpg': 'landscape',
    'taj.jpg': 'account_balance',
    'sagrada.jpg': 'church',
    'chichen.jpg': 'temple_hindu',
    'arc.jpg': 'architecture',
    'brandenburg.jpg': 'location_city',
    'pisa.jpg': 'tower',
    'christ.jpg': 'church',
  };
  return iconMap[landmark] || 'place';
};

const getCardGradient = (level: GameLevel): string => {
  if (!level.isUnlocked) {
    return 'background: linear-gradient(135deg, #9e9e9e 0%, #757575 100%)';
  }
  if (level.isCompleted) {
    return 'background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)';
  }
  if (level.id === currentLanguageProgress.value.currentLevel) {
    return 'background: linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)';
  }

  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  ];

  return `background: ${gradients[level.id % gradients.length]}`;
};

const getParticleStyle = (index: number): string => {
  const positions = [
    { top: '20%', left: '15%', delay: '0s' },
    { top: '60%', left: '80%', delay: '1s' },
    { top: '40%', left: '50%', delay: '2s' },
  ];

  const pos = positions[index - 1];
  if (!pos) {
    return 'top: 50%; left: 50%; animation-delay: 0s;';
  }
  return `top: ${pos.top}; left: ${pos.left}; animation-delay: ${pos.delay};`;
};

const getDifficultyLevel = (level: GameLevel): number => {
  const wordCount = level.targetWords.length;
  if (wordCount <= 3) return 1;
  if (wordCount <= 6) return 2;
  return 3;
};

const getEstimatedTime = (level: GameLevel | null): string => {
  if (!level) return '0 min';
  const wordCount = level.targetWords.length;
  const minutes = Math.max(2, Math.ceil(wordCount * 0.8));
  return `${minutes} min`;
};

const getLanguageName = (languageId: string): string => {
  return gameStore.languages.find((lang) => lang.id === languageId)?.name || languageId;
};

const getLanguageStars = (languageId: string): number => {
  return gameStore.userProgress.languages[languageId]?.totalStars || 0;
};

const selectLanguage = async (language: Language) => {
  if (selectedLanguage.value !== language.id) {
    await triggerHapticFeedback(ImpactStyle.Medium);
    gameStore.setSelectedLanguage(language.id);
    showLevelDialog.value = false;
    selectedLevel.value = null;
  }
};

const selectLevel = async (level: GameLevel) => {
  if (!level.isUnlocked) {
    await triggerHapticFeedback(ImpactStyle.Heavy);
    return;
  }

  await triggerHapticFeedback(ImpactStyle.Light);
  selectedLevel.value = level;
  showLevelDialog.value = true;
};

const startLevel = async (level: GameLevel) => {
  if (level && level.isUnlocked) {
    await triggerHapticFeedback(ImpactStyle.Heavy);
    gameStore.setCurrentLevel(level);
    showLevelDialog.value = false;
    await router.push('/game');
  }
};

const handleThemeChanged = () => {
  themeStore.checkThemeUnlocks(currentLanguageProgress.value.completedLevels.length);
};

watch(
  selectedLanguage,
  (newLanguage, oldLanguage) => {
    if (newLanguage !== oldLanguage) {
      const levelsGrid = document.querySelector('.levels-grid');
      if (levelsGrid) {
        levelsGrid.classList.add('language-switch-animation');
        setTimeout(() => {
          levelsGrid.classList.remove('language-switch-animation');
        }, 600);
      }
    }
  },
  { immediate: false },
);

onMounted(async () => {
  await gameStore.loadProgress();
  themeStore.checkThemeUnlocks(currentLanguageProgress.value.completedLevels.length);
});
</script>

<style scoped>
.level-selection-page {
  background: var(--primary-bg);
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--glass-border);
  z-index: 100;
  min-height: 60px;
  flex-shrink: 0;
}

.back-button {
  margin-right: 15px;
}

.header-content {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.player-stats {
  display: flex;
  gap: 20px;
  align-items: center;
}

.stat {
  display: flex;
  align-items: center;
  gap: 5px;
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
}

.theme-button {
  width: 40px;
  height: 40px;
}

/* Language Section */
.language-section {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  color: white;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  color: var(--accent-color);
}

.language-progress {
  color: var(--text-secondary);
  font-size: 0.85rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
}

.languages-container {
  overflow: hidden;
}

.languages-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 5px 0 15px 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.languages-scroll::-webkit-scrollbar {
  display: none;
}

.language-card {
  min-width: 140px;
  background: var(--glass-bg);
  backdrop-filter: blur(15px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.language-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-glow);
}

.language-active {
  background: rgba(255, 255, 255, 0.25);
  border-color: var(--accent-color);
  box-shadow: 0 0 20px rgba(66, 165, 245, 0.4);
}

.language-flag {
  font-size: 2rem;
  margin-bottom: 8px;
}

.language-info {
  flex: 1;
}

.language-name {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.language-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.active-indicator {
  position: absolute;
  top: -5px;
  right: -5px;
  background: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Levels Section */
.levels-section {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.level-progress-bar {
  width: 100px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color), var(--success-color));
  border-radius: 3px;
  transition: width 0.8s ease;
}

/* Scrollable Levels Container */
.levels-scroll-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  margin-top: 15px;
  padding-right: 5px;
}

.levels-scroll-container::-webkit-scrollbar {
  width: 4px;
}

.levels-scroll-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.levels-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.levels-scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 20px;
}

.language-switch-animation {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.level-item {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.level-item:hover:not(.level-locked):not(.level-coming-soon) {
  transform: translateY(-5px) scale(1.02);
}

.level-card {
  height: 220px;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  background: white;
  transition: all 0.4s ease;
}

.card-locked {
  opacity: 0.7;
  cursor: not-allowed;
}

.card-completed {
  box-shadow: 0 0 25px rgba(76, 175, 80, 0.4);
}

.card-current {
  box-shadow: 0 0 30px rgba(33, 150, 243, 0.5);
  transform: scale(1.05);
}

.card-coming-soon {
  opacity: 0.6;
}

.card-background {
  height: 130px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.coming-soon-bg {
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%) !important;
}

/* Floating Particles */
.card-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: floatParticle 4s ease-in-out infinite;
}

@keyframes floatParticle {
  0%,
  100% {
    transform: translateY(0px) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-15px) scale(1.2);
    opacity: 1;
  }
}

.coming-soon-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.coming-soon-particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba(158, 158, 158, 0.4);
  border-radius: 50%;
  animation: floatParticle 6s ease-in-out infinite;
}

.coming-soon-particle:nth-child(1) {
  top: 30%;
  left: 20%;
  animation-delay: 0s;
}

.coming-soon-particle:nth-child(2) {
  top: 70%;
  left: 70%;
  animation-delay: 2s;
}

/* Landmark Container */
.landmark-container {
  position: relative;
  z-index: 2;
}

.landmark-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.landmark-icon {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* Level Number Badge */
.level-number-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.level-number {
  font-weight: bold;
  font-size: 0.9rem;
  color: #333;
}

/* Overlays */
.level-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;
}

.lock-container {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.lock-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.completion-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(76, 175, 80, 0.9);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.completion-icon {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

/* Progress Ring */
.progress-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
}

.progress-ring-svg {
  transform: rotate(-90deg);
}

.progress-ring-circle {
  transition: stroke-dashoffset 0.5s ease;
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));
}

/* Card Content */
.level-info {
  padding: 15px;
  height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.level-name {
  font-size: 0.9rem;
  color: #333;
  font-weight: 600;
  line-height: 1.2;
  flex: 1;
  margin-right: 8px;
}

.level-difficulty {
  display: flex;
  gap: 1px;
}

.level-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 0.75rem;
}

/* Stars Display */
.level-stars {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.stars-container {
  display: flex;
  gap: 2px;
}

.star-icon {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.stars-text {
  color: #4caf50;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Action Button */
.level-action {
  display: flex;
  justify-content: center;
}

.action-btn {
  font-size: 0.75rem;
  padding: 6px 16px;
  border-radius: 15px;
  font-weight: 600;
  min-width: 80px;
}

/* Locked Info */
.level-locked-info {
  display: flex;
  justify-content: center;
  align-items: center;
}

.locked-text {
  color: #999;
  font-size: 0.7rem;
  text-align: center;
  font-style: italic;
}

/* Coming Soon Styles */
.coming-soon-icon-container {
  position: relative;
  z-index: 2;
}

.coming-soon-icon {
  opacity: 0.6;
  animation: pulse 3s ease-in-out infinite;
}

.coming-soon-content {
  text-align: center;
}

.coming-soon-title {
  color: #999;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.coming-soon-subtitle {
  color: #bbb;
  font-size: 0.7rem;
}

/* Dialog Styles */
.level-preview-card {
  border-radius: 20px 20px 0 0;
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
  backdrop-filter: blur(20px);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.preview-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
}

.preview-content {
  padding: 20px;
}

.preview-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 10px;
}

.preview-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  font-weight: 500;
  font-size: 0.85rem;
}

.start-button {
  width: 100%;
  height: 50px;
  border-radius: 25px;
  font-weight: bold;
}

/* Animations */
@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

/* Responsive Design */
@media (max-width: 480px) {
  .levels-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .level-card {
    height: 200px;
  }

  .card-background {
    height: 120px;
  }

  .level-info {
    height: 80px;
    padding: 12px;
  }

  .page-header {
    padding: 10px 15px;
    min-height: 50px;
  }

  .language-section {
    padding: 15px;
  }

  .levels-section {
    padding: 15px;
  }

  .languages-scroll {
    gap: 10px;
  }

  .language-card {
    min-width: 120px;
    padding: 12px;
  }

  .language-flag {
    font-size: 1.5rem;
  }
}

@media (max-width: 360px) {
  .levels-grid {
    grid-template-columns: 1fr 1fr;
  }

  .player-stats {
    gap: 15px;
  }

  .stat {
    font-size: 0.8rem;
  }
}
</style>
