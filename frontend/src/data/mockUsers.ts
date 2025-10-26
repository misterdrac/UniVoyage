export interface User {
  id: string;
  email: string;
  password: string; // Only for mock - backend should never return this
  // Travel-focused user profile
  profile: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phoneNumber: string;
    countryOfResidence: string;
    profilePicture?: string; // URL to profile picture
    languages: string[]; // Array of language codes (e.g., ['en', 'es', 'fr'])
    countriesVisited: string[]; // Array of country codes (e.g., ['US', 'CA', 'MX'])
    interests: string[]; // Travel interests (e.g., ['history', 'party', 'nature', 'culture'])
  };
  // System fields
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

export const mockUsers: User[] = [
  {
    id: "1",
    email: "john.doe@example.com",
    password: "Password123",
    profile: {
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "1990-05-15",
      phoneNumber: "+1-555-0123",
      countryOfResidence: "US",
      profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      languages: ["en", "es"],
      countriesVisited: ["US", "CA", "MX", "FR", "IT"],
      interests: ["history", "culture", "food", "photography"]
    },
    createdAt: "2024-01-01T00:00:00Z",
    lastLoginAt: "2024-01-15T10:30:00Z",
    isActive: true
  },
  {
    id: "2",
    email: "jane.smith@example.com",
    password: "SecurePass456",
    profile: {
      firstName: "Jane",
      lastName: "Smith",
      dateOfBirth: "1985-12-03",
      phoneNumber: "+1-555-0456",
      countryOfResidence: "CA",
      profilePicture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      languages: ["en", "fr"],
      countriesVisited: ["CA", "US", "UK", "DE", "JP", "AU"],
      interests: ["party", "nightlife", "adventure", "beaches"]
    },
    createdAt: "2024-01-02T00:00:00Z",
    lastLoginAt: "2024-01-14T15:45:00Z",
    isActive: true
  }
];

// Simple authentication functions
export const authenticateUser = (email: string, password: string): User | null => {
  const user = mockUsers.find(u => u.email === email && u.password === password && u.isActive);
  if (user) {
    // Update last login time
    user.lastLoginAt = new Date().toISOString();
  }
  return user || null;
};

export const createUser = (email: string, password: string): User => {
  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const newUser: User = {
    id: Date.now().toString(),
    email,
    password,
    profile: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      phoneNumber: "",
      countryOfResidence: "",
      profilePicture: undefined,
      languages: [],
      countriesVisited: [],
      interests: []
    },
    createdAt: new Date().toISOString(),
    isActive: true,
    lastLoginAt: undefined
  };
  mockUsers.push(newUser);
  return newUser;
};

export const getUserByEmail = (email: string): User | null => {
  return mockUsers.find(u => u.email === email) || null;
};

export const updateUserProfile = (userId: string, profileData: Partial<User['profile']>): User | null => {
  const user = mockUsers.find(u => u.id === userId);
  if (user) {
    user.profile = { ...user.profile, ...profileData }; // <- ispravno spajanje
    return user;
  }
  return null;
};
;
