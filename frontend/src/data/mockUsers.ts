export interface User {
  id: string;
  name: string; // Single name field
  email: string;
  password: string; // Only for mock - backend should never return this
  hobbies: string[]; // Array of interests/hobbies (e.g., ['history', 'party', 'nature'])
  languages: string[]; // Array of language codes (e.g., ['en', 'es', 'fr'])
  country: string; // Country code (e.g., 'US', 'CA')
  visited: string[]; // Array of country codes visited (e.g., ['US', 'CA', 'MX'])
  profileImage?: string; // URL to profile picture
  dateOfRegister: string; // ISO timestamp
  dateOfLastSignin?: string; // ISO timestamp
  role: string; // User role (e.g., 'USER', 'ADMIN')
}

export const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    password: "Password123",
    hobbies: ["history", "culture", "food", "photography"],
    languages: ["en", "es"],
    country: "US",
    visited: ["US", "CA", "MX", "FR", "IT"],
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    dateOfRegister: "2024-01-01T00:00:00Z",
    dateOfLastSignin: "2024-01-15T10:30:00Z",
    role: "USER"
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    password: "SecurePass456",
    hobbies: ["party", "nightlife", "adventure", "beaches"],
    languages: ["en", "fr"],
    country: "CA",
    visited: ["CA", "US", "UK", "DE", "JP", "AU"],
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    dateOfRegister: "2024-01-02T00:00:00Z",
    dateOfLastSignin: "2024-01-14T15:45:00Z",
    role: "USER"
  }
];

// Simple authentication functions
export const authenticateUser = (email: string, password: string): User | null => {
  const user = mockUsers.find(u => u.email === email && u.password === password);
  if (user) {
    // Update last login time
    user.dateOfLastSignin = new Date().toISOString();
  }
  return user || null;
};

export const createUser = (email: string, password: string, name?: string, hobbies?: string[], languages?: string[]): User => {
  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const newUser: User = {
    id: Date.now().toString(),
    name: name || "",
    email,
    password,
    hobbies: hobbies || [],
    languages: languages || [],
    country: "",
    visited: [],
    profileImage: undefined,
    dateOfRegister: new Date().toISOString(),
    dateOfLastSignin: undefined,
    role: "USER"
  };
  mockUsers.push(newUser);
  return newUser;
};

export const getUserByEmail = (email: string): User | null => {
  return mockUsers.find(u => u.email === email) || null;
};

export const updateUserProfile = (userId: string, profileData: Partial<User>): User | null => {
  const user = mockUsers.find(u => u.id === userId);
  if (user) {
    Object.assign(user, profileData);
    return user;
  }
  return null;
};
