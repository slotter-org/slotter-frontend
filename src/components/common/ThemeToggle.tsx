import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeProvider';

interface ThemeToggleProps {
  iconSize?: number;
}

export function ThemeToggle({ iconSize = 18 }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  function toggleTheme() {
    // Simplified: if light => dark, if dark => light, else => light
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      // system => just switch to light or dark
      setTheme('light');
    }
  }

  // If current theme is 'light' => show moon, else show sun
  const icon = theme === 'light' ? <Moon size={iconSize} /> : <Sun size={iconSize} />;

  return (
    <Button variant="ghost" onClick={toggleTheme}>
      {icon}
    </Button>
  );
}

