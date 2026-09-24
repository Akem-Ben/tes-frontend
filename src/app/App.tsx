import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "./ErrorBoundary";
import { AppProviders } from "./providers";
import { AppRoutes } from "./routes";

export function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <AppRoutes />
        </BrowserRouter>
      </AppProviders>
    </ErrorBoundary>
  );
}
