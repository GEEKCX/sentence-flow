import { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      Object.entries(shortcuts).forEach(([shortcutKey, handler]) => {
        const [mainKey, modifiers = ''] = shortcutKey.split('+');

        const hasCtrl = modifiers.includes('ctrl');
        const hasShift = modifiers.includes('shift');
        const hasAlt = modifiers.includes('alt');

        if (
          key.toLowerCase() === mainKey.toLowerCase() &&
          ctrl === hasCtrl &&
          shift === hasShift &&
          alt === hasAlt &&
          !e.target.matches('input, textarea, [contenteditable]')
        ) {
          e.preventDefault();
          handler(e);
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};

export default useKeyboardShortcuts;
