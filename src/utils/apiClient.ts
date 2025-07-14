// Utilitaire pour les appels API centralisés
interface User {
  id: number;
  email: string;
  type: 'papa' | 'maman' | 'admin';
}

interface LoginResponse {
  token: string;
  user: User;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api';
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { method = 'GET', body, token } = options;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = token;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Erreur HTTP ${response.status}`
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur réseau'
      };
    }
  }

  // Méthodes d'authentification
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth.php', {
      method: 'POST',
      body: { action: 'login', email, password }
    });
  }

  async logout(token: string) {
    return this.request('/auth.php', {
      method: 'POST',
      body: { action: 'logout' },
      token
    });
  }

  async verifyToken(token: string): Promise<ApiResponse<User>> {
    return this.request<User>('/auth.php', {
      method: 'POST',
      body: { action: 'verify' },
      token
    });
  }

  // Méthodes pour les photos
  async getPhotos(token: string, filters?: any) {
    return this.request('/photos.php', {
      method: 'POST',
      body: { action: 'get', ...filters },
      token
    });
  }

  async addPhoto(token: string, photoData: any) {
    return this.request('/photos.php', {
      method: 'POST',
      body: { action: 'add', ...photoData },
      token
    });
  }

  async updatePhoto(token: string, photoId: number, photoData: any) {
    return this.request('/photos.php', {
      method: 'POST',
      body: { action: 'update', id: photoId, ...photoData },
      token
    });
  }

  async deletePhoto(token: string, photoId: number) {
    return this.request('/photos.php', {
      method: 'POST',
      body: { action: 'delete', id: photoId },
      token
    });
  }

  // Méthodes pour les vidéos
  async getVideos(token: string, filters?: any) {
    return this.request('/videos.php', {
      method: 'POST',
      body: { action: 'get', ...filters },
      token
    });
  }

  async addVideo(token: string, videoData: any) {
    return this.request('/videos.php', {
      method: 'POST',
      body: { action: 'add', ...videoData },
      token
    });
  }

  // Méthodes pour le journal
  async getJournalEntries(token: string, filters?: any) {
    return this.request('/journal.php', {
      method: 'POST',
      body: { action: 'get', ...filters },
      token
    });
  }

  async addJournalEntry(token: string, entryData: any) {
    return this.request('/journal.php', {
      method: 'POST',
      body: { action: 'add', ...entryData },
      token
    });
  }

  // Méthodes pour les consultations
  async getConsultations(token: string, filters?: any) {
    return this.request('/consultations.php', {
      method: 'POST',
      body: { action: 'get', ...filters },
      token
    });
  }

  async addConsultation(token: string, consultationData: any) {
    return this.request('/consultations.php', {
      method: 'POST',
      body: { action: 'add', ...consultationData },
      token
    });
  }

  // Méthodes pour les événements
  async getEvents(token: string, filters?: any) {
    return this.request('/events.php', {
      method: 'POST',
      body: { action: 'get', ...filters },
      token
    });
  }

  async addEvent(token: string, eventData: any) {
    return this.request('/events.php', {
      method: 'POST',
      body: { action: 'add', ...eventData },
      token
    });
  }

  // Méthodes pour les likes
  async toggleLike(token: string, type: string, itemId: number) {
    return this.request('/likes.php', {
      method: 'POST',
      body: { action: 'toggle', type, item_id: itemId },
      token
    });
  }

  // Méthodes pour les commentaires
  async getComments(token: string, type: string, itemId: number) {
    return this.request('/comments.php', {
      method: 'POST',
      body: { action: 'get', type, item_id: itemId },
      token
    });
  }

  async addComment(token: string, type: string, itemId: number, content: string) {
    return this.request('/comments.php', {
      method: 'POST',
      body: { action: 'add', type, item_id: itemId, content },
      token
    });
  }
}

export const apiClient = new ApiClient();