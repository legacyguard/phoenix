import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "./button";

const ThemeSwitcher = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial theme preference
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    setIsDarkMode(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    document.documentElement.classList.toggle("dark", newIsDarkMode);
    localStorage.setItem("theme", newIsDarkMode ? "dark" : "light");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
};

export default ThemeSwitcher;
