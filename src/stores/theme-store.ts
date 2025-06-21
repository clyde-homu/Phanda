import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Theme {
  id: string;
  name: string;
  description: string;
  icon: string;
  preview: string;
  unlocked: boolean;
  unlockLevel?: number;
}

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref('ocean');
  const unlockedThemes = ref<string[]>(['ocean', 'forest']);

  const themes: Theme[] = [
    {
      id: 'ocean',
      name: 'Ocean Depths',
      description: 'Dive into the mysterious depths of the ocean',
      icon: '🌊',
      preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      unlocked: true,
    },
    {
      id: 'forest',
      name: 'Enchanted Forest',
      description: 'Explore the magical woodland realm',
      icon: '🌲',
      preview: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
      unlocked: true,
    },
    {
      id: 'sunset',
      name: 'Golden Sunset',
      description: 'Bask in the warm glow of twilight',
      icon: '🌅',
      preview: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
      unlocked: false,
      unlockLevel: 5,
    },
    {
      id: 'galaxy',
      name: 'Cosmic Galaxy',
      description: 'Journey through the stars and nebulae',
      icon: '🌌',
      preview: 'linear-gradient(135deg, #2c1810 0%, #8b4a9c 50%, #1a0033 100%)',
      unlocked: false,
      unlockLevel: 10,
    },
    {
      id: 'neon',
      name: 'Neon Nights',
      description: 'Enter the cyberpunk digital world',
      icon: '⚡',
      preview: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      unlocked: false,
      unlockLevel: 15,
    },
  ];

  const availableThemes = computed(() =>
    themes.map((theme) => ({
      ...theme,
      unlocked: unlockedThemes.value.includes(theme.id),
    })),
  );

  const currentThemeData = computed(
    () => themes.find((theme) => theme.id === currentTheme.value) || themes[0],
  );

  const setTheme = (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId);
    if (theme && unlockedThemes.value.includes(themeId)) {
      currentTheme.value = themeId;
      document.documentElement.setAttribute('data-theme', themeId);
      localStorage.setItem('phanda-theme', themeId);
    }
  };

  const unlockTheme = (themeId: string) => {
    if (!unlockedThemes.value.includes(themeId)) {
      unlockedThemes.value.push(themeId);
      localStorage.setItem('phanda-unlocked-themes', JSON.stringify(unlockedThemes.value));
    }
  };

  const checkThemeUnlocks = (currentLevel: number) => {
    themes.forEach((theme) => {
      if (
        theme.unlockLevel &&
        currentLevel >= theme.unlockLevel &&
        !unlockedThemes.value.includes(theme.id)
      ) {
        unlockTheme(theme.id);
      }
    });
  };

  const initializeTheme = () => {
    // Load saved theme
    const savedTheme = localStorage.getItem('phanda-theme');
    if (savedTheme && themes.find((t) => t.id === savedTheme)) {
      currentTheme.value = savedTheme;
    }

    // Load unlocked themes
    const savedUnlocked = localStorage.getItem('phanda-unlocked-themes');
    if (savedUnlocked) {
      try {
        unlockedThemes.value = JSON.parse(savedUnlocked);
      } catch (e) {
        console.error('Failed to parse unlocked themes:', e);
      }
    }

    // Apply theme
    document.documentElement.setAttribute('data-theme', currentTheme.value);
  };

  return {
    currentTheme,
    themes: availableThemes,
    currentThemeData,
    setTheme,
    unlockTheme,
    checkThemeUnlocks,
    initializeTheme,
  };
});
