import type { CountryDto, HobbyDto, LanguageDto, User, VisitedCountryDto } from '@/types/user';

interface MockUser extends User {
  password: string;
}

const makeVisited = (country: CountryDto, date: string): VisitedCountryDto => ({
  isoCode: country.isoCode,
  countryName: country.countryName,
  dateOfVisit: date,
});

const cloneUser = (user: MockUser): User => ({
  id: user.id,
  name: user.name,
  surname: user.surname,
  email: user.email,
  role: user.role,
  countryOfOrigin: user.countryOfOrigin,
  hobbies: [...user.hobbies],
  languages: [...user.languages],
  visitedCountries: user.visitedCountries.map(vc => ({
    isoCode: vc.isoCode,
    countryName: vc.countryName,
    dateOfVisit: vc.dateOfVisit,
  })),
  profileImage: user.profileImage,
  dateOfRegister: user.dateOfRegister,
  dateOfLastSignin: user.dateOfLastSignin,
});

const createHobby = (id: number, hobbyName: string): HobbyDto => ({ id, hobbyName });
const createLanguage = (langCode: string, langName: string): LanguageDto => ({ langCode, langName });
const createCountry = (isoCode: string, countryName: string): CountryDto => ({ isoCode, countryName });

const us = createCountry('US', 'United States');
const ca = createCountry('CA', 'Canada');
const fr = createCountry('FR', 'France');
const mx = createCountry('MX', 'Mexico');
const it = createCountry('IT', 'Italy');
const gb = createCountry('GB', 'United Kingdom');
const de = createCountry('DE', 'Germany');
const jp = createCountry('JP', 'Japan');
const au = createCountry('AU', 'Australia');

export const mockUsers: MockUser[] = [
  {
    id: 1,
    name: "John",
    surname: "Doe",
    email: "john.doe@example.com",
    password: "Password123",
    hobbies: [
      createHobby(1, "History"),
      createHobby(2, "Culture"),
      createHobby(3, "Food & Dining"),
      createHobby(4, "Photography"),
    ],
    languages: [
      createLanguage("en", "English"),
      createLanguage("es", "Spanish"),
    ],
    countryOfOrigin: us,
    visitedCountries: [
      makeVisited(us, "2023-01-01T00:00:00Z"),
      makeVisited(ca, "2023-02-10T00:00:00Z"),
      makeVisited(mx, "2023-03-15T00:00:00Z"),
      makeVisited(fr, "2023-04-20T00:00:00Z"),
      makeVisited(it, "2023-05-05T00:00:00Z"),
    ],
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    dateOfRegister: "2023-01-01T00:00:00Z",
    dateOfLastSignin: "2024-01-15T10:30:00Z",
    role: "USER",
  },
  {
    id: 2,
    name: "Jane",
    surname: "Smith",
    email: "jane.smith@example.com",
    password: "SecurePass456",
    hobbies: [
      createHobby(5, "Nightlife"),
      createHobby(6, "Adventure"),
      createHobby(7, "Beaches"),
    ],
    languages: [
      createLanguage("en", "English"),
      createLanguage("fr", "French"),
    ],
    countryOfOrigin: ca,
    visitedCountries: [
      makeVisited(ca, "2023-01-15T00:00:00Z"),
      makeVisited(us, "2023-02-18T00:00:00Z"),
      makeVisited(gb, "2023-03-12T00:00:00Z"),
      makeVisited(de, "2023-04-08T00:00:00Z"),
      makeVisited(jp, "2023-05-23T00:00:00Z"),
      makeVisited(au, "2023-06-30T00:00:00Z"),
    ],
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    dateOfRegister: "2024-01-02T00:00:00Z",
    dateOfLastSignin: "2024-01-14T15:45:00Z",
    role: "USER",
  },
];

export const authenticateUser = (email: string, password: string): User | null => {
  const user = mockUsers.find(u => u.email === email && u.password === password);
  if (!user) {
    return null;
  }
  user.dateOfLastSignin = new Date().toISOString();
  return cloneUser(user);
};

export const createUser = (
  email: string,
  password: string,
  name?: string,
  surname?: string,
  hobbyIds?: number[],
  languageCodes?: string[]
): User => {
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const newUser: MockUser = {
    id: Date.now(),
    name: name ?? "",
    surname,
    email,
    password,
    hobbies: (hobbyIds ?? []).map(id => createHobby(id, `Interest ${id}`)),
    languages: (languageCodes ?? []).map(code => createLanguage(code, code)),
    countryOfOrigin: undefined,
    visitedCountries: [],
    profileImage: undefined,
    dateOfRegister: new Date().toISOString(),
    dateOfLastSignin: undefined,
    role: "USER",
  };

  mockUsers.push(newUser);
  return cloneUser(newUser);
};

export const getUserByEmail = (email: string): User | null => {
  const user = mockUsers.find(u => u.email === email);
  return user ? cloneUser(user) : null;
};

export const updateUserProfile = (userId: number, profileData: Partial<User>): User | null => {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) {
    return null;
  }

  Object.assign(user, {
    ...profileData,
    hobbies: profileData.hobbies ?? user.hobbies,
    languages: profileData.languages ?? user.languages,
    visitedCountries: profileData.visitedCountries ?? user.visitedCountries,
  });

  return cloneUser(user);
};
