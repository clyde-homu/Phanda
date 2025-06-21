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
        <q-card class="auth-card glass">
          <q-card-section class="text-center">
            <q-avatar size="80px" class="user-avatar">
              <q-icon name="person" size="40px" />
            </q-avatar>
            <h3 class="welcome-text">Welcome Back!</h3>
            <p class="auth-subtitle">Sign in to continue your word adventure</p>
          </q-card-section>

          <q-card-section>
            <q-form @submit="handleLogin" class="auth-form">
              <q-input
                v-model="loginForm.email"
                type="email"
                label="Email"
                outlined
                :rules="[
                  (val) => !!val || 'Email is required',
                  (val) => isValidEmail(val) || 'Invalid email format',
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
                :rules="[(val) => !!val || 'Password is required']"
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
                <q-checkbox v-model="rememberMe" label="Remember me" />
                <q-btn flat color="primary" label="Forgot password?" class="forgot-btn" />
              </div>

              <q-btn
                type="submit"
                push
                size="lg"
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
        <q-card class="auth-card glass">
          <q-card-section class="text-center">
            <q-avatar size="80px" class="user-avatar">
              <q-icon name="person_add" size="40px" />
            </q-avatar>
            <h3 class="welcome-text">Join Phanda!</h3>
            <p class="auth-subtitle">Create your account and start your word journey</p>
          </q-card-section>

          <q-card-section>
            <q-form @submit="handleRegister" class="auth-form">
              <q-input
                v-model="registerForm.username"
                label="Username"
                outlined
                :rules="[
                  (val) => !!val || 'Username is required',
                  (val) => val.length >= 3 || 'Username must be at least 3 characters',
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
                :rules="[
                  (val) => !!val || 'Email is required',
                  (val) => isValidEmail(val) || 'Invalid email format',
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
                :rules="[
                  (val) => !!val || 'Password is required',
                  (val) => val.length >= 6 || 'Password must be at least 6 characters',
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
                :rules="[
                  (val) => !!val || 'Please confirm your password',
                  (val) => val === registerForm.password || 'Passwords do not match',
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
                <q-checkbox v-model="agreeToTerms" label="I agree to the Terms of Service" />
              </div>

              <q-btn
                type="submit"
                push
                size="lg"
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
        <q-card class="stats-card glass">
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
      <q-card class="success-dialog glass">
        <q-card-section class="text-center">
          <q-icon name="check_circle" size="60px" color="green" />
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
import ParticleEffects from '../components/ParticleEffects.vue';
import ThemeSelector from '../components/ThemeSelector.vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const router = useRouter();
const gameStore = useGameStore();
const themeStore = useThemeStore();

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

const { userProgress } = gameStore;

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

// Simulate login
const handleLogin = async () => {
  isLoading.value = true;
  await triggerHapticFeedback(ImpactStyle.Medium);

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Simulate successful login
  if (loginForm.value.email && loginForm.value.password) {
    successMessage.value = 'Login Successful!';
    showSuccessDialog.value = true;
    isLoggedIn.value = true;

    // Store user data (simulate)
    localStorage.setItem(
      'phanda-user',
      JSON.stringify({
        email: loginForm.value.email,
        username: loginForm.value.email.split('@')[0],
        loginTime: new Date().toISOString(),
      }),
    );

    gameStore.authenticateUser();
  }

  isLoading.value = false;
};

// Simulate registration
const handleRegister = async () => {
  isLoading.value = true;
  await triggerHapticFeedback(ImpactStyle.Medium);

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Simulate successful registration
  if (isRegisterFormValid.value) {
    successMessage.value = 'Account Created Successfully!';
    showSuccessDialog.value = true;
    isLoggedIn.value = true;

    // Store user data (simulate)
    localStorage.setItem(
      'phanda-user',
      JSON.stringify({
        email: registerForm.value.email,
        username: registerForm.value.username,
        registrationTime: new Date().toISOString(),
      }),
    );

    gameStore.authenticateUser();

    // Initialize new user progress
    gameStore.initializeNewUser();
  }

  isLoading.value = false;
};

const startGame = async () => {
  await triggerHapticFeedback(ImpactStyle.Heavy);
  await router.push('/levels');
};

const proceedToGame = async () => {
  showSuccessDialog.value = false;
  await new Promise((resolve) => setTimeout(resolve, 500));
  await startGame();
};

const handleThemeChanged = (themeId: string) => {
  console.log('Theme changed to:', themeId);
};

// Check if user is already logged in
onMounted(() => {
  gameStore.loadProgress();
  themeStore.initializeTheme();

  const savedUser = localStorage.getItem('phanda-user');
  if (savedUser) {
    isLoggedIn.value = true;
    gameStore.authenticateUser();
  }
});
</script>

<style scoped>
.login-page {
  background: var(--primary-bg);
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
  margin-bottom: 30px;
}

.game-title {
  font-size: 3.5rem;
  font-weight: bold;
  color: var(--text-primary);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  margin: 0;
  letter-spacing: 2px;
  animation: glow 3s ease-in-out infinite alternate;
}

.game-subtitle {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin: 10px 0 0 0;
  font-style: italic;
}

.form-toggle {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.toggle-buttons {
  border-radius: 25px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
}

.auth-card,
.stats-card {
  border-radius: 20px;
  box-shadow: var(--shadow-primary);
  backdrop-filter: blur(20px);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
}

.user-avatar {
  background: linear-gradient(45deg, var(--accent-color), var(--success-color));
  margin-bottom: 20px;
}

.welcome-text {
  margin: 0;
  color: var(--text-primary);
  font-weight: 600;
}

.auth-subtitle {
  color: var(--text-secondary);
  margin: 5px 0 0 0;
  font-size: 0.9rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-input {
  margin-bottom: 8px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
}

.forgot-btn {
  font-size: 0.8rem;
  padding: 4px 8px;
}

.auth-button,
.play-button {
  width: 100%;
  height: 50px;
  border-radius: 25px;
  font-weight: bold;
  font-size: 1.1rem;
  margin-top: 10px;
}

.user-stats-card {
  margin-top: 20px;
  animation: slideInUp 0.6s ease-out;
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
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.theme-selector-btn {
  position: fixed;
  top: 20px;
  right: 20px;
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
  font-size: 3rem;
  font-weight: bold;
  color: var(--particle-color);
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

.success-dialog {
  max-width: 350px;
  width: 90%;
  margin: 0 auto;
  border-radius: 20px;
}

.success-dialog h3 {
  color: var(--text-primary);
  margin: 20px 0 10px 0;
}

.success-dialog p {
  color: var(--text-secondary);
  margin-bottom: 20px;
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

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .game-title {
    font-size: 2.5rem;
  }

  .login-container {
    padding: 15px;
  }

  .theme-selector-btn {
    top: 15px;
    right: 15px;
  }
}
</style>
