import React from 'react';
import { Moon, SunMedium } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
    className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`inline-flex items-center justify-center rounded-full border border-nardo-light/20 bg-white/85 p-2.5 text-black shadow-sm backdrop-blur transition-colors hover:bg-nardo-grey/10 dark:bg-dark-card/85 dark:text-off-white ${className}`.trim()}
            aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
        >
            {theme === 'dark' ? <SunMedium size={18} /> : <Moon size={18} />}
        </button>
    );
};

export default ThemeToggle;
