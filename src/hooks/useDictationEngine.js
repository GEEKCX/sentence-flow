import { useTypingStore } from '../store/typingStore.js';
import { useTypingSound } from './useTypingSound.js';
import { useEffect, useCallback } from 'react';

export const useDictationEngine = () => {
  const typedChars = useTypingStore((s) => s.typedChars);
  const addChar = useTypingStore((s) => s.addChar);
  const removeChar = useTypingStore((s) => s.removeChar);
  const nextSentence = useTypingStore((s) => s.nextSentence);
  const isCompleted = useTypingStore((s) => s.isCompleted);
  const setCompleted = useTypingStore((s) => s.setCompleted);
  const resetCurrent = useTypingStore((s) => s.resetCurrent);
  const currentSentence = useTypingStore((s) => s.currentSentence);
  const setPeeking = useTypingStore((s) => s.setPeeking);

  const { playClick } = useTypingSound();

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleKeyDown = (e) => {
    const target = e.target;
    const isInputActive = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
    if (isInputActive) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      nextSentence();
      const t = currentSentence()?.sentence || '';
      if (t) speak(t);
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      removeChar();
      return;
    }

    if (e.ctrlKey) return;

    if (e.key === ' ') {
      e.preventDefault();
      addChar(' ');
      playClick();
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      playClick();
      addChar(e.key);
    }
  };

  useEffect(() => {
    const keyDownHandler = (e) => {
      handleKeyDown(e);
    };

    window.addEventListener('keydown', keyDownHandler);
    return () => {
      window.removeEventListener('keydown', keyDownHandler);
    };
  }, []);

  const restartSentence = useCallback(() => {
    resetCurrent();
  }, [resetCurrent]);

  const togglePeek = useCallback(() => {
    setPeeking((state) => !state);
  }, [setPeeking]);

  return {
    speak,
    restartSentence,
    togglePeek
  };
};
