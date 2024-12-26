import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

function getSystemTheme(): 'dark' | 'light' {
   return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
   const [theme, setTheme] = useState<Theme>(() => {
      // Get theme from localStorage or default to system
      const storedTheme = localStorage.getItem('theme') as Theme;
      return storedTheme || 'system';
   });

   useEffect(() => {
      const root = window.document.documentElement;

      // Remove old theme class
      root.classList.remove('light', 'dark');

      // Apply new theme
      const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;
      root.classList.add(effectiveTheme);

      // Store theme preference
      localStorage.setItem('theme', theme);
   }, [theme]);

   // Listen for system theme changes
   useEffect(() => {
      if (theme === 'system')
      {
         const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

         const handleChange = () => {
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(getSystemTheme());
         };

         mediaQuery.addEventListener('change', handleChange);
         return () => mediaQuery.removeEventListener('change', handleChange);
      }
   }, [theme]);

   return { theme, setTheme } as const;
}