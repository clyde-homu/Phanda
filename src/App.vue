<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { StatusBar, Style } from '@capacitor/status-bar';

onMounted(async () => {
  try {
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
</script>
