import { useTheme } from '../context/ThemeProvider';

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="
        flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
        border border-gray-300 dark:border-cyan-500/30
        bg-white dark:bg-gray-900
        text-gray-700 dark:text-cyan-400
        hover:border-gray-400 dark:hover:border-cyan-400
        transition-all duration-300
      "
    >
      {isDark ? '☀ Light' : '◑ Dark'}
    </button>
  );
};

export default ThemeToggle;