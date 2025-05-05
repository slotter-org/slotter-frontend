import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeProvider';

interface ThemeToggleProps {
  iconSize?: number;
  extended: boolean;
}

export function ThemeToggle({ iconSize = 18, extended = false, }: ThemeToggleProps) {
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

  const icon = 
    theme === 'light' ? <Moon size={iconSize} /> : <Sun size={iconSize} />;

  if (extended) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={toggleTheme}>
          {icon}
        </Button>
        <span>Theme</span>
      </div>
    );
  }

  return (
    <Button variant="ghost" onClick={toggleTheme}>
      {icon}
    </Button>
  );
}

