import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const HOME_PATH = "/";

const useAuthMock = vi.fn();

vi.mock("@/config/routes", () => ({
  ROUTE_PATHS: { HOME: "/" },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
  });

  it("redirects unauthenticated users to home", () => {
    useAuthMock.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <Routes>
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div>Secret profile</div>
              </ProtectedRoute>
            }
          />
          <Route path={HOME_PATH} element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.queryByText("Secret profile")).not.toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    useAuthMock.mockReturnValue({
      user: {
        id: 1,
        email: "a@b.com",
        name: "A",
        role: "USER",
        hobbies: [],
        languages: [],
        visitedCountries: [],
      },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <Routes>
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div>Secret profile</div>
              </ProtectedRoute>
            }
          />
          <Route path={HOME_PATH} element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Secret profile")).toBeInTheDocument();
  });
});
