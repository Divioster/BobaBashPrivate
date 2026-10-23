import './style.css';
import confetti from 'canvas-confetti';
import { sound } from './audio.js';
import { UnderwaterCanvas } from './canvas-bubbles.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Ambient Underwater Bubbles Physics Canvas
  const canvas = document.getElementById('bubbleCanvas');
  let bubbleSim = null;
  if (canvas) {
    bubbleSim = new UnderwaterCanvas(canvas);
  }

  // 2. Start Scroll Position at the Bottom (Launch Zone)
  function scrollToBottomInstant() {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'instant'
    });
  }

  scrollToBottomInstant();
  window.addEventListener('load', () => {
    scrollToBottomInstant();
  });
  setTimeout(scrollToBottomInstant, 150);

  // 3. Ambient Audio Toggle in Corner Bubble
  const soundBubble = document.getElementById('soundBubble');
  if (soundBubble) {
    soundBubble.addEventListener('click', () => {
      const isPlaying = sound.toggleMute();
      if (isPlaying) {
        soundBubble.classList.add('active');
        soundBubble.textContent = '🔊';
      } else {
        soundBubble.classList.remove('active');
        soundBubble.textContent = '🔈';
      }
    });
  }

  // Auto-enable audio on first user interaction if muted
  let hasInteractedAudio = false;
  function handleFirstInteraction() {
    if (!hasInteractedAudio) {
      hasInteractedAudio = true;
      if (sound.isMuted) {
        sound.toggleMute();
        if (soundBubble) {
          soundBubble.classList.add('active');
          soundBubble.textContent = '🔊';
        }
      }
    }
  }
  window.addEventListener('click', handleFirstInteraction, { once: true });
  window.addEventListener('keydown', handleFirstInteraction, { once: true });

  // 4. Interactive Bubble Clicks: Pop sound + Confetti / Wobble
  const bubbles = document.querySelectorAll('.bubble-capsule');
  bubbles.forEach((b) => {
    b.addEventListener('click', () => {
      sound.playSpatulaClink();
      b.style.transform = 'scale(1.18)';
      setTimeout(() => {
        b.style.transform = '';
      }, 300);

      // Top bubble triggers celestial chords & celebratory golden confetti
      if (b.closest('.zenith-zone')) {
        sound.playCelestialAscent();
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.35 },
          colors: ['#f59e0b', '#38bdf8', '#ffffff', '#ef4444', '#10b981']
        });
      }
    });
  });

  // 5. Scroll Observer for Dynamic In-View Animations
  const nodes = document.querySelectorAll('.story-node, .zenith-zone, .launch-zone');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.15
  });

  nodes.forEach(node => {
    observer.observe(node);
  });
});
