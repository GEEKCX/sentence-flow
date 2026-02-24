import { useRef, useCallback, useEffect } from 'react';
import { useTypingStore } from '../store/typingStore';

export const useTypingSound = () => {
  const audioContextRef = useRef(null);
  const { soundEnabled, volume, soundProfile } = useTypingStore();

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  useEffect(() => {
    const handleInteract = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };
    window.addEventListener('click', handleInteract);
    window.addEventListener('keydown', handleInteract);
    return () => {
      window.removeEventListener('click', handleInteract);
      window.removeEventListener('keydown', handleInteract);
    };
  }, []);

  const playSound = useCallback((type) => {
    if (!soundEnabled) return;
    const ctx = initAudioContext();
    // 加上微小的延迟以避免 "value at time" 错误 (如果调度时间早于当前上下文时间)
    const t = Math.max(ctx.currentTime, ctx.currentTime + 0.005);
    const baseVol = volume * (type === 'error' ? 0.5 : 0.6);

    const createOsc = (type, freq, startVol, duration, delay = 0) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t + delay);
      
      // 使用 linearRamp 避免 exponentialRamp 接近 0 时的潜在问题
      gain.gain.setValueAtTime(startVol, t + delay);
      gain.gain.linearRampToValueAtTime(0.001, t + delay + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(t + delay);
      osc.stop(t + delay + duration + 0.05); // 稍微多一点缓冲
      
      // 自动断开连接以释放资源
      setTimeout(() => {
        osc.disconnect();
        gain.disconnect();
      }, (duration + 0.1) * 1000);
      
      return { osc, gain };
    };

    if (type === 'error') {
      // 通用错误音效
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.linearRampToValueAtTime(100, t + 0.1);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, t);
      filter.frequency.linearRampToValueAtTime(200, t + 0.2);

      gain.gain.setValueAtTime(baseVol, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
      return;
    }

    // 打字音效配置
    const profile = soundProfile || 'cherry-blue';
    const detune = (Math.random() - 0.5) * 100; // 通用微小音高随机化

    switch (profile) {
      case 'cherry-brown': // Tactile, softer
        createOsc('triangle', 600 + detune, baseVol, 0.05); // Bump
        createOsc('sine', 200, baseVol * 0.8, 0.08, 0.01); // Bottom out
        break;

      case 'cherry-red': // Linear, quiet, scratchy
        createOsc('sawtooth', 400 + detune, baseVol * 0.3, 0.04); // Scratch
        createOsc('sine', 300, baseVol * 0.6, 0.06, 0.02); // Bottom out (soft)
        break;

      case 'cherry-silver': // Speed, high pitch, short
        createOsc('triangle', 800 + detune, baseVol * 0.5, 0.02); // Fast actuation
        createOsc('square', 200, baseVol * 0.4, 0.03, 0.01); // Bottom out
        break;

      case 'topre': // Thocky, deep
        createOsc('sine', 300 + detune, baseVol * 1.2, 0.08); // Thock
        createOsc('square', 100, baseVol * 0.3, 0.05, 0.02); // Texture
        break;

      case 'holy-panda': // Tactile, sharp thock
        createOsc('triangle', 500 + detune, baseVol * 0.9, 0.06); // Sharp bump
        createOsc('sine', 250, baseVol * 1.0, 0.09, 0.01); // Deep bottom out
        break;

      case 'typewriter': // Metallic, sharp
        createOsc('sawtooth', 800 + detune, baseVol * 0.8, 0.03); // Strike
        createOsc('sine', 2000, baseVol * 0.4, 0.1, 0.01); // Ring
        createOsc('square', 400, baseVol * 0.5, 0.05); // Mechanism
        break;

      case 'cherry-blue': // Clicky, sharp
      default:
        // High frequency click (Switch mechanic)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1500 + detune * 2, t);
        // Quick drop in pitch for click
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.01); 
        
        gain.gain.setValueAtTime(baseVol, t);
        gain.gain.linearRampToValueAtTime(0.001, t + 0.03);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.04);

        // Low frequency thud (Keycap hitting plate)
        createOsc('sine', 300, baseVol * 0.8, 0.08);
        break;
    }
  }, [soundEnabled, volume, soundProfile, initAudioContext]);

  const playClick = useCallback(() => playSound('click'), [playSound]);
  const playError = useCallback(() => playSound('error'), [playSound]);

  return { playClick, playError };
};
