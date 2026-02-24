import { useEffect, useCallback, useRef } from 'react';
import { useTypingStore } from '../store/typingStore';
import { useTypingSound } from './useTypingSound';

export const useTypingEngine = () => {
  const {
    typedChars,
    addChar,
    removeChar,
    incrementError,
    nextSentence,
    isCompleted,
    setCompleted,
    resetCurrent,
    currentSentence
  } = useTypingStore();

  const { playClick, playError } = useTypingSound();
  const handleKeyDownRef = useRef(null);

  const speak = useCallback((text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  useEffect(() => {
    const sentence = currentSentence()?.sentence || '';
    const typed = typedChars;

    if (typed.length === sentence.length && typed.toLowerCase() === sentence.toLowerCase() && !isCompleted) {
      setCompleted(true);
      playClick();
      setTimeout(() => {
        speak(sentence);
      }, 500);
    }
  }, [typedChars, currentSentence, isCompleted, setCompleted, playClick, speak]);

  const handleKeyDown = useCallback(
    (e) => {
      const target = e.target;
      const isInputActive = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (isInputActive) {
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        nextSentence();
        speak(currentSentence()?.sentence);
        return;
      }

      const sentence = currentSentence()?.sentence || '';
      const targetChar = sentence[typedChars.length] || '';

      if (e.key === ' ') {
        e.preventDefault();
        if (targetChar === ' ') {
          addChar(' ');
          playClick();
        } else {
          incrementError();
          playError();
        }
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        removeChar();
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        if (targetChar && e.key.toLowerCase() === targetChar.toLowerCase()) {
          addChar(e.key);
          playClick();
        } else {
          incrementError();
          playError();
        }
      }
    },
    [
      typedChars,
      addChar,
      removeChar,
      incrementError,
      nextSentence,
      currentSentence,
      speak,
      playClick,
      playError
    ]
  );

  useEffect(() => {
    handleKeyDownRef.current = handleKeyDown;
  }, [handleKeyDown]);

  useEffect(() => {
    const keyHandler = (e) => {
      if (handleKeyDownRef.current) {
        handleKeyDownRef.current(e);
      }
    };

    window.addEventListener('keydown', keyHandler);

    return () => {
      window.removeEventListener('keydown', keyHandler);
    };
  }, []);

  const restartSentence = useCallback(() => {
    resetCurrent();
  }, [resetCurrent]);

  return {
    speak,
    restartSentence
  };
};
