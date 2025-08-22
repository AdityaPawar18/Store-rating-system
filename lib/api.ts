// API utility functions for frontend-backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: this.getAuthHeaders(),
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || "Request failed" }
      }

      return { data }
    } catch (error) {
      return { error: "Network error occurred" }
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: { name: string; email: string; password: string; address: string }) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async getProfile() {
    return this.request("/auth/profile")
  }

  // Store endpoints
  async getStores(search?: string) {
    const params = search ? `?search=${encodeURIComponent(search)}` : ""
    return this.request(`/stores${params}`)
  }

  async createStore(storeData: { name: string; email: string; address: string; owner_id: number }) {
    return this.request("/stores", {
      method: "POST",
      body: JSON.stringify(storeData),
    })
  }

  // Rating endpoints
  async submitRating(storeId: number, rating: number) {
    return this.request("/ratings", {
      method: "POST",
      body: JSON.stringify({ store_id: storeId, rating }),
    })
  }

  async updateRating(ratingId: number, rating: number) {
    return this.request(`/ratings/${ratingId}`, {
      method: "PUT",
      body: JSON.stringify({ rating }),
    })
  }

  // Admin endpoints
  async getDashboardStats() {
    return this.request("/admin/dashboard")
  }

  async getUsers(filters?: { role?: string; search?: string }) {
    const params = new URLSearchParams()
    if (filters?.role) params.append("role", filters.role)
    if (filters?.search) params.append("search", filters.search)
    const queryString = params.toString()
    return this.request(`/admin/users${queryString ? `?${queryString}` : ""}`)
  }

  async createUser(userData: { name: string; email: string; password: string; address: string; role: string }) {
    return this.request("/admin/users", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async updatePassword(newPassword: string) {
    return this.request("/users/password", {
      method: "PUT",
      body: JSON.stringify({ password: newPassword }),
    })
  }
}

export const api = new ApiClient()
