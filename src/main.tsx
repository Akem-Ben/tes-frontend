import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { setSeeder } from "@/shared/lib/mockStore";
import { seed } from "@/shared/lib/seed";
import { App } from "./app/App";

setSeeder(seed);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
