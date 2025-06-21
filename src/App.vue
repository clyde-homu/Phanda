<template>
  <div id="app">
    <ParticleEffects ref="particleEffectsRef" />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useThemeStore } from './stores/theme-store';
import ParticleEffects from './components/ParticleEffects.vue';

const themeStore = useThemeStore();
const particleEffectsRef = ref<InstanceType<typeof ParticleEffects>>();

onMounted(async () => {
  try {
    // Initialize theme system
    themeStore.initializeTheme();

    // Set status bar to overlay mode (content goes behind status bar)
    await StatusBar.setOverlaysWebView({ overlay: true });

    // Make status bar transparent
    await StatusBar.setBackgroundColor({ color: '#00000000' });

    // Set status bar style to light content
    await StatusBar.setStyle({ style: Style.Light });

    // Alternatively, you can completely hide it (uncomment the line below)
    await StatusBar.hide();
  } catch (error) {
    console.log('StatusBar configuration error:', error);
  }
});

// Expose particle effects for global use
defineExpose({
  triggerSuccessBurst: (x?: number, y?: number) => {
    particleEffectsRef.value?.triggerSuccessBurst(x, y);
  },
});
</script>

<style>
#app {
  position: relative;
  min-height: 100vh;
  background: var(--primary-bg);
}
</style>
