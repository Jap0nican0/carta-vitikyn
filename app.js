const cover = document.querySelector('#cover');
const openButton = document.querySelector('#open-letter');
const letter = document.querySelector('#letter');
const musicControl = document.querySelector('#music-control');
const musicLabel = musicControl.querySelector('.music-label');
const hugButton = document.querySelector('#send-hug');
const toast = document.querySelector('#toast');
const heartBurst = document.querySelector('#heart-burst');
const readingProgress = document.querySelector('#reading-progress');
const petalField = document.querySelector('#petal-field');

document.body.classList.add('locked');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.18, rootMargin: '0px 0px -5% 0px' });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

function buildPetals() {
  if (petalField.childElementCount || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < 14; i += 1) {
    const petal = document.createElement('span');
    const sway = -48 + Math.random() * 96;
    petal.className = 'petal';
    petal.style.setProperty('--left', `${3 + Math.random() * 94}%`);
    petal.style.setProperty('--size', `${7 + Math.random() * 8}px`);
    petal.style.setProperty('--duration', `${10 + Math.random() * 9}s`);
    petal.style.setProperty('--delay', `${-Math.random() * 16}s`);
    petal.style.setProperty('--sway', `${sway}px`);
    petal.style.setProperty('--end-sway', `${sway * -.55}px`);
    petalField.appendChild(petal);
  }
}

function updateReadingProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
  readingProgress.style.transform = `scaleX(${progress})`;
}

let progressFrame;
window.addEventListener('scroll', () => {
  if (progressFrame) return;
  progressFrame = window.requestAnimationFrame(() => {
    updateReadingProgress();
    progressFrame = null;
  });
}, { passive: true });

const YOUTUBE_VIDEO_ID = 'ZC_dMk2i_f4';
const YOUTUBE_URL = `https://youtu.be/${YOUTUBE_VIDEO_ID}`;
let youtubePlayer;
let youtubePlayerReady = false;
let pendingPlay = false;
let playerFailed = false;
let isPlaying = false;

function updateMusicButton(label) {
  const displayLabel = label || (isPlaying ? 'Sonando' : 'Música');
  musicControl.classList.toggle('is-paused', !isPlaying);
  musicControl.setAttribute('aria-pressed', String(isPlaying));
  musicControl.setAttribute('aria-label', playerFailed
    ? 'Abrir canción en YouTube'
    : (isPlaying ? 'Pausar canción' : 'Reproducir canción'));
  musicLabel.textContent = displayLabel;
}

function onPlayerReady() {
  youtubePlayerReady = true;
  updateMusicButton();
  if (pendingPlay) {
    pendingPlay = false;
    youtubePlayer.playVideo();
  }
}

function onPlayerStateChange(event) {
  if (!window.YT?.PlayerState) return;
  isPlaying = event.data === window.YT.PlayerState.PLAYING;
  if (event.data === window.YT.PlayerState.ENDED) {
    youtubePlayer.seekTo(0, true);
    youtubePlayer.playVideo();
  }
  updateMusicButton();
}

function onPlayerError() {
  playerFailed = true;
  isPlaying = false;
  pendingPlay = false;
  updateMusicButton('YouTube');
}

window.onYouTubeIframeAPIReady = () => {
  if (youtubePlayer) return;
  youtubePlayer = new window.YT.Player('youtube-player', {
    width: '100%',
    height: '100%',
    videoId: YOUTUBE_VIDEO_ID,
    playerVars: {
      autoplay: 0,
      controls: 1,
      playsinline: 1,
      rel: 0,
      loop: 1,
      playlist: YOUTUBE_VIDEO_ID,
      origin: window.location.origin
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError,
      onAutoplayBlocked: () => {
        isPlaying = false;
        updateMusicButton('Toca play');
      }
    }
  });
};

function loadYouTubeApi() {
  if (window.YT?.Player) {
    window.onYouTubeIframeAPIReady();
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://www.youtube.com/iframe_api';
  script.async = true;
  document.head.appendChild(script);
}

function playSong() {
  if (playerFailed) {
    window.open(YOUTUBE_URL, '_blank', 'noopener,noreferrer');
    return;
  }
  pendingPlay = true;
  updateMusicButton(youtubePlayerReady ? 'Sonando' : 'Cargando');
  if (youtubePlayerReady) {
    pendingPlay = false;
    youtubePlayer.playVideo();
  }
  window.setTimeout(() => {
    if (!youtubePlayerReady && pendingPlay) updateMusicButton('Toca video');
  }, 2800);
}

function pauseSong() {
  pendingPlay = false;
  if (youtubePlayerReady) youtubePlayer.pauseVideo();
  isPlaying = false;
  updateMusicButton();
}

loadYouTubeApi();

openButton.addEventListener('click', () => {
  cover.classList.add('is-open');
  document.body.classList.remove('locked');
  document.body.classList.add('letter-open');
  musicControl.hidden = false;
  buildPetals();
  updateReadingProgress();
  playSong();
  window.setTimeout(() => {
    letter.focus({ preventScroll: true });
    document.querySelector('.hero-copy')?.classList.add('is-visible');
  }, 650);
});

musicControl.addEventListener('click', () => {
  if (isPlaying) pauseSong();
  else playSong();
});

function releaseHearts() {
  heartBurst.replaceChildren();
  const palette = ['#b45c70', '#e8b5b9', '#caa66a', '#7d2943', '#f5d9c7'];
  for (let i = 0; i < 30; i += 1) {
    const heart = document.createElement('span');
    heart.className = 'flying-heart';
    heart.textContent = '♥';
    heart.style.setProperty('--x', `${Math.random() * 96}%`);
    heart.style.setProperty('--c', palette[i % palette.length]);
    heart.style.setProperty('--s', `${13 + Math.random() * 22}px`);
    heart.style.setProperty('--d', `${3.2 + Math.random() * 2.3}s`);
    heart.style.setProperty('--delay', `${Math.random() * .7}s`);
    heart.style.setProperty('--drift', `${-60 + Math.random() * 120}px`);
    heart.style.setProperty('--rot', `${-90 + Math.random() * 180}deg`);
    heartBurst.appendChild(heart);
  }
}

hugButton.addEventListener('click', () => {
  releaseHearts();
  toast.classList.add('show');
  if (navigator.vibrate) navigator.vibrate([35, 30, 55]);
  window.setTimeout(() => toast.classList.remove('show'), 2800);
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && isPlaying) pauseSong();
});
