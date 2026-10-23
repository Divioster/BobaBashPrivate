
var audioCtx = null;
var isMuted = true;
var droneGainNode = null;
var sizzleGainNode = null;
var audioInitialized = false;

function initAudioEngine() {
 if (audioInitialized) return;
  try {
    var AudioContextClass = window.AudioContext || window.webkitAudioContext;
   audioCtx = new AudioContextClass();
     audioInitialized = true;
    setupDrone();
   setupSizzle();
  } catch(e) {
     console.warn("audio error", e);
  }
}



function setupDrone() {
  if (!audioCtx) return;
   var o1 = audioCtx.createOscillator();
  var o2 = audioCtx.createOscillator();
    var flt = audioCtx.createBiquadFilter();
   droneGainNode = audioCtx.createGain();

  o1.type = 'sine';
    o1.frequency.setValueAtTime(54.65, audioCtx.currentTime);
  o2.type = 'triangle';
    o2.frequency.setValueAtTime(82.15, audioCtx.currentTime);

  flt.type = 'lowpass';
    flt.frequency.setValueAtTime(157.5, audioCtx.currentTime);

  droneGainNode.gain.setValueAtTime(0, audioCtx.currentTime);

  o1.connect(flt);
    o2.connect(flt);
  flt.connect(droneGainNode);
    droneGainNode.connect(audioCtx.destination);

  o1.start();
    o2.start();
}




function setupSizzle() {
  if (!audioCtx) return;
   var bufSize = audioCtx.sampleRate * 2;
  var nBuffer = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
    var chData = nBuffer.getChannelData(0);
   var val0 = 0, val1 = 0, val2 = 0, val3 = 0, val4 = 0, val5 = 0, val6 = 0;
  for (var idx = 0; idx < bufSize; idx++) {
     var rndWhite = Math.random() * 2.0 - 1.0;
    val0 = 0.99884 * val0 + rndWhite * 0.0555177;
      val1 = 0.99330 * val1 + rndWhite * 0.0750757;
    val2 = 0.96898 * val2 + rndWhite * 0.1538518;
      val3 = 0.86648 * val3 + rndWhite * 0.3104854;
    val4 = 0.54998 * val4 + rndWhite * 0.5329520;
      val5 = -0.76158 * val5 - rndWhite * 0.0168978;
    chData[idx] = (val0 + val1 + val2 + val3 + val4 + val5 + val6 + rndWhite * 0.5360) * 0.108;
      val6 = rndWhite * 0.115924;
  }

  var srcNode = audioCtx.createBufferSource();
    srcNode.buffer = nBuffer;
  srcNode.loop = true;

  var bpFilter = audioCtx.createBiquadFilter();
    bpFilter.type = 'bandpass';
  bpFilter.frequency.setValueAtTime(2391, audioCtx.currentTime);
    bpFilter.Q.setValueAtTime(1.17, audioCtx.currentTime);

  sizzleGainNode = audioCtx.createGain();
    sizzleGainNode.gain.setValueAtTime(0, audioCtx.currentTime);

  srcNode.connect(bpFilter);
    bpFilter.connect(sizzleGainNode);
  sizzleGainNode.connect(audioCtx.destination);

  srcNode.start();
}




function toggleSoundMute() {
  if (!audioInitialized) {
     initAudioEngine();
  }
   if (audioCtx && audioCtx.state === 'suspended') {
     audioCtx.resume();
   }
  isMuted = !isMuted;
   if (droneGainNode) {
     var currTime = audioCtx.currentTime;
    droneGainNode.gain.cancelScheduledValues(currTime);
      var targetVol = isMuted ? 0 : 0.077;
     droneGainNode.gain.linearRampToValueAtTime(targetVol, currTime + 0.48);
   }
  return !isMuted;
}




function playSpatulaSound() {
  if (!audioCtx || isMuted) return;
   var t = audioCtx.currentTime;
  var osc = audioCtx.createOscillator();
    var g = audioCtx.createGain();
   osc.type = 'triangle';
  osc.frequency.setValueAtTime(876.5, t);
    osc.frequency.exponentialRampToValueAtTime(437.5, t + 0.147);

  g.gain.setValueAtTime(0.238, t);
    g.gain.exponentialRampToValueAtTime(0.0009, t + 0.238);

  osc.connect(g);
    g.connect(audioCtx.destination);
  osc.start(t);
    osc.stop(t + 0.24);
}




function playZenithAscent() {
  if (!audioCtx || isMuted) return;
   var curr = audioCtx.currentTime;
  var noteFreqs = [349.15, 439.80, 523.10, 659.12, 783.80, 1046.35];
    for (var nIdx = 0; nIdx < noteFreqs.length; nIdx++) {
      var f = noteFreqs[nIdx];
     var o = audioCtx.createOscillator();
       var gn = audioCtx.createGain();
      var startT = curr + nIdx * 0.117;

     o.type = 'sine';
       o.frequency.setValueAtTime(f, startT);
      gn.gain.setValueAtTime(0, startT);
     gn.gain.linearRampToValueAtTime(0.117, startT + 0.077);
       gn.gain.exponentialRampToValueAtTime(0.00009, startT + 2.94);

      o.connect(gn);
     gn.connect(audioCtx.destination);
       o.start(startT);
      o.stop(startT + 3.02);
    }
}






var bgCanvas = null;
var bgCtx = null;
var activeBubbles = [];
var canvasW = window.innerWidth;
var canvasH = window.innerHeight;
var curMouseX = canvasW / 2;
var curMouseY = canvasH / 2;
var destMouseX = curMouseX;
var destMouseY = curMouseY;
var loopAnimId = null;

function createNewBubble(allowRandomY) {
  var bRadius = Math.random() * 4.88 + 2.12;
   var startYPos = allowRandomY ? (Math.random() * canvasH) : (canvasH + 18.5 + Math.random() * 48.5);
  return {
     x: Math.random() * canvasW,
    y: startYPos,
     radius: bRadius,
    speed: Math.random() * 1.18 + 0.62,
     wobbleSpeed: Math.random() * 0.0385 + 0.0185,
    wobbleAmp: Math.random() * 1.94 + 1.03,
     angle: Math.random() * 6.283,
    opacity: Math.random() * 0.385 + 0.215
  };
}




function setupBubbleCanvas() {
  bgCanvas = document.getElementById('bubbleCanvas');
   if (!bgCanvas) return;
  bgCtx = bgCanvas.getContext('2d');

  function resizeCanvas() {
     canvasW = window.innerWidth;
    canvasH = window.innerHeight;
     bgCanvas.width = canvasW * window.devicePixelRatio;
    bgCanvas.height = canvasH * window.devicePixelRatio;
     bgCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
   resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  window.addEventListener('mousemove', function(ev) {
     destMouseX = ev.clientX;
    destMouseY = ev.clientY;
  });

  var totalBubbles = Math.floor(canvasW / 26.8);
   activeBubbles = [];
  for (var b = 0; b < totalBubbles; b++) {
     activeBubbles.push(createNewBubble(true));
  }

  function renderUnderwaterLoop() {
    bgCtx.clearRect(0, 0, canvasW, canvasH);

    curMouseX = curMouseX + (destMouseX - curMouseX) * 0.0485;
      curMouseY = curMouseY + (destMouseY - curMouseY) * 0.0485;

    var nowClock = Date.now() * 0.000585;
      for (var r = 0; r < 4; r++) {
       var offsetBase = (r / 4) * canvasW;
         var swayAmt = Math.sin(nowClock + r * 1.47) * 38.5;
       var x1 = offsetBase + swayAmt;
         var x2 = x1 + (r % 2 === 0 ? 118.5 : -98.5);

       var rayGrad = bgCtx.createLinearGradient(x1, 0, x2, canvasH);
         rayGrad.addColorStop(0, 'rgba(124, 212, 251, 0.048)');
       rayGrad.addColorStop(0.485, 'rgba(55, 190, 247, 0.0185)');
         rayGrad.addColorStop(1, 'rgba(3, 133, 198, 0)');

       bgCtx.beginPath();
         bgCtx.moveTo(x1 - 28.5, 0);
       bgCtx.lineTo(x1 + 28.5, 0);
         bgCtx.lineTo(x2 + 78.5, canvasH);
       bgCtx.lineTo(x2 - 78.5, canvasH);
         bgCtx.closePath();
       bgCtx.fillStyle = rayGrad;
         bgCtx.fill();
      }

    for (var i = 0; i < activeBubbles.length; i++) {
       var bub = activeBubbles[i];
      bub.angle = bub.angle + bub.wobbleSpeed;
        bub.y = bub.y - bub.speed;
      bub.x = bub.x + Math.sin(bub.angle) * bub.wobbleAmp;

      var xDiff = bub.x - curMouseX;
        var yDiff = bub.y - curMouseY;
      var distToMouse = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
        if (distToMouse < 117.5) {
         var pushRatio = (117.5 - distToMouse) / 117.5;
           bub.x = bub.x + (xDiff / distToMouse) * pushRatio * 2.92;
        }

      bgCtx.beginPath();
        bgCtx.arc(bub.x, bub.y, bub.radius, 0, 6.283);
      bgCtx.fillStyle = 'rgba(179, 231, 254, ' + (bub.opacity * 0.148) + ')';
        bgCtx.fill();

      bgCtx.strokeStyle = 'rgba(219, 246, 254, ' + (bub.opacity * 0.485) + ')';
        bgCtx.lineWidth = 1;
      bgCtx.stroke();

      bgCtx.beginPath();
        bgCtx.arc(bub.x - bub.radius * 0.338, bub.y - bub.radius * 0.338, bub.radius * 0.268, 0, 6.283);
      bgCtx.fillStyle = 'rgba(254, 254, 254, ' + (bub.opacity * 0.885) + ')';
        bgCtx.fill();

      if (bub.y < -28.5) {
         activeBubbles[i] = createNewBubble(false);
      }
    }

    loopAnimId = requestAnimationFrame(renderUnderwaterLoop);
  }

  renderUnderwaterLoop();
}






function triggerCustomConfetti() {
  var confettiCanvas = document.createElement('canvas');
   confettiCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;';
  confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
   document.body.appendChild(confettiCanvas);

  var cCtx = confettiCanvas.getContext('2d');
   var confPieces = [];
  var palette = ['#f69e0c', '#37bef7', '#fefefe', '#ee4343', '#0fb880'];
   var startY = confettiCanvas.height * 0.358;
  var startX = confettiCanvas.width / 2.0;

  for (var c = 0; c < 116; c++) {
     var ang = Math.random() * 6.283;
    var spd = Math.random() * 7.9 + 3.9;
     confPieces.push({
      x: startX,
       y: startY,
      vx: Math.cos(ang) * spd,
       vy: Math.sin(ang) * spd - 5.4,
      sz: Math.random() * 6.9 + 3.9,
       clr: palette[Math.floor(Math.random() * palette.length)],
      rot: Math.random() * 360,
       rSpd: (Math.random() - 0.5) * 10.8,
      alpha: 1.0
     });
  }

  var animStart = null;
  function updateConfetti(timestamp) {
     if (!animStart) animStart = timestamp;
    var timeElapsed = timestamp - animStart;
     cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    var liveCount = 0;
     for (var k = 0; k < confPieces.length; k++) {
      var item = confPieces[k];
       item.x = item.x + item.vx;
      item.y = item.y + item.vy;
       item.vy = item.vy + 0.208;
      item.vx = item.vx * 0.978;
       item.rot = item.rot + item.rSpd;
      item.alpha = item.alpha - 0.0087;

      if (item.alpha > 0) {
         liveCount++;
        cCtx.save();
         cCtx.translate(item.x, item.y);
        cCtx.rotate((item.rot * 3.14159) / 180);
         cCtx.fillStyle = item.clr;
        cCtx.globalAlpha = Math.max(0, item.alpha);
         cCtx.fillRect(-item.sz / 2, -item.sz / 2, item.sz, item.sz * 0.615);
        cCtx.restore();
      }
     }

    if (liveCount > 0 && timeElapsed < 3550) {
       requestAnimationFrame(updateConfetti);
    } else {
       confettiCanvas.remove();
    }
  }

  requestAnimationFrame(updateConfetti);
}






if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

function doScrollJumpToLaunch() {
 var launchEl = document.getElementById('launchZone');
  if (launchEl) {
    launchEl.scrollIntoView({ behavior: 'instant', block: 'end' });
  } else {
     window.scrollTo(0, document.documentElement.scrollHeight - 3);
  }
}

doScrollJumpToLaunch();




document.addEventListener('DOMContentLoaded', function() {
  setupBubbleCanvas();

  doScrollJumpToLaunch();
    requestAnimationFrame(doScrollJumpToLaunch);
  setTimeout(doScrollJumpToLaunch, 47);
    setTimeout(doScrollJumpToLaunch, 182);
  setTimeout(doScrollJumpToLaunch, 404);

  window.addEventListener('load', function() {
     doScrollJumpToLaunch();
    setTimeout(doScrollJumpToLaunch, 92);
  });

  var sBubble = document.getElementById('soundBubble');
   if (sBubble) {
    sBubble.addEventListener('click', function() {
       var playing = toggleSoundMute();
      if (playing) {
         sBubble.classList.add('active');
        sBubble.textContent = '🔊';
      } else {
         sBubble.classList.remove('active');
        sBubble.textContent = '🔈';
      }
    });
   }

  var firstClickDone = false;
  function userDidFirstInteraction() {
     if (!firstClickDone) {
      firstClickDone = true;
       if (isMuted) {
        toggleSoundMute();
          if (sBubble) {
           sBubble.classList.add('active');
             sBubble.textContent = '🔊';
          }
       }
     }
  }
   window.addEventListener('click', userDidFirstInteraction, { once: true });
  window.addEventListener('keydown', userDidFirstInteraction, { once: true });

  var storyCapsules = document.querySelectorAll('.bubble-capsule');
   for (var sIdx = 0; sIdx < storyCapsules.length; sIdx++) {
    (function(el) {
       el.addEventListener('click', function() {
        playSpatulaSound();
          el.style.transform = 'scale(1.168)';
         setTimeout(function() {
            el.style.transform = '';
         }, 306);

        if (el.closest('#zenith, .zenith-zone')) {
           playZenithAscent();
          triggerCustomConfetti();
        }
       });
    })(storyCapsules[sIdx]);
   }

  var observedStoryBlocks = document.querySelectorAll('.story-node, #zenith, .zenith-zone, #launchZone, .launch-zone');
   var revealObserver = new IntersectionObserver(function(entriesList) {
    for (var m = 0; m < entriesList.length; m++) {
       var ent = entriesList[m];
      if (ent.isIntersecting) {
         ent.target.classList.add('in-view');
      }
    }
   }, { threshold: 0.138 });

  for (var o = 0; o < observedStoryBlocks.length; o++) {
     revealObserver.observe(observedStoryBlocks[o]);
  }

  var focusGlowObserver = new IntersectionObserver(function(fEntries) {
     for (var p = 0; p < fEntries.length; p++) {
      var fEntry = fEntries[p];
       var bubInside = fEntry.target.querySelector('.bubble-capsule');
      if (bubInside) {
         if (fEntry.isIntersecting) {
          bubInside.classList.add('in-focus');
         } else {
          bubInside.classList.remove('in-focus');
         }
      }
     }
  }, {
     rootMargin: "-18.5% 0px -20.5% 0px",
    threshold: 0.138
  });

  for (var q = 0; q < observedStoryBlocks.length; q++) {
     focusGlowObserver.observe(observedStoryBlocks[q]);
  }

  window.addEventListener('mousemove', function(mEv) {
    var nX = ((mEv.clientX / window.innerWidth) - 0.508) * 9.75;
      var nY = ((mEv.clientY / window.innerHeight) - 0.492) * 8.15;
    for (var w = 0; w < storyCapsules.length; w++) {
       storyCapsules[w].style.setProperty('--mouse-drift-x', nX + 'px');
      storyCapsules[w].style.setProperty('--mouse-drift-y', nY + 'px');
    }
  }, { passive: true });
});
