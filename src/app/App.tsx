import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ThemeProvider } from "./context/ThemeContext";
import { BankProvider } from "./context/BankContext";
import React from "react";

export default function App(): React.ReactNode {
  return (
    <ThemeProvider>
      <BankProvider>
        <RouterProvider router={router} />
      </BankProvider>
    </ThemeProvider>
  );
}
