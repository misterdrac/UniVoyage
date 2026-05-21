import type { ReactNode } from "react";
import univoyageIcon from "@/assets/univoyage_icon.svg";
import { PageFooterVersion } from "@/components/layout/PageFooterVersion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthStatusLayoutProps {
  title: string;
  description: string;
  icon: ReactNode;
  footer?: ReactNode;
}

/**
 * Full-screen auth flow status (OAuth callback, session check) aligned with
 * public pages (Contact, Quiz loading) and profile cards.
 */
export function AuthStatusLayout({
  title,
  description,
  icon,
  footer,
}: AuthStatusLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col px-4 sm:px-6 py-16">
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-3">
            <div className="flex justify-center items-center gap-3">
              <img
                src={univoyageIcon}
                alt="UniVoyage Logo"
                className="w-12 h-12 sm:w-14 sm:h-14"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              UniVoyage
            </h1>
          </div>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center space-y-4 pb-2">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                  <div className="relative p-4 rounded-full bg-primary/10 border-2 border-primary/20">
                    {icon}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl sm:text-2xl">{title}</CardTitle>
                <CardDescription className="text-base">
                  {description}
                </CardDescription>
              </div>
            </CardHeader>
            {footer && (
              <CardContent className="flex justify-center pt-0 pb-8">
                {footer}
              </CardContent>
            )}
          </Card>
        </div>
      </div>
      <footer className="py-6 text-center">
        <PageFooterVersion />
      </footer>
    </div>
  );
}
