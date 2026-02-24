import React, { useEffect, useRef } from 'react';

const AudioVisualizer = ({ stream, isListening }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    if (!stream || !isListening || !canvasRef.current) return;

    // Create AudioContext only once if possible, or handle cleanup carefully
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    audioContextRef.current = audioCtx;

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64; // Low resolution for aesthetic bars
    analyser.smoothingTimeConstant = 0.8;
    
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isListening) return;
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Center the bars
      const barWidth = 6;
      const gap = 4;
      const totalWidth = bufferLength * (barWidth + gap);
      let x = (canvas.width - totalWidth) / 2;

      for (let i = 0; i < bufferLength; i++) {
        // Mirrored effect or just standard? Let's do center-out or just standard.
        // Let's do standard frequency bars but centered.
        const value = dataArray[i];
        const percent = value / 256;
        const barHeight = Math.max(4, canvas.height * percent * 0.8); // Min height 4px

        // Dynamic color based on amplitude
        const hue = 260 + (percent * 40); // Purple to Pink range
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
        
        // Draw rounded bar
        // Centered vertically
        const y = (canvas.height - barHeight) / 2;
        
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();

        x += barWidth + gap;
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      source.disconnect();
      if (audioCtx.state !== 'closed') audioCtx.close();
    };
  }, [stream, isListening]);

  return <canvas ref={canvasRef} width={400} height={100} className="w-full max-w-[400px] h-[100px]" />;
};

export default AudioVisualizer;
