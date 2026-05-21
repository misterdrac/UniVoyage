import { Shield } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { AuthSectionBoundary } from "@/components/auth/AuthSectionBoundary";
import { signInMethodLabel } from "@/lib/auth/providerLabels";
import type { LinkedIdentity, SignInMethod } from "@/types/auth";

interface SignInMethodsCardProps {
  identities: LinkedIdentity[];
  lastSignInMethod?: SignInMethod | null;
  isLoading?: boolean;
  error?: string | null;
}

export function SignInMethodsCard({
  identities,
  lastSignInMethod,
  isLoading,
  error,
}: SignInMethodsCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Sign-in methods
        </CardTitle>
        <CardDescription>
          Ways you can sign in to your account (read-only)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthSectionBoundary
          isLoading={isLoading}
          error={error}
          loadingMessage="Loading sign-in methods…"
        >
          {identities.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No linked sign-in methods found.
            </p>
          ) : (
            <ul className="space-y-3" aria-label="Linked sign-in methods">
              {identities.map((identity) => {
                const isLast =
                  lastSignInMethod != null &&
                  identity.provider === lastSignInMethod;
                return (
                  <li
                    key={identity.provider}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {identity.label}
                      </p>
                      {identity.linkedAt && (
                        <p className="text-xs text-muted-foreground">
                          Linked{" "}
                          {new Date(identity.linkedAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </p>
                      )}
                    </div>
                    {isLast && (
                      <span className="text-xs font-medium rounded-full bg-primary/10 text-primary px-2 py-0.5">
                        Last used
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {lastSignInMethod &&
            !identities.some((i) => i.provider === lastSignInMethod) && (
              <p className="text-xs text-muted-foreground mt-3">
                Last sign-in: {signInMethodLabel(lastSignInMethod)}
              </p>
            )}
        </AuthSectionBoundary>
      </CardContent>
    </Card>
  );
}
