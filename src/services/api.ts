import { api } from '../boot/axios';

// Types
export interface Language {
  id: string;
  name: string;
  flag: string;
  color: string;
  isUnlocked: boolean;
}

export interface Level {
  id: number;
  languageId: string;
  name: string;
  letters: string[];
  targetWords: string[];
  landmark: string;
  orderIndex: number;
}

export interface UserProgress {
  id: string;
  userId: string;
  languageId: string;
  currentLevel: number;
  completedLevels: number[];
  totalStars: number;
  hintsUsed: number;
}

export interface UserLevelProgress {
  id: string;
  userId: string;
  levelId: number;
  isCompleted: boolean;
  stars: number;
  hintsUsed: number;
}

export interface CompleteLevelData {
  levelId: number;
  languageId: string;
  stars: number;
  hintsUsed: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
}

// Language API
export const languageApi = {
  async getAll(): Promise<Language[]> {
    const response = await api.get<ApiResponse<Language[]>>('/languages');
    return response.data.data;
  },

  async getById(id: string): Promise<Language> {
    const response = await api.get<ApiResponse<Language>>(`/languages/${id}`);
    return response.data.data;
  },
};

// Level API
export const levelApi = {
  async getByLanguage(languageId?: string): Promise<Level[]> {
    const params = languageId ? { languageId } : {};
    const response = await api.get<ApiResponse<Level[]>>('/levels', { params });
    return response.data.data;
  },

  async getById(id: number): Promise<Level> {
    const response = await api.get<ApiResponse<Level>>(`/levels/${id}`);
    return response.data.data;
  },
};

// Progress API
export const progressApi = {
  async getAll(): Promise<UserProgress[]> {
    const response = await api.get<ApiResponse<UserProgress[]>>('/progress');
    return response.data.data;
  },

  async getByLanguage(languageId: string): Promise<UserProgress> {
    const response = await api.get<ApiResponse<UserProgress>>(`/progress/${languageId}`);
    return response.data.data;
  },

  async completeLevel(data: CompleteLevelData): Promise<UserProgress> {
    const response = await api.post<ApiResponse<UserProgress>>('/progress/complete-level', data);
    return response.data.data;
  },

  async useHint(): Promise<{ gemsUsed: number; remainingGems: number }> {
    const response =
      await api.post<ApiResponse<{ gemsUsed: number; remainingGems: number }>>(
        '/progress/use-hint'
      );
    return response.data.data;
  },

  async addGems(amount: number): Promise<{ totalGems: number }> {
    const response = await api.post<ApiResponse<{ totalGems: number }>>('/progress/add-gems', {
      amount,
    });
    return response.data.data;
  },
};

// User API
export const userApi = {
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data.data;
  },

  async getStats() {
    const response = await api.get('/users/stats');
    return response.data.data;
  },
};
