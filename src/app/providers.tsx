import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeModeProvider } from "@/theme";
import { AuthProvider } from "@/features/auth";
import { queryClient } from "@/shared/lib";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeModeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeModeProvider>
  );
}
