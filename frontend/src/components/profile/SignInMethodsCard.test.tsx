import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SignInMethodsCard } from "./SignInMethodsCard";

describe("SignInMethodsCard", () => {
  it("renders linked providers without internal ids", () => {
    render(
      <SignInMethodsCard
        identities={[
          {
            provider: "password",
            label: "Email & password",
            linkedAt: "2024-01-01T00:00:00Z",
          },
          {
            provider: "google",
            label: "Google",
            linkedAt: "2024-06-01T00:00:00Z",
          },
        ]}
        lastSignInMethod="google"
      />,
    );

    expect(screen.getByText("Google")).toBeInTheDocument();
    expect(screen.getByText("Last used")).toBeInTheDocument();
    expect(screen.queryByText(/sub-|providerSubject/i)).not.toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<SignInMethodsCard identities={[]} isLoading />);
    expect(screen.getByText(/loading sign-in methods/i)).toBeInTheDocument();
  });
});
