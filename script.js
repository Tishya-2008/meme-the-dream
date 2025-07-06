let currentScreen = 0;

const easyMemes = [
  { src: 'e1.jpg', caption: 'Found the last timbit in the box!' },
  { src: 'e2.jpg', caption: 'When you realize Tims discontinued your favorite donut' },
  { src: 'e3.jpg', caption: 'When the raccoon opens your door like he pays rent' },
  { src: 'e4.jpg', caption: 'Can’t fail the test if you don’t show up' }
];

const mediumMemes = [
  { src: 'm1.jpg', caption: 'Do I tell them the raccoon stole my homework?' },
  { src: 'm2.jpg', caption: 'Two sips into my iced cap and I’m a philosopher' },
  { src: 'm3.jpg', caption: 'No thoughts, just chaos and raccoons' },
  { src: 'm4.jpg', caption: 'Tim Hortons girl gave me extra whipped cream. We’re basically engaged' }
];

const hardMemes = [
  { src: 'h1.jpg', caption: 'Got free Timbits at the drive-thru' },
  { src: 'h2.jpg', caption: 'When your teacher starts the Kahoot music' },
  { src: 'h3.jpg', caption: 'When the raccoon outside makes eye contact' },
  { src: 'h4.jpg', caption: 'When the raccoon steals your last Tims donut and Kyle’s nowhere to be found' }
];

const sigmaMeme = "sigma.jpg"

const bruhSound = new Audio('/Bruh.mp3');
const partySound = new Audio('/party.mp3');
const muffinPartySound = new Audio('/fanfare.mp3');
const typingSound = new Audio('/typing.mp3');

const allSounds = [typingSound, bruhSound, partySound, muffinPartySound];

let chosenEasyMeme = null;
let chosenMediumMeme = null;
let chosenHardMeme = null;

function showScreen(index) {
  if ([6, 7, 8, 9].includes(index)) {
    bruhSound.currentTime = 0;
    bruhSound.play().catch(e => console.log("Audio play error:", e));
  }

  for (let i = 0; i <= 10; i++) {
    const screen = document.getElementById("screen-" + i);
    if (screen) screen.classList.remove("active");
  }

  const targetScreen = document.getElementById("screen-" + index);
  if (targetScreen) targetScreen.classList.add("active");

  currentScreen = index;

  document.querySelectorAll(".next-arrow").forEach(arrow => {
    arrow.style.display = "none";
  });

  if (![6, 7, 8].includes(index)) {
    const nextArrow = targetScreen?.querySelector(".next-arrow");
    if (nextArrow) nextArrow.style.display = "inline";
  }

  if (index === 6 && !chosenEasyMeme) {
    chosenEasyMeme = easyMemes[Math.floor(Math.random() * easyMemes.length)];
    document.getElementById("easy-meme").src = "memes/" + chosenEasyMeme.src;
    document.getElementById("easy-meme-caption").textContent = chosenEasyMeme.caption;
  }

  if (index === 7 && !chosenMediumMeme) {
    chosenMediumMeme = mediumMemes[Math.floor(Math.random() * mediumMemes.length)];
    document.getElementById("medium-meme").src = "memes/" + chosenMediumMeme.src;
    document.getElementById("medium-meme-caption").textContent = chosenMediumMeme.caption;
  }

  if (index === 8 && !chosenHardMeme) {
    chosenHardMeme = hardMemes[Math.floor(Math.random() * hardMemes.length)];
    document.getElementById("hard-meme").src = "memes/" + chosenHardMeme.src;
    document.getElementById("hard-meme-caption").textContent = chosenHardMeme.caption;
  }

  startTypingIfNeeded(index);
}

document.querySelectorAll(".next-arrow").forEach(arrow => {
  arrow.addEventListener("click", () => {
    if (currentScreen < 10) showScreen(currentScreen + 1);
  });
});

document.querySelectorAll(".back-arrow").forEach(arrow => {
  arrow.addEventListener("click", () => {
    if (currentScreen > 0) showScreen(currentScreen - 1);
  });
});

function setupWebcam(videoId, canvasId, buttonId, resultId) {
  const video = document.getElementById(videoId);
  const canvas = document.getElementById(canvasId);
  const ctx = canvas?.getContext('2d');
  const btn = document.getElementById(buttonId);
  const similarityDiv = document.getElementById(resultId);

  if (video && canvas && ctx && btn && similarityDiv) {
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        canvas.width = 500;
        canvas.height = 250;
      };
    });

    btn.onclick = () => {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      const base64Image = canvas.toDataURL('image/jpeg');
      let memeName = "";
      if (videoId === "webcam") memeName = chosenEasyMeme?.src.replace('.jpg', '');
      else if (videoId === "webcam-7") memeName = chosenMediumMeme?.src.replace('.jpg', '');
      else if (videoId === "webcam-8") memeName = chosenHardMeme?.src.replace('.jpg', '');
      else if (videoId === "webcam-9") memeName = "sigma";

      similarityDiv.textContent = "Comparing...";
      btn.disabled = true;

      fetch('http://127.0.0.1:5000/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image, meme_name: memeName })
      })
        .then(res => res.json())
        .then(data => {
          btn.disabled = false;

          if (data.error) {
            similarityDiv.textContent = "Error: " + data.error;
          } else {
            const similarityPercent = (data.similarity * 100).toFixed(1);
            similarityDiv.textContent = "Kyle Factor: " + similarityPercent + "%";
            similarityDiv.style.color = "white";
            similarityDiv.style.fontFamily = "monospace";
            similarityDiv.style.fontSize = "20px";

            if (similarityPercent >= 60) {
              const nextArrow = video.closest(".screen")?.querySelector(".next-arrow");
              if (nextArrow) nextArrow.style.display = "inline";
              partySound.currentTime = 0;
              partySound.play().catch(e => console.log("Audio play error:", e));
            }
          }
        })
        .catch(() => {
          similarityDiv.textContent = "Error comparing poses";
          btn.disabled = false;
        });
    };
  }
}

setupWebcam("webcam", "canvas", "captureBtn", "similarityScore");
setupWebcam("webcam-7", "canvas-7", "captureBtn-7", "similarityScore-7");
setupWebcam("webcam-8", "canvas-8", "captureBtn-8", "similarityScore-8");
setupWebcam("webcam-9", "canvas-9", "captureBtn-9", "similarityScore-9");

// Typing Animation
const texts = [
  "Meme the Dream [Ft. Kyle]",
  "In a world where memes reign supreme and raccoons hoard pastries like priceless treasure... ",
  "Kyle was always the second pick. His brother Marvin? A coding prodigy.",
  "The previous workers were deceived by its cunning guise of innocence",
  "But I see the monster behind it, the devourer of coffee blood, destroyer of sanitation.",
  "You know what the raccoons are scared of ... OUR MEME faces! Let's show them"
];

const elementIds = [
  "typing-text",
  "typing-text1",
  "typing-text2",
  "typing-text3",
  "typing-text4",
  "typing-text5"
];

const typedAlready = new Set();

function typeLine(lineIndex) {
  if (lineIndex >= texts.length || typedAlready.has(lineIndex)) return;

  const currentElement = document.getElementById(elementIds[lineIndex]);
  if (!currentElement) return;

  currentElement.textContent = '';
  let charIndex = 0;

  typingSound.currentTime = 0;
  typingSound.play().catch(e => console.log("Typing sound error:", e));

  function typeChar() {
    if (charIndex < texts[lineIndex].length) {
      currentElement.textContent += texts[lineIndex].charAt(charIndex);
      charIndex++;
      setTimeout(typeChar, 40);
    } else {
      typingSound.pause();
      typedAlready.add(lineIndex);
    }
  }

  typeChar();
}

function startTypingIfNeeded(screenIndex) {
  if (screenIndex >= 0 && screenIndex <= 5) {
    typeLine(screenIndex);
  }
}

setupMemeTransition("screen-6", "easy-meme");
setupMemeTransition("screen-7", "medium-meme");
setupMemeTransition("screen-8", "hard-meme");

function setupMemeTransition(screenId, imgId) {
  const screen = document.getElementById(screenId);
  const img = document.getElementById(imgId);

  if (!screen || !img) return;

  img.style.transition = "transform 1s ease, opacity 1s ease";
  img.style.transform = "scale(0.5)";
  img.style.opacity = "0";

  const observer = new MutationObserver(() => {
    if (screen.classList.contains("active")) {
      img.style.transform = "scale(1)";
      img.style.opacity = "1";
    } else {
      img.style.transform = "scale(0.5)";
      img.style.opacity = "0";
    }
  });

  observer.observe(screen, { attributes: true, attributeFilter: ['class'] });
}

// Muffin Surprise
const muffinImg = document.querySelector('.muffin');
const muffinMessageBox = document.getElementById('muffin-message-box');

if (muffinImg) {
  muffinImg.addEventListener('click', () => {
    muffinMessageBox.style.display = 'block';
    muffinPartySound.currentTime = 0;
    muffinPartySound.play().catch(err => console.log("Sound error:", err));
  });
}


// Mute toggle
let isMuted = false;
const muteButton = document.getElementById('mute-toggle');

function updateMuteState() {
  allSounds.forEach(sound => {
    sound.muted = isMuted;
  });
  muteButton.textContent = isMuted ? '🔇' : '🔊';
}

if (muteButton) {
  muteButton.addEventListener('click', () => {
    isMuted = !isMuted;
    updateMuteState();
  });
}

typeLine(0);
