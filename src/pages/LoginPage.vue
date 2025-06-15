<template>
  <q-page class="login-page flex flex-center">
    <div class="login-container">
      <div class="logo-section">
        <h1 class="game-title">PHANDA</h1>
        <p class="game-subtitle">Manzitaal Dictionary</p>
      </div>

      <div class="login-content">
        <q-card class="login-card">
          <q-card-section class="text-center">
            <q-avatar size="80px" class="user-avatar">
              <q-icon name="person" size="40px" />
            </q-avatar>
            <h3 class="welcome-text">Welcome Back!</h3>
            <p class="user-info">Player Level {{ userProgress.currentLevel }}</p>
          </q-card-section>

          <q-card-section>
            <div class="stats-row">
              <div class="stat-item">
                <q-icon name="stars" color="amber" size="24px" />
                <span class="stat-value">{{ userProgress.totalStars }}</span>
                <span class="stat-label">Stars</span>
              </div>
              <div class="stat-item">
                <q-icon name="diamond" color="blue" size="24px" />
                <span class="stat-value">{{ userProgress.gems }}</span>
                <span class="stat-label">Gems</span>
              </div>
              <div class="stat-item">
                <q-icon name="emoji_events" color="orange" size="24px" />
                <span class="stat-value">{{ userProgress.completedLevels.length }}</span>
                <span class="stat-label">Completed</span>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="center">
            <q-btn
              push
              size="lg"
              color="primary"
              icon="play_arrow"
              label="CONTINUE PLAYING"
              class="play-button"
              :loading="isLoading"
              @click="startGame"
            />
          </q-card-actions>
        </q-card>
      </div>

      <div class="decorative-elements">
        <div class="floating-letter">W</div>
        <div class="floating-letter">O</div>
        <div class="floating-letter">R</div>
        <div class="floating-letter">D</div>
        <div class="floating-letter">S</div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/game-store';

const router = useRouter();
const gameStore = useGameStore();
const isLoading = ref(false);

const { userProgress } = gameStore;

const startGame = async () => {
  isLoading.value = true;

  // Simulate login process
  await new Promise((resolve) => setTimeout(resolve, 1500));

  gameStore.authenticateUser();
  isLoading.value = false;

  await router.push('/levels');
};

onMounted(() => {
  gameStore.loadProgress();
});
</script>

<style scoped>
.login-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  position: relative;
  z-index: 2;
}

.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.game-title {
  font-size: 3.5rem;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  margin: 0;
  letter-spacing: 2px;
}

.game-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 10px 0 0 0;
  font-style: italic;
}

.login-card {
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.user-avatar {
  background: linear-gradient(45deg, #42a5f5, #478ed1);
  margin-bottom: 20px;
}

.welcome-text {
  margin: 0;
  color: #333;
  font-weight: 600;
}

.user-info {
  color: #666;
  margin: 5px 0 0 0;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 0.8rem;
  color: #666;
  text-transform: uppercase;
}

.play-button {
  width: 100%;
  height: 50px;
  border-radius: 25px;
  font-weight: bold;
  font-size: 1.1rem;
}

.decorative-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-letter {
  position: absolute;
  font-size: 3rem;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.floating-letter:nth-child(1) {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.floating-letter:nth-child(2) {
  top: 20%;
  right: 15%;
  animation-delay: 1s;
}

.floating-letter:nth-child(3) {
  bottom: 30%;
  left: 20%;
  animation-delay: 2s;
}

.floating-letter:nth-child(4) {
  bottom: 20%;
  right: 10%;
  animation-delay: 3s;
}

.floating-letter:nth-child(5) {
  top: 50%;
  left: 5%;
  animation-delay: 4s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}

@media (max-width: 480px) {
  .game-title {
    font-size: 2.5rem;
  }

  .login-container {
    padding: 15px;
  }
}
</style>
