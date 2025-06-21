<template>
  <q-page class="level-selection-page">
    <div class="page-header">
      <q-btn
        flat
        round
        icon="arrow_back"
        color="white"
        size="lg"
        @click="goBack"
        class="back-button"
      />
      <div class="header-content">
        <h2 class="page-title">Choose Your Adventure</h2>
        <div class="player-stats">
          <div class="stat">
            <q-icon name="diamond" color="blue" />
            <span>{{ userProgress.gems }}</span>
          </div>
          <div class="stat">
            <q-icon name="stars" color="amber" />
            <span>{{ userProgress.totalStars }}</span>
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

    <div class="levels-container">
      <div class="levels-grid">
        <div
          v-for="level in availableLevels"
          :key="level.id"
          class="level-item"
          :class="{
            'level-locked': !level.isUnlocked,
            'level-completed': level.isCompleted,
            'level-current': level.id === userProgress.currentLevel,
          }"
          @click="selectLevel(level)"
        >
          <q-card
            class="level-card"
            :class="{
              'card-locked': !level.isUnlocked,
              'card-completed': level.isCompleted,
              'card-current': level.id === userProgress.currentLevel,
            }"
          >
            <div class="card-background">
              <div class="landmark-image">
                <q-icon
                  :name="getLandmarkIcon(level.landmark)"
                  size="40px"
                  :color="level.isUnlocked ? 'primary' : 'grey'"
                />
              </div>

              <div class="level-overlay" v-if="!level.isUnlocked">
                <q-icon name="lock" size="30px" color="grey" />
              </div>

              <div class="completion-badge" v-if="level.isCompleted">
                <q-icon name="check_circle" size="24px" color="green" />
              </div>
            </div>

            <q-card-section class="level-info">
              <div class="level-number">{{ level.id }}</div>
              <div class="level-name">{{ level.name }}</div>

              <div class="level-stars" v-if="level.isCompleted">
                <q-icon
                  v-for="star in 3"
                  :key="star"
                  name="star"
                  :color="star <= level.stars ? 'amber' : 'grey-4'"
                  size="16px"
                />
              </div>

              <div class="level-progress" v-else-if="level.isUnlocked">
                <span class="progress-text">Tap to Play</span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <q-dialog v-model="showLevelDialog" position="bottom">
      <q-card class="level-preview-card">
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
          </div>

          <div class="letter-preview">
            <div v-for="letter in selectedLevel?.letters" :key="letter" class="preview-letter">
              {{ letter }}
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
            @click="startLevel"
            :disable="!selectedLevel?.isUnlocked"
            class="start-button"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Theme Selector -->
    <ThemeSelector v-model="showThemeSelector" @theme-changed="handleThemeChanged" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/game-store';
import { useThemeStore } from '../stores/theme-store';
import { getUnlockedLevels } from '../stores/levels-data';
import ThemeSelector from '../components/ThemeSelector.vue';
import type { GameLevel } from '../stores/game-store';

const router = useRouter();
const gameStore = useGameStore();
const themeStore = useThemeStore();
const showLevelDialog = ref(false);
const showThemeSelector = ref(false);
const selectedLevel = ref<GameLevel | null>(null);

const { userProgress } = gameStore;

const availableLevels = computed(() => {
  return getUnlockedLevels(userProgress.completedLevels);
});

const getLandmarkIcon = (landmark: string): string => {
  const iconMap: Record<string, string> = {
    'pyramid.jpg': 'terrain',
    'eiffel.jpg': 'tower',
    'colosseum.jpg': 'stadium',
  };
  return iconMap[landmark] || 'place';
};

const selectLevel = (level: GameLevel) => {
  if (!level.isUnlocked) return;

  selectedLevel.value = level;
  showLevelDialog.value = true;
};

const startLevel = async () => {
  if (selectedLevel.value) {
    gameStore.setCurrentLevel(selectedLevel.value);
    await router.push('/game');
  }
};

const goBack = async () => {
  await router.push('/');
};

const handleThemeChanged = (themeId: string) => {
  console.log('Theme changed to:', themeId);
  // Check for theme unlocks based on current progress
  themeStore.checkThemeUnlocks(userProgress.completedLevels.length);
};

onMounted(() => {
  gameStore.loadProgress();
  // Check theme unlocks on page load
  themeStore.checkThemeUnlocks(userProgress.completedLevels.length);
});
</script>

<style scoped>
.level-selection-page {
  background: var(--primary-bg);
  min-height: 100vh;
  position: relative;
}

.page-header {
  display: flex;
  align-items: center;
  padding: 20px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--glass-border);
  z-index: 10;
}

.back-button {
  margin-right: 15px;
}

.header-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  color: white;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
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
}

.theme-button {
  width: 40px;
  height: 40px;
}

.levels-container {
  padding: 20px;
  flex: 1;
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.level-item {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.level-item:hover:not(.level-locked) {
  transform: translateY(-5px);
}

.level-card {
  height: 180px;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  background: white;
}

.card-locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.card-completed {
  border: 2px solid #4caf50;
}

.card-current {
  border: 2px solid #2196f3;
  box-shadow: 0 0 20px rgba(33, 150, 243, 0.3);
}

.card-background {
  height: 100px;
  background: linear-gradient(45deg, #e3f2fd, #bbdefb);
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
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.completion-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 3;
}

.level-info {
  padding: 15px;
  text-align: center;
}

.level-number {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.level-name {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 10px;
  line-height: 1.2;
}

.level-stars {
  display: flex;
  justify-content: center;
  gap: 2px;
}

.progress-text {
  font-size: 0.7rem;
  color: #2196f3;
  font-weight: 500;
  text-transform: uppercase;
}

.level-preview-card {
  border-radius: 20px 20px 0 0;
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.preview-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
}

.preview-content {
  padding: 20px;
}

.preview-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.preview-stat {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-weight: 500;
}

.letter-preview {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.preview-letter {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(45deg, #42a5f5, #478ed1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
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
    gap: 15px;
  }

  .level-card {
    height: 160px;
  }

  .page-header {
    padding: 15px;
  }

  .page-title {
    font-size: 1.3rem;
  }
}
</style>
