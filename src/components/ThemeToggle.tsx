"use client";



import { Moon, Sun } from "lucide-react";

import { useEffect, useState } from "react";



const THEME_KEY = "cloudlab-theme";



type Theme = "dark" | "light";



function applyTheme(theme: Theme) {

  document.documentElement.dataset.theme = theme;

  document.documentElement.style.colorScheme = theme;

}



export default function ThemeToggle() {

  const [theme, setTheme] = useState<Theme>("dark");



  useEffect(() => {

    const storedTheme = window.localStorage.getItem(THEME_KEY) as Theme | null;

    const preferredTheme: Theme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";

    const nextTheme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : preferredTheme;

    setTheme(nextTheme);

    applyTheme(nextTheme);

  }, []);



  const toggleTheme = () => {

    const nextTheme: Theme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);

    window.localStorage.setItem(THEME_KEY, nextTheme);

    applyTheme(nextTheme);

  };



  const isLight = theme === "light";



  return (

    <button

      type="button"

      className="theme-toggle"

      onClick={toggleTheme}

      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}

      title={isLight ? "Switch to dark mode" : "Switch to light mode"}

    >

      <span className="theme-toggle__icon theme-toggle__icon--sun"><Sun size={14} /></span>

      <span className="theme-toggle__icon theme-toggle__icon--moon"><Moon size={14} /></span>

      <span className="theme-toggle__thumb" />

    </button>

  );

}

