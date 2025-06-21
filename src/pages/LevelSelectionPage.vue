<template>
  <q-page class="level-selection-page">
    <ParticleEffects />

    <!-- Header -->
    <div class="page-header glass">
      <q-btn
        flat
        round
        icon="arrow_back"
        color="white"
        size="md"
        @click="goBack"
        class="back-button interactive-button"
      />
      <div class="header-content">
        <div class="player-stats">
          <div class="stat">
            <q-icon name="diamond" color="blue" />
            <span>{{ userProgress.gems }}</span>
          </div>
          <div class="stat">
            <q-icon name="stars" color="amber" />
            <span>{{ totalStars }}</span>
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

    <!-- Levels Grid -->
    <div class="levels-section">
      <div class="section-header">
        <h3 class="section-title">
          <q-icon name="map" class="section-icon" />
          {{ getLanguageName(selectedLanguage) }} Levels
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

      <div class="levels-container">
        <div class="levels-grid">
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
              <div class="card-background">
                <div class="landmark-image">
                  <q-icon
                    :name="getLandmarkIcon(level.landmark)"
                    size="32px"
                    :color="level.isUnlocked ? 'primary' : 'grey'"
                  />
                </div>

                <div class="level-overlay" v-if="!level.isUnlocked">
                  <q-icon name="lock" size="24px" color="grey" />
                </div>

                <div class="completion-badge" v-if="level.isCompleted">
                  <q-icon name="check_circle" size="20px" color="green" />
                </div>

                <div class="level-number-badge">{{ level.id }}</div>
              </div>

              <q-card-section class="level-info">
                <div class="level-name">{{ level.name }}</div>

                <div class="level-details">
                  <div class="level-letters">
                    <span
                      v-for="letter in level.letters.slice(0, 4)"
                      :key="letter"
                      class="letter-chip"
                    >
                      {{ letter }}
                    </span>
                    <span v-if="level.letters.length > 4" class="more-letters"
                      >+{{ level.letters.length - 4 }}</span
                    >
                  </div>

                  <div class="level-words-count">
                    <q-icon name="quiz" size="14px" />
                    <span>{{ level.targetWords.length }} words</span>
                  </div>
                </div>

                <div class="level-stars" v-if="level.isCompleted">
                  <q-icon
                    v-for="star in 3"
                    :key="star"
                    name="star"
                    :color="star <= level.stars ? 'amber' : 'grey-4'"
                    size="14px"
                  />
                </div>

                <div class="level-action" v-else-if="level.isUnlocked">
                  <q-btn
                    dense
                    color="primary"
                    label="PLAY"
                    size="sm"
                    class="play-btn"
                    @click.stop="startLevel(level)"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Add Level Coming Soon Cards -->
          <div
            v-for="n in Math.max(0, 6 - availableLevels.length)"
            :key="`coming-soon-${n}`"
            class="level-item level-coming-soon"
          >
            <q-card class="level-card card-coming-soon">
              <div class="card-background">
                <div class="coming-soon-icon">
                  <q-icon name="hourglass_empty" size="32px" color="grey" />
                </div>
              </div>
              <q-card-section class="level-info">
                <div class="coming-soon-text">Coming Soon</div>
                <div class="coming-soon-subtitle">More adventures await!</div>
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
              <q-icon name="casino" color="primary" />
              <span>{{ selectedLevel?.letters.length }} Letters</span>
            </div>
            <div class="preview-stat">
              <q-icon name="quiz" color="orange" />
              <span>{{ selectedLevel?.targetWords.length }} Words</span>
            </div>
            <div class="preview-stat">
              <q-icon name="language" color="blue" />
              <span>{{ getLanguageName(selectedLevel?.language || '') }}</span>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn
            push
            color="primary"
            size="lg"
            icon="play_arrow"
            label="START LEVEL"
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
import {
  getUnlockedLevels,
  getUnlockedLanguages,
  AVAILABLE_LANGUAGES,
} from '../stores/levels-data';
import ThemeSelector from '../components/ThemeSelector.vue';
import ParticleEffects from '../components/ParticleEffects.vue';
import type { GameLevel } from '../stores/game-store';
import type { Language } from '../stores/levels-data';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const router = useRouter();
const gameStore = useGameStore();
const themeStore = useThemeStore();

const showLevelDialog = ref(false);
const showThemeSelector = ref(false);
const selectedLevel = ref<GameLevel | null>(null);

const { userProgress, currentLanguageProgress, totalStars } = gameStore;
const selectedLanguage = computed(() => userProgress.selectedLanguage);

const allLanguages = computed(() => {
  return getUnlockedLanguages();
});

const availableLevels = computed(() => {
  return getUnlockedLevels(selectedLanguage.value, currentLanguageProgress.completedLevels);
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

const getLanguageName = (languageId: string): string => {
  return AVAILABLE_LANGUAGES.find((lang) => lang.id === languageId)?.name || languageId;
};

const getLanguageStars = (languageId: string): number => {
  return userProgress.languages[languageId]?.totalStars || 0;
};

const selectLanguage = async (language: Language) => {
  if (selectedLanguage.value !== language.id) {
    await triggerHapticFeedback(ImpactStyle.Medium);
    gameStore.setSelectedLanguage(language.id);
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

const goBack = async () => {
  await triggerHapticFeedback(ImpactStyle.Light);
  await router.push('/');
};

const handleThemeChanged = (themeId: string) => {
  console.log('Theme changed to:', themeId);
  themeStore.checkThemeUnlocks(currentLanguageProgress.completedLevels.length);
};

// Watch for language changes to trigger animations
watch(selectedLanguage, () => {
  // Add animation class to levels grid
  const levelsGrid = document.querySelector('.levels-grid');
  if (levelsGrid) {
    levelsGrid.classList.add('language-switch-animation');
    setTimeout(() => {
      levelsGrid.classList.remove('language-switch-animation');
    }, 600);
  }
});

onMounted(() => {
  gameStore.loadProgress();
  themeStore.checkThemeUnlocks(currentLanguageProgress.completedLevels.length);
});
</script>

<style scoped>
.level-selection-page {
  background: var(--primary-bg);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.page-header {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--glass-border);
  position: sticky;
  top: 0;
  z-index: 100;
  min-height: 60px;
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

.levels-container {
  margin-top: 15px;
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 15px;
  max-width: 1000px;
  margin: 0 auto;
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
  transition: transform 0.2s ease;
}

.level-item:hover:not(.level-locked):not(.level-coming-soon) {
  transform: translateY(-3px);
}

.level-card {
  height: 200px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  background: white;
  transition: all 0.3s ease;
}

.card-locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.card-completed {
  border: 2px solid #4caf50;
  box-shadow: 0 0 15px rgba(76, 175, 80, 0.3);
}

.card-current {
  border: 2px solid #2196f3;
  box-shadow: 0 0 20px rgba(33, 150, 243, 0.4);
}

.card-coming-soon {
  opacity: 0.5;
  background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
}

.card-background {
  height: 110px;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.landmark-image {
  z-index: 1;
}

.level-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.completion-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}

.level-number-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: var(--accent-color);
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  z-index: 3;
}

.level-info {
  padding: 12px;
  height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.level-name {
  font-size: 0.8rem;
  color: #333;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.level-details {
  flex: 1;
}

.level-letters {
  display: flex;
  gap: 3px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.letter-chip {
  background: var(--accent-color);
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
}

.more-letters {
  color: #666;
  font-size: 0.7rem;
  align-self: center;
  margin-left: 2px;
}

.level-words-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 0.75rem;
}

.level-stars {
  display: flex;
  justify-content: center;
  gap: 2px;
}

.level-action {
  display: flex;
  justify-content: center;
}

.play-btn {
  font-size: 0.7rem;
  padding: 4px 12px;
  border-radius: 12px;
}

.coming-soon-icon {
  opacity: 0.5;
}

.coming-soon-text {
  color: #999;
  font-weight: 600;
  font-size: 0.9rem;
  text-align: center;
}

.coming-soon-subtitle {
  color: #bbb;
  font-size: 0.7rem;
  text-align: center;
  margin-top: 4px;
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

@media (max-width: 480px) {
  .levels-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .level-card {
    height: 180px;
  }

  .page-header {
    padding: 10px 15px;
    min-height: 50px;
  }

  .language-section,
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
