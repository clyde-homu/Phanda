<template>
  <q-page class="login-page flex flex-center">
    <ParticleEffects />

    <div class="login-container">
      <div class="logo-section">
        <h1 class="game-title">PHANDA</h1>
        <p class="game-subtitle">Manzitaal Dictionary</p>
      </div>

      <!-- Login/Register Toggle -->
      <div class="form-toggle">
        <q-btn-toggle
          v-model="formMode"
          toggle-color="primary"
          :options="[
            { label: 'Login', value: 'login' },
            { label: 'Register', value: 'register' },
          ]"
          class="toggle-buttons"
        />
      </div>

      <!-- Login Form -->
      <div v-if="formMode === 'login'" class="auth-content">
        <q-card class="auth-card glass-solid">
          <q-card-section class="text-center auth-header">
            <q-avatar size="60px" class="user-avatar">
              <q-icon name="person" size="30px" />
            </q-avatar>
            <h3 class="welcome-text">Welcome Back!</h3>
            <p class="auth-subtitle">Sign in to continue your word adventure</p>
          </q-card-section>

          <q-card-section class="form-section">
            <q-form @submit="handleLogin" class="auth-form">
              <q-input
                v-model="loginForm.email"
                type="email"
                label="Email"
                outlined
                dense
                :rules="[
                  val => !!val || 'Email is required',
                  val => isValidEmail(val) || 'Invalid email format',
                ]"
                class="form-input"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>

              <q-input
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                label="Password"
                outlined
                dense
                :rules="[val => !!val || 'Password is required']"
                class="form-input"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>

              <div class="form-options">
                <q-checkbox v-model="rememberMe" label="Remember me" size="sm" />
                <q-btn flat color="primary" label="Forgot?" class="forgot-btn" size="sm" />
              </div>

              <q-btn
                type="submit"
                push
                size="md"
                color="primary"
                icon="login"
                label="SIGN IN"
                class="auth-button interactive-button"
                :loading="isLoading"
                :disable="!isLoginFormValid"
              />
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- Registration Form -->
      <div v-else class="auth-content">
        <q-card class="auth-card glass-solid">
          <q-card-section class="text-center auth-header">
            <q-avatar size="60px" class="user-avatar">
              <q-icon name="person_add" size="30px" />
            </q-avatar>
            <h3 class="welcome-text">Join Phanda!</h3>
            <p class="auth-subtitle">Create your account and start your word journey</p>
          </q-card-section>

          <q-card-section class="form-section">
            <q-form @submit="handleRegister" class="auth-form">
              <q-input
                v-model="registerForm.username"
                label="Username"
                outlined
                dense
                :rules="[
                  val => !!val || 'Username is required',
                  val => val.length >= 3 || 'Username must be at least 3 characters',
                ]"
                class="form-input"
              >
                <template v-slot:prepend>
                  <q-icon name="account_circle" />
                </template>
              </q-input>

              <q-input
                v-model="registerForm.email"
                type="email"
                label="Email"
                outlined
                dense
                :rules="[
                  val => !!val || 'Email is required',
                  val => isValidEmail(val) || 'Invalid email format',
                ]"
                class="form-input"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>

              <q-input
                v-model="registerForm.password"
                :type="showPassword ? 'text' : 'password'"
                label="Password"
                outlined
                dense
                :rules="[
                  val => !!val || 'Password is required',
                  val => val.length >= 6 || 'Password must be at least 6 characters',
                ]"
                class="form-input"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>

              <q-input
                v-model="registerForm.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                label="Confirm Password"
                outlined
                dense
                :rules="[
                  val => !!val || 'Please confirm your password',
                  val => val === registerForm.password || 'Passwords do not match',
                ]"
                class="form-input"
              >
                <template v-slot:prepend>
                  <q-icon name="lock_outline" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showConfirmPassword = !showConfirmPassword"
                  />
                </template>
              </q-input>

              <div class="form-options">
                <q-checkbox
                  v-model="agreeToTerms"
                  label="I agree to the Terms of Service"
                  size="sm"
                />
              </div>

              <q-btn
                type="submit"
                push
                size="md"
                color="secondary"
                icon="person_add"
                label="CREATE ACCOUNT"
                class="auth-button interactive-button"
                :loading="isLoading"
                :disable="!isRegisterFormValid"
              />
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- User Stats (shown after login) -->
      <div v-if="isLoggedIn" class="user-stats-card">
        <q-card class="stats-card glass-solid">
          <q-card-section>
            <div class="stats-row">
              <div class="stat-item">
                <q-icon name="stars" color="amber" size="20px" />
                <span class="stat-value">{{ totalStars }}</span>
                <span class="stat-label">Stars</span>
              </div>
              <div class="stat-item">
                <q-icon name="diamond" color="blue" size="20px" />
                <span class="stat-value">{{ userProgress.gems }}</span>
                <span class="stat-label">Gems</span>
              </div>
              <div class="stat-item">
                <q-icon name="emoji_events" color="orange" size="20px" />
                <span class="stat-value">{{ totalCompletedLevels }}</span>
                <span class="stat-label">Completed</span>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="center">
            <q-btn
              push
              size="md"
              color="primary"
              icon="play_arrow"
              label="CONTINUE PLAYING"
              class="play-button interactive-button"
              @click="startGame"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Theme Selector -->
      <div class="theme-selector-btn">
        <q-btn
          round
          color="white"
          text-color="primary"
          icon="palette"
          size="sm"
          @click="showThemeSelector = true"
          class="interactive-button"
        >
          <q-tooltip>Change Theme</q-tooltip>
        </q-btn>
      </div>

      <!-- Decorative Elements -->
      <div class="decorative-elements">
        <div class="floating-letter">W</div>
        <div class="floating-letter">O</div>
        <div class="floating-letter">R</div>
        <div class="floating-letter">D</div>
        <div class="floating-letter">S</div>
      </div>
    </div>

    <!-- Theme Selector -->
    <ThemeSelector v-model="showThemeSelector" @theme-changed="handleThemeChanged" />

    <!-- Success Dialog -->
    <q-dialog v-model="showSuccessDialog" persistent>
      <q-card class="success-dialog glass-solid">
        <q-card-section class="text-center">
          <q-icon name="check_circle" size="50px" color="green" />
          <h3>{{ successMessage }}</h3>
          <p>Welcome to Phanda! Get ready for an amazing word adventure.</p>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            push
            color="primary"
            label="Let's Play!"
            @click="proceedToGame"
            class="interactive-button"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/game-store';
import { useThemeStore } from '../stores/theme-store';
import { useAuthStore } from '../stores/auth-store';
import ParticleEffects from '../components/ParticleEffects.vue';
import ThemeSelector from '../components/ThemeSelector.vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const router = useRouter();
const gameStore = useGameStore();
const themeStore = useThemeStore();
const authStore = useAuthStore();

const formMode = ref<'login' | 'register'>('login');
const isLoading = ref(false);
const isLoggedIn = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const rememberMe = ref(false);
const agreeToTerms = ref(false);
const showThemeSelector = ref(false);
const showSuccessDialog = ref(false);
const successMessage = ref('');

// Form data
const loginForm = ref({
  email: '',
  password: '',
});

const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const { userProgress, totalStars, totalCompletedLevels } = gameStore;

// Validation
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isLoginFormValid = computed(() => {
  return loginForm.value.email && loginForm.value.password && isValidEmail(loginForm.value.email);
});

const isRegisterFormValid = computed(() => {
  return (
    registerForm.value.username.length >= 3 &&
    registerForm.value.email &&
    isValidEmail(registerForm.value.email) &&
    registerForm.value.password.length >= 6 &&
    registerForm.value.password === registerForm.value.confirmPassword &&
    agreeToTerms.value
  );
});

const triggerHapticFeedback = async (style: ImpactStyle = ImpactStyle.Light) => {
  try {
    await Haptics.impact({ style });
  } catch {
    console.log('Haptics not available');
  }
};

// Real login with API call
const handleLogin = async () => {
  isLoading.value = true;
  await triggerHapticFeedback(ImpactStyle.Medium);

  try {
    const user = await authStore.login({
      email: loginForm.value.email,
      password: loginForm.value.password,
    });

    successMessage.value = 'Login Successful!';
    showSuccessDialog.value = true;
    isLoggedIn.value = true;

    // Update game store with real user data
    gameStore.authenticateUser();
    gameStore.updateUserProgress({
      gems: user.totalGems,
      hintsUsed: user.totalHintsUsed,
    });

    // Initialize store with API data
    await gameStore.initializeStore();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
    console.error('Login failed:', error);
    // Show error to user (you might want to add a notification system)
    alert(errorMessage);
  }

  isLoading.value = false;
};

// Real registration with API call
const handleRegister = async () => {
  isLoading.value = true;
  await triggerHapticFeedback(ImpactStyle.Medium);

  try {
    const user = await authStore.register({
      username: registerForm.value.username,
      email: registerForm.value.email,
      password: registerForm.value.password,
    });

    successMessage.value = 'Account Created Successfully!';
    showSuccessDialog.value = true;
    isLoggedIn.value = true;

    // Update game store with real user data
    gameStore.authenticateUser();
    gameStore.updateUserProgress({
      gems: user.totalGems,
      hintsUsed: user.totalHintsUsed,
    });

    // Initialize store with API data
    await gameStore.initializeStore();

    // Initialize new user progress
    gameStore.initializeNewUser();
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Registration failed. Please try again.';
    console.error('Registration failed:', error);
    // Show error to user (you might want to add a notification system)
    alert(errorMessage);
  }

  isLoading.value = false;
};

const startGame = async () => {
  await triggerHapticFeedback(ImpactStyle.Heavy);
  await router.push('/levels');
};

const proceedToGame = async () => {
  showSuccessDialog.value = false;
  await new Promise(resolve => setTimeout(resolve, 500));
  await startGame();
};

const handleThemeChanged = (themeId: string) => {
  console.log('Theme changed to:', themeId);
};

// Check if user is already logged in
onMounted(async () => {
  themeStore.initializeTheme();

  // Check if user is authenticated using auth store
  if (authStore.isAuthenticated) {
    isLoggedIn.value = true;
    gameStore.authenticateUser();

    // Update game store with user data from auth store
    if (authStore.user) {
      gameStore.updateUserProgress({
        gems: authStore.user.totalGems,
        hintsUsed: authStore.user.totalHintsUsed,
      });
    }

    // Initialize store with API data
    await gameStore.initializeStore();
  } else {
    // Load local progress for non-authenticated users
    gameStore.loadLocalProgress();
  }
});
</script>

<style scoped>
.login-page {
  background: var(--primary-bg);
  min-height: 100vh;
  max-height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.login-container {
  width: 100%;
  max-width: 380px;
  padding: 15px;
  position: relative;
  z-index: 2;
  max-height: 100vh;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.login-container::-webkit-scrollbar {
  display: none;
}

.logo-section {
  text-align: center;
  margin-bottom: 20px;
}

.game-title {
  font-size: 2.8rem;
  font-weight: bold;
  color: var(--text-primary);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  margin: 0;
  letter-spacing: 2px;
  animation: glow 3s ease-in-out infinite alternate;
}

.game-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 8px 0 0 0;
  font-style: italic;
}

.form-toggle {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.toggle-buttons {
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
}

.auth-card,
.stats-card {
  border-radius: 16px;
  box-shadow: var(--shadow-primary);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.glass-solid {
  background: rgba(255, 255, 255, 0.4) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.auth-header {
  padding: 16px 16px 8px 16px;
}

.form-section {
  padding: 8px 16px 16px 16px;
}

.user-avatar {
  background: linear-gradient(45deg, var(--accent-color), var(--success-color));
  margin-bottom: 12px;
}

.welcome-text {
  margin: 0;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1.3rem;
}

.auth-subtitle {
  color: var(--text-secondary);
  margin: 4px 0 0 0;
  font-size: 0.85rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-input {
  margin-bottom: 4px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;
}

.forgot-btn {
  font-size: 0.75rem;
  padding: 2px 6px;
  min-height: auto;
}

.auth-button,
.play-button {
  width: 100%;
  height: 44px;
  border-radius: 22px;
  font-weight: bold;
  font-size: 1rem;
  margin-top: 8px;
}

.user-stats-card {
  margin-top: 15px;
  animation: slideInUp 0.6s ease-out;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  margin: 15px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.theme-selector-btn {
  position: fixed;
  top: 15px;
  right: 15px;
  z-index: 100;
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
  font-size: 2rem;
  font-weight: bold;
  color: var(--particle-color);
  animation: float 6s ease-in-out infinite;
  opacity: 0.6;
}

.floating-letter:nth-child(1) {
  top: 15%;
  left: 10%;
  animation-delay: 0s;
}

.floating-letter:nth-child(2) {
  top: 25%;
  right: 15%;
  animation-delay: 1s;
}

.floating-letter:nth-child(3) {
  bottom: 35%;
  left: 20%;
  animation-delay: 2s;
}

.floating-letter:nth-child(4) {
  bottom: 25%;
  right: 10%;
  animation-delay: 3s;
}

.floating-letter:nth-child(5) {
  top: 60%;
  left: 8%;
  animation-delay: 4s;
}

.success-dialog {
  max-width: 320px;
  width: 90%;
  margin: 0 auto;
  border-radius: 16px;
}

.success-dialog h3 {
  color: var(--text-primary);
  margin: 15px 0 8px 0;
  font-size: 1.2rem;
}

.success-dialog p {
  color: var(--text-secondary);
  margin-bottom: 15px;
  font-size: 0.9rem;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(8deg);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .game-title {
    font-size: 2.2rem;
  }

  .login-container {
    padding: 12px;
    max-width: 100%;
  }

  .theme-selector-btn {
    top: 12px;
    right: 12px;
  }

  .floating-letter {
    font-size: 1.5rem;
  }
}

@media (max-height: 700px) {
  .logo-section {
    margin-bottom: 15px;
  }

  .game-title {
    font-size: 2.4rem;
  }

  .auth-header {
    padding: 12px 16px 6px 16px;
  }

  .user-avatar {
    width: 50px;
    height: 50px;
    margin-bottom: 8px;
  }

  .welcome-text {
    font-size: 1.1rem;
  }
}
</style>
