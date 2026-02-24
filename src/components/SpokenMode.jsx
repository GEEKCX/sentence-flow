import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTypingStore } from '../store/typingStore';
import { compareSpeech, calculateAccuracy } from '../utils/speechUtils';
import AudioVisualizer from './AudioVisualizer';

const SpokenMode = ({ currentSentence, onNextSentence, onRestart }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [wordStatuses, setWordStatuses] = useState([]);
  const [accuracy, setAccuracy] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  
  const recognitionRef = useRef(null);
  const { 
    recognitionLang, 
    ttsVoiceURI, 
    completedTextColor, 
    inputFontSize, 
    updateSentences 
  } = useTypingStore();

  const sentenceText = currentSentence?.sentence || currentSentence?.english || '';

  // Handle Audio Stream for Visualizer
  useEffect(() => {
    if (isListening) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          setMediaStream(stream);
        })
        .catch(err => {
          console.error("Microphone access denied for visualizer:", err);
          // Don't block functionality, just visualizer won't work
        });
    } else {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }
    }
  }, [isListening]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Browser does not support Speech Recognition.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = recognitionLang || 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access.');
      } else {
        setError(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      const currentText = (transcript + ' ' + finalTranscript + ' ' + interimTranscript).trim();
      // Only update transcript if we are listening (or just finished)
      // Actually we probably want to keep accumulating? 
      // Simplified: Just use the latest result for diffing.
      
      // Better approach for continuous:
      // Just take the full transcript from session start? 
      // results[i] is incremental? No, continuous returns all? 
      // Actually, let's just maintain a running transcript state.
      
      // Simplified: Just use interim + final of CURRENT session.
      // Reset transcript on start?
      
      const newTranscript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ');
        
      setTranscript(newTranscript);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [recognitionLang]);

  // Reset on new sentence
  useEffect(() => {
    setTranscript('');
    setIsCompleted(false);
    setAccuracy(0);
    setError(null);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [currentSentence?.id]);

  // Analyze Speech
  useEffect(() => {
    if (!sentenceText) return;
    
    const statuses = compareSpeech(sentenceText, transcript);
    setWordStatuses(statuses);
    
    const acc = calculateAccuracy(sentenceText, transcript);
    setAccuracy(acc);

    // Auto-complete if high accuracy
    if (acc >= 90 && !isCompleted) {
      setIsCompleted(true);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, [transcript, sentenceText, isCompleted]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript(''); // Clear previous try? Or append? Let's clear for now.
      recognitionRef.current?.start();
    }
  };

  const handlePlayTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sentenceText);
      utterance.lang = recognitionLang; // Use same lang as recognition
      
      // Apply selected voice
      if (ttsVoiceURI) {
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find(v => v.voiceURI === ttsVoiceURI);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }
      
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-12 relative">
      {/* Target Sentence Display */}
      <div className="flex flex-wrap justify-center gap-3 mb-6 px-4">
        {wordStatuses.map((item, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`text-3xl font-medium transition-colors duration-200 ${
              item.status === 'correct' 
                ? 'text-green-500' 
                : isCompleted ? 'text-red-400' : 'text-slate-700'
            }`}
            style={{ fontSize: `${inputFontSize + 0.5}rem` }}
          >
            {item.word}
          </motion.span>
        ))}
      </div>

      {/* Translation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xl text-slate-500 font-medium mb-10 text-center"
      >
        {currentSentence?.translation || currentSentence?.chinese}
      </motion.div>

      {/* Visualizer Area */}
      <div className="h-[80px] w-full flex justify-center items-center mb-2">
        <AnimatePresence mode="wait">
          {isListening && mediaStream ? (
            <motion.div
              key="viz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex justify-center"
            >
              <AudioVisualizer stream={mediaStream} isListening={isListening} />
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-slate-300 text-sm font-medium h-[80px] flex items-center"
            >
              Ready to listen...
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Real-time Transcript */}
      <div className="h-6 mb-6 text-slate-400 text-sm font-medium text-center min-h-[1.5em]">
        {transcript}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePlayTTS}
          className="p-4 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md text-slate-600"
          title="Play Reference Audio"
        >
          <Volume2 size={24} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleListening}
          className={`p-6 rounded-full shadow-lg transition-all ${
            isListening 
              ? 'bg-red-500 text-white shadow-red-500/30 animate-pulse' 
              : 'bg-purple-600 text-white shadow-purple-600/30'
          }`}
        >
          {isListening ? <MicOff size={32} /> : <Mic size={32} />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRestart} // Needs implementation in parent to reset state if needed
          className="p-4 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md text-slate-600"
        >
          <RotateCcw size={24} />
        </motion.button>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-lg"
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion & Next */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-2 text-green-500 text-xl font-bold">
              <CheckCircle2 size={28} />
              <span>Great Pronunciation!</span>
            </div>
            <div className="text-slate-500">Accuracy: {accuracy}%</div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNextSentence}
              className="mt-4 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/30"
            >
              Next Sentence
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpokenMode;
