import './style.css';
import confetti from 'canvas-confetti';
import { sound } from './audio.js';
import { UnderwaterCanvas } from './canvas-bubbles.js';

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

function scrollToBottomInstant() {
  const launchZone = document.getElementById('launchZone');
  if (launchZone) {
    launchZone.scrollIntoView({ behavior: 'instant', block: 'end' });
  } else {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'instant'
    });
  }
}

scrollToBottomInstant();

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('bubbleCanvas');
  let bubbleSim = null;
  if (canvas) {
    bubbleSim = new UnderwaterCanvas(canvas);
  }

  scrollToBottomInstant();
  requestAnimationFrame(scrollToBottomInstant);
  setTimeout(scrollToBottomInstant, 50);
  setTimeout(scrollToBottomInstant, 180);
  setTimeout(scrollToBottomInstant, 400);

  window.addEventListener('load', () => {
    scrollToBottomInstant();
  });

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

  const bubbles = document.querySelectorAll('.bubble-capsule');
  bubbles.forEach((b) => {
    b.addEventListener('click', () => {
      sound.playSpatulaClink();
      b.style.transform = 'scale(1.18)';
      setTimeout(() => {
        b.style.transform = '';
      }, 300);

      if (b.closest('#zenith, .zenith-zone')) {
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

  const nodes = document.querySelectorAll('.story-node, #zenith, .zenith-zone, #launchZone, .launch-zone');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, {
    threshold: 0.15
  });

  nodes.forEach(node => {
    observer.observe(node);
  });

  const focusObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const bubble = entry.target.querySelector('.bubble-capsule');
      if (bubble) {
        if (entry.isIntersecting) {
          bubble.classList.add('in-focus');
        } else {
          bubble.classList.remove('in-focus');
        }
      }
    });
  }, {
    rootMargin: "-20% 0px -20% 0px",
    threshold: 0.15
  });

  nodes.forEach(node => {
    focusObserver.observe(node);
  });

  window.addEventListener('mousemove', (e) => {
    const normX = (e.clientX / window.innerWidth - 0.5) * 10;
    const normY = (e.clientY / window.innerHeight - 0.5) * 8;
    bubbles.forEach(b => {
      b.style.setProperty('--mouse-drift-x', `${normX}px`);
      b.style.setProperty('--mouse-drift-y', `${normY}px`);
    });
  }, { passive: true });
});
