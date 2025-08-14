export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}


