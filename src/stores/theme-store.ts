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
  const currentTheme = ref('blaze');
  const unlockedThemes = ref<string[]>(['blaze']);

  const themes: Theme[] = [
    {
      id: 'blaze',
      name: 'UNISA Academic',
      description: 'Professional blue representing trust and intellect, with vibrant orange for innovation and creativity',
      icon: '🎓📚',
      preview: 'linear-gradient(135deg, #001a4d 0%, #003d82 50%, #ff6600 100%)',
      unlocked: true,
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
    // Only accept 'blaze' theme since it's the only one
    if (themeId === 'blaze') {
      currentTheme.value = 'blaze';
      // No need to set data-theme attribute since we only have one theme
      document.documentElement.removeAttribute('data-theme');
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
    // Always use the UNISA Academic theme - it's the only one!
    currentTheme.value = 'blaze';
    unlockedThemes.value = ['blaze'];
    
    // Apply theme - we remove the data-theme attribute since we only have one theme
    document.documentElement.removeAttribute('data-theme');
    
    // Clean up old theme data from localStorage
    localStorage.removeItem('phanda-theme');
    localStorage.removeItem('phanda-unlocked-themes');
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
