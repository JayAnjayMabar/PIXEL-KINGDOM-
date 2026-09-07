/* =========================================================
   PIXEL ADVENTURE
   FINAL ANIMATED GAME
========================================================= */


/* =========================================================
   GOOGLE APPS SCRIPT URL

   GANTI DENGAN URL WEB APP GOOGLE APPS SCRIPT
========================================================= */

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw8mnDh0Y4maPxoeh47GP44RVWyZnOmWLQe2kdHilhDp3l2u0XXJkdtohNXfPgQdZJ3qQ/exec";


/* =========================================================
   DOM
========================================================= */

const $ = id =>
  document.getElementById(id);


const screens = {

  start:
    $("startScreen"),

  game:
    $("gameScreen"),

  end:
    $("endScreen"),

  leaderboard:
    $("leaderboardScreen")

};


const canvas =
  $("gameCanvas");

const ctx =
  canvas.getContext("2d");


/* =========================================================
   CANVAS
========================================================= */

let screenWidth = 0;

let screenHeight = 0;

let devicePixelRatioValue = 1;


function resizeCanvas() {

  devicePixelRatioValue =
    Math.min(
      window.devicePixelRatio || 1,
      2
    );

  screenWidth =
    window.innerWidth;

  screenHeight =
    window.innerHeight;


  canvas.width =
    screenWidth *
    devicePixelRatioValue;

  canvas.height =
    screenHeight *
    devicePixelRatioValue;


  canvas.style.width =
    screenWidth + "px";

  canvas.style.height =
    screenHeight + "px";

  ctx.setTransform(
    devicePixelRatioValue,
    0,
    0,
    devicePixelRatioValue,
    0,
    0
  );
}


window.addEventListener(
  "resize",
  resizeCanvas
);

resizeCanvas();


/* =========================================================
   GAME STATE
========================================================= */

const state = {

  playerName: "",

  password: "",

  score: 0,

  coins: 0,

  lives: 3,

  running: false,

  won: false,

  gameStartedAt: 0,

  cameraX: 0,

  shake: 0

};


/* =========================================================
   WORLD
========================================================= */

const WORLD_WIDTH = 5000;

const GROUND_Y = 520;


/* =========================================================
   PLAYER
========================================================= */

const player = {

  x: 100,

  y: 350,

  width: 36,

  height: 48,

  vx: 0,

  vy: 0,

  speed: 5.3,

  jumpPower: -14.2,

  gravity: .72,

  grounded: false,

  facing: 1,

  invincible: 0,

  walkFrame: 0

};


/* =========================================================
   INPUT
========================================================= */

const input = {

  left: false,

  right: false

};


/* =========================================================
   LEVEL
========================================================= */

let platforms = [];

let coins = [];

let enemies = [];

let particles = [];


/* =========================================================
   GOAL
========================================================= */

const goal = {

  x: 4650,

  y: 400,

  width: 70,

  height: 120

};


/* =========================================================
   ANIMATION TIME
========================================================= */

let animationTime = 0;


/* =========================================================
   AUDIO
========================================================= */

let audioContext = null;

let masterGain = null;

let musicInterval = null;

let musicOn = true;

let melodyIndex = 0;


const melody = [

  261.63,
  329.63,
  392.00,
  329.63,

  293.66,
  349.23,
  440.00,
  349.23,

  261.63,
  329.63,
  392.00,
  523.25

];


/* =========================================================
   AUDIO INIT
========================================================= */

function initAudio() {

  if (audioContext)
    return;


  const AudioContextClass =
    window.AudioContext ||
    window.webkitAudioContext;


  if (!AudioContextClass)
    return;


  audioContext =
    new AudioContextClass();


  masterGain =
    audioContext.createGain();


  masterGain.gain.value =
    .035;


  masterGain.connect(
    audioContext.destination
  );
}


/* =========================================================
   NOTE
========================================================= */

function playNote(
  frequency,
  duration = .15,
  volume = .1
) {

  if (!audioContext)
    return;


  const oscillator =
    audioContext.createOscillator();


  const gain =
    audioContext.createGain();


  oscillator.type =
    "square";


  oscillator.frequency.value =
    frequency;


  gain.gain.setValueAtTime(
    .0001,
    audioContext.currentTime
  );


  gain.gain.exponentialRampToValueAtTime(
    volume,
    audioContext.currentTime + .02
  );


  gain.gain.exponentialRampToValueAtTime(
    .0001,
    audioContext.currentTime + duration
  );


  oscillator.connect(gain);

  gain.connect(masterGain);


  oscillator.start();


  oscillator.stop(
    audioContext.currentTime +
    duration
  );
}


/* =========================================================
   MUSIC
========================================================= */

function startMusic() {

  if (!musicOn)
    return;


  initAudio();


  if (!audioContext)
    return;


  if (
    audioContext.state ===
    "suspended"
  ) {

    audioContext.resume();
  }


  if (musicInterval)
    return;


  melodyIndex = 0;


  musicInterval =
    setInterval(
      () => {

        playNote(
          melody[melodyIndex],
          .18,
          .07
        );


        melodyIndex =
          (
            melodyIndex + 1
          ) %
          melody.length;

      },
      260
    );
}


/* =========================================================
   STOP MUSIC
========================================================= */

function stopMusic() {

  if (
    musicInterval
  ) {

    clearInterval(
      musicInterval
    );

    musicInterval = null;
  }
}


/* =========================================================
   SOUND EFFECT
========================================================= */

function soundEffect(
  frequency,
  duration = .1,
  volume = .12
) {

  initAudio();

  playNote(
    frequency,
    duration,
    volume
  );
}


/* =========================================================
   CREATE LEVEL
========================================================= */

function createLevel() {

  platforms = [

    {
      x: 0,
      y: 520,
      width: 850,
      height: 110
    },

    {
      x: 980,
      y: 520,
      width: 650,
      height: 110
    },

    {
      x: 1760,
      y: 520,
      width: 850,
      height: 110
    },

    {
      x: 2740,
      y: 520,
      width: 650,
      height: 110
    },

    {
      x: 3520,
      y: 520,
      width: 1180,
      height: 110
    },


    {
      x: 350,
      y: 410,
      width: 180,
      height: 24
    },

    {
      x: 650,
      y: 340,
      width: 160,
      height: 24
    },

    {
      x: 1100,
      y: 410,
      width: 190,
      height: 24
    },

    {
      x: 1430,
      y: 340,
      width: 150,
      height: 24
    },

    {
      x: 1850,
      y: 400,
      width: 180,
      height: 24
    },

    {
      x: 2150,
      y: 330,
      width: 200,
      height: 24
    },

    {
      x: 2500,
      y: 400,
      width: 150,
      height: 24
    },

    {
      x: 2850,
      y: 390,
      width: 190,
      height: 24
    },

    {
      x: 3200,
      y: 330,
      width: 160,
      height: 24
    },

    {
      x: 3700,
      y: 400,
      width: 200,
      height: 24
    },

    {
      x: 4050,
      y: 330,
      width: 190,
      height: 24
    },

    {
      x: 4350,
      y: 400,
      width: 150,
      height: 24
    }

  ];


  const coinPositions = [

    [390, 365],
    [440, 365],
    [490, 365],

    [690, 295],
    [740, 295],

    [1140, 365],
    [1190, 365],

    [1460, 295],

    [1890, 355],
    [1940, 355],

    [2190, 285],
    [2240, 285],
    [2290, 285],

    [2540, 355],

    [2890, 345],
    [2940, 345],

    [3240, 285],

    [3750, 355],
    [3800, 355],

    [4100, 285],
    [4150, 285],

    [4390, 355],

    [4580, 455]

  ];


  coins =
    coinPositions.map(
      position => ({

        x: position[0],

        y: position[1],

        radius: 11,

        collected: false,

        rotation:
          Math.random() *
          Math.PI * 2,

        phase:
          Math.random() *
          Math.PI * 2

      })
    );


  enemies = [

    createEnemy(
      600,
      485,
      1.3
    ),

    createEnemy(
      1200,
      485,
      -1.4
    ),

    createEnemy(
      1920,
      485,
      1.5
    ),

    createEnemy(
      2350,
      485,
      -1.3
    ),

    createEnemy(
      2920,
      485,
      1.4
    ),

    createEnemy(
      3750,
      485,
      -1.5
    ),

    createEnemy(
      4200,
      485,
      1.4
    )

  ];


  particles = [];
}


/* =========================================================
   CREATE ENEMY
========================================================= */

function createEnemy(
  x,
  y,
  speed
) {

  return {

    x,

    y,

    width: 36,

    height: 35,

    speed,

    startX: x,

    distance: 120,

    alive: true,

    frame: 0

  };
}


/* =========================================================
   RESET PLAYER
========================================================= */

function resetPlayer() {

  player.x = 100;

  player.y = 350;

  player.vx = 0;

  player.vy = 0;

  player.grounded = false;

  player.invincible = 100;

  state.cameraX = 0;

  state.shake = 0;
}


/* =========================================================
   START GAME
========================================================= */

function startGame() {

  const name =
    $("username")
      .value
      .trim();


  const password =
    $("password")
      .value
      .trim();


  $("startError")
    .textContent = "";


  if (
    name.length < 3
  ) {

    $("startError")
      .textContent =
      "Nama player minimal 3 karakter.";

    return;
  }


  if (
    !/^[a-zA-Z0-9 _.-]+$/.test(
      name
    )
  ) {

    $("startError")
      .textContent =
      "Nama mengandung karakter yang tidak valid.";

    return;
  }


  if (
    password.length < 4
  ) {

    $("startError")
      .textContent =
      "Password minimal 4 karakter.";

    return;
  }


  state.playerName =
    name;

  state.password =
    password;

  state.score = 0;

  state.coins = 0;

  state.lives = 3;

  state.won = false;

  state.running = true;

  state.gameStartedAt =
    Date.now();


  createLevel();

  resetPlayer();

  updateHUD();

  showScreen(
    screens.game
  );


  initAudio();

  startMusic();


  requestAnimationFrame(
    gameLoop
  );
}


/* =========================================================
   SCREEN
========================================================= */

function showScreen(
  screen
) {

  Object.values(
    screens
  ).forEach(
    item => {

      item.classList.remove(
        "active"
      );

    }
  );


  screen.classList.add(
    "active"
  );
}


/* =========================================================
   KEYBOARD
========================================================= */

window.addEventListener(
  "keydown",
  event => {

    const key =
      event.key.toLowerCase();


    if (
      key === "arrowleft" ||
      key === "a"
    ) {

      input.left = true;

      event.preventDefault();
    }


    if (
      key === "arrowright" ||
      key === "d"
    ) {

      input.right = true;

      event.preventDefault();
    }


    if (
      key === "arrowup" ||
      key === " "
    ) {

      event.preventDefault();

      jump();
    }

  }
);


window.addEventListener(
  "keyup",
  event => {

    const key =
      event.key.toLowerCase();


    if (
      key === "arrowleft" ||
      key === "a"
    ) {

      input.left = false;
    }


    if (
      key === "arrowright" ||
      key === "d"
    ) {

      input.right = false;
    }

  }
);


/* =========================================================
   MOBILE BUTTON
========================================================= */

function setupHoldButton(
  element,
  direction
) {

  const press =
    event => {

      event.preventDefault();

      input[direction] =
        true;
    };


  const release =
    event => {

      event.preventDefault();

      input[direction] =
        false;
    };


  element.addEventListener(
    "pointerdown",
    press
  );

  element.addEventListener(
    "pointerup",
    release
  );

  element.addEventListener(
    "pointercancel",
    release
  );

  element.addEventListener(
    "pointerleave",
    release
  );
}


setupHoldButton(
  $("leftBtn"),
  "left"
);


setupHoldButton(
  $("rightBtn"),
  "right"
);


$("jumpBtn")
  .addEventListener(
    "pointerdown",
    event => {

      event.preventDefault();

      jump();

    }
  );


/* =========================================================
   JUMP
========================================================= */

function jump() {

  if (
    !state.running
  )
    return;


  if (
    !player.grounded
  )
    return;


  player.vy =
    player.jumpPower;


  player.grounded =
    false;


  createParticles(
    player.x + player.width / 2,
    player.y + player.height,
    5,
    "jump"
  );


  soundEffect(
    700,
    .12,
    .08
  );
}


/* =========================================================
   COLLISION
========================================================= */

function intersects(
  a,
  b
) {

  return (

    a.x <
      b.x + b.width &&

    a.x + a.width >
      b.x &&

    a.y <
      b.y + b.height &&

    a.y + a.height >
      b.y

  );
}


/* =========================================================
   PLAYER UPDATE
========================================================= */

function updatePlayer() {

  if (
    input.left
  ) {

    player.vx =
      -player.speed;

    player.facing =
      -1;

  } else if (
    input.right
  ) {

    player.vx =
      player.speed;

    player.facing =
      1;

  } else {

    player.vx *=
      .76;
  }


  if (
    Math.abs(player.vx) >
    .3 &&
    player.grounded
  ) {

    player.walkFrame +=
      .28;

  } else {

    player.walkFrame =
      0;
  }


  player.vy +=
    player.gravity;


  const previousY =
    player.y;


  player.x +=
    player.vx;


  player.y +=
    player.vy;


  if (
    player.x < 0
  ) {

    player.x = 0;
  }


  if (
    player.x >
    WORLD_WIDTH -
    player.width
  ) {

    player.x =
      WORLD_WIDTH -
      player.width;
  }


  player.grounded =
    false;


  for (
    const platform of platforms
  ) {

    const previousBottom =
      previousY +
      player.height;


    const currentBottom =
      player.y +
      player.height;


    const horizontal =
      player.x +
      player.width >
      platform.x &&
      player.x <
      platform.x +
      platform.width;


    if (
      horizontal &&
      player.vy >= 0 &&
      previousBottom <=
      platform.y &&
      currentBottom >=
      platform.y
    ) {

      player.y =
        platform.y -
        player.height;

      player.vy =
        0;

      player.grounded =
        true;

      break;
    }
  }


  if (
    player.invincible > 0
  ) {

    player.invincible--;
  }


  const targetCamera =
    player.x -
    screenWidth * .35;


  state.cameraX +=
    (
      targetCamera -
      state.cameraX
    ) * .08;


  const maxCamera =
    Math.max(
      0,
      WORLD_WIDTH -
      screenWidth
    );


  state.cameraX =
    Math.max(
      0,
      Math.min(
        state.cameraX,
        maxCamera
      )
    );


  if (
    player.y >
    screenHeight +
    180
  ) {

    loseLife();
  }
}


/* =========================================================
   COIN UPDATE
========================================================= */

function updateCoins() {

  for (
    const coin of coins
  ) {

    if (
      coin.collected
    )
      continue;


    coin.rotation +=
      .12;


    const box = {

      x:
        coin.x -
        coin.radius,

      y:
        coin.y -
        coin.radius,

      width:
        coin.radius * 2,

      height:
        coin.radius * 2

    };


    if (
      intersects(
        player,
        box
      )
    ) {

      coin.collected =
        true;


      state.coins++;

      state.score +=
        50;


      createParticles(
        coin.x,
        coin.y,
        15,
        "coin"
      );


      soundEffect(
        980,
        .12,
        .1
      );


      updateHUD();
    }
  }
}


/* =========================================================
   ENEMY UPDATE
========================================================= */

function updateEnemies() {

  for (
    const enemy of enemies
  ) {

    if (
      !enemy.alive
    )
      continue;


    enemy.frame +=
      .12;


    enemy.x +=
      enemy.speed;


    if (
      Math.abs(
        enemy.x -
        enemy.startX
      ) >
      enemy.distance
    ) {

      enemy.speed *=
        -1;
    }


    if (
      player.invincible <= 0 &&
      intersects(
        player,
        enemy
      )
    ) {

      const stomp =
        player.vy > 0 &&
        player.y +
        player.height <
        enemy.y + 18;


      if (
        stomp
      ) {

        enemy.alive =
          false;


        player.vy =
          player.jumpPower *
          .55;


        state.score +=
          100;


        createParticles(
          enemy.x +
          enemy.width / 2,

          enemy.y +
          enemy.height / 2,

          18,

          "enemy"
        );


        state.shake =
          7;


        soundEffect(
          800,
          .13,
          .1
        );


        updateHUD();

      } else {

        loseLife();
      }
    }
  }
}


/* =========================================================
   GOAL
========================================================= */

function checkGoal() {

  const goalBox = {

    x:
      goal.x,

    y:
      goal.y,

    width:
      goal.width,

    height:
      goal.height

  };


  if (
    intersects(
      player,
      goalBox
    )
  ) {

    finishGame(true);
  }
}


/* =========================================================
   LOSE LIFE
========================================================= */

function loseLife() {

  if (
    !state.running
  )
    return;


  if (
    player.invincible > 0
  )
    return;


  state.lives--;


  state.shake =
    12;


  createParticles(
    player.x +
    player.width / 2,

    player.y +
    player.height / 2,

    20,

    "hit"
  );


  soundEffect(
    180,
    .2,
    .12
  );


  updateHUD();


  if (
    state.lives <= 0
  ) {

    finishGame(false);

    return;
  }


  resetPlayer();
}


/* =========================================================
   PARTICLES
========================================================= */

function createParticles(
  x,
  y,
  amount,
  type
) {

  for (
    let i = 0;
    i < amount;
    i++
  ) {

    let color = "#ffffff";


    if (
      type === "coin"
    ) {

      color =
        Math.random() >
        .5
          ? "#ffe047"
          : "#fff5a0";
    }


    if (
      type === "enemy"
    ) {

      color =
        Math.random() >
        .5
          ? "#9b72ff"
          : "#ffffff";
    }


    if (
      type === "hit"
    ) {

      color =
        Math.random() >
        .5
          ? "#ff526e"
          : "#ffffff";
    }


    particles.push({

      x,

      y,

      vx:
        (Math.random() -
        .5) * 7,

      vy:
        (Math.random() -
        .8) * 8,

      size:
        Math.random() *
        5 + 2,

      life:
        30 +
        Math.random() *
        30,

      maxLife:
        60,

      color,

      gravity:
        .25

    });
  }
}


/* =========================================================
   PARTICLE UPDATE
========================================================= */

function updateParticles() {

  particles =
    particles.filter(
      particle =>
        particle.life > 0
    );


  particles.forEach(
    particle => {

      particle.x +=
        particle.vx;

      particle.y +=
        particle.vy;

      particle.vy +=
        particle.gravity;

      particle.life--;
    }
  );
}


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

  $("hudPlayer")
    .textContent =
    state.playerName ||
    "PLAYER";


  $("hudScore")
    .textContent =
    state.score.toLocaleString(
      "id-ID"
    );


  $("hudCoins")
    .textContent =
    state.coins;


  $("hudLives")
    .textContent =
    "♥".repeat(
      Math.max(
        0,
        state.lives
      )
    );
}


/* =========================================================
   BACKGROUND
========================================================= */

function drawBackground() {

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      screenHeight
    );


  gradient.addColorStop(
    0,
    "#52c8f1"
  );


  gradient.addColorStop(
    1,
    "#dff8ff"
  );


  ctx.fillStyle =
    gradient;


  ctx.fillRect(
    0,
    0,
    screenWidth,
    screenHeight
  );


  drawSun();


  drawCloudLayer(
    .15,
    .7
  );


  drawCloudLayer(
    .28,
    1
  );


  drawHills(
    .3,
    "#86d477",
    screenHeight * .73
  );


  drawHills(
    .5,
    "#5bbd68",
    screenHeight * .84
  );
}


/* =========================================================
   SUN
========================================================= */

function drawSun() {

  const x =
    screenWidth -
    100 -
    state.cameraX * .05;

  const y =
    100;


  const glow =
    ctx.createRadialGradient(
      x,
      y,
      10,
      x,
      y,
      80
    );


  glow.addColorStop(
    0,
    "rgba(255,240,130,.9)"
  );

  glow.addColorStop(
    1,
    "rgba(255,240,130,0)"
  );


  ctx.fillStyle =
    glow;


  ctx.beginPath();

  ctx.arc(
    x,
    y,
    80,
    0,
    Math.PI * 2
  );

  ctx.fill();


  ctx.fillStyle =
    "#ffe76b";


  ctx.beginPath();

  ctx.arc(
    x,
    y,
    34,
    0,
    Math.PI * 2
  );

  ctx.fill();
}


/* =========================================================
   CLOUDS
========================================================= */

function drawCloudLayer(
  parallax,
  speed
) {

  ctx.fillStyle =
    "rgba(255,255,255,.7)";


  for (
    let i = 0;
    i < 12;
    i++
  ) {

    const x =
      i * 520 -
      state.cameraX *
      parallax;

    const y =
      80 +
      (i % 4) * 70;


    drawCloud(
      x,
      y
    );
  }
}


/* =========================================================
   CLOUD
========================================================= */

function drawCloud(
  x,
  y
) {

  const wrap =
    screenWidth + 300;


  x =
    (
      x % wrap +
      wrap
    ) % wrap -
    100;


  ctx.beginPath();


  ctx.arc(
    x,
    y,
    23,
    0,
    Math.PI * 2
  );


  ctx.arc(
    x + 30,
    y - 14,
    34,
    0,
    Math.PI * 2
  );


  ctx.arc(
    x + 65,
    y,
    24,
    0,
    Math.PI * 2
  );


  ctx.fill();
}


/* =========================================================
   HILLS
========================================================= */

function drawHills(
  parallax,
  color,
  y
) {

  ctx.fillStyle =
    color;


  for (
    let i = -2;
    i < 15;
    i++
  ) {

    const x =
      i * 520 -
      state.cameraX *
      parallax;


    ctx.beginPath();


    ctx.arc(
      x,
      y,
      210,
      Math.PI,
      0
    );


    ctx.lineTo(
      x + 420,
      screenHeight
    );


    ctx.lineTo(
      x - 210,
      screenHeight
    );


    ctx.closePath();

    ctx.fill();
  }
}


/* =========================================================
   PLATFORM
========================================================= */

function drawPlatform(
  platform
) {

  const x =
    platform.x -
    state.cameraX;


  ctx.fillStyle =
    "#694229";


  ctx.fillRect(
    x,
    platform.y,
    platform.width,
    platform.height
  );


  ctx.fillStyle =
    "#43ad55";


  ctx.fillRect(
    x,
    platform.y,
    platform.width,
    12
  );


  ctx.fillStyle =
    "#29913f";


  ctx.fillRect(
    x,
    platform.y + 10,
    platform.width,
    4
  );


  ctx.fillStyle =
    "rgba(0,0,0,.13)";


  for (
    let i = 0;
    i < platform.width;
    i += 45
  ) {

    ctx.fillRect(
      x + i,
      platform.y + 30,
      22,
      8
    );
  }
}


/* =========================================================
   COIN
========================================================= */

function drawCoin(
  coin
) {

  if (
    coin.collected
  )
    return;


  const x =
    coin.x -
    state.cameraX;


  const y =
    coin.y +
    Math.sin(
      animationTime * .006 +
      coin.phase
    ) * 5;


  const scale =
    Math.abs(
      Math.cos(
        coin.rotation
      )
    );


  ctx.save();


  ctx.translate(
    x,
    y
  );


  ctx.scale(
    Math.max(
      .15,
      scale
    ),
    1
  );


  ctx.fillStyle =
    "#ffd83d";


  ctx.beginPath();

  ctx.arc(
    0,
    0,
    coin.radius,
    0,
    Math.PI * 2
  );

  ctx.fill();


  ctx.strokeStyle =
    "#e7a900";

  ctx.lineWidth =
    3;

  ctx.stroke();


  ctx.fillStyle =
    "#fff4a0";


  ctx.fillRect(
    -2,
    -6,
    4,
    12
  );


  ctx.restore();
}


/* =========================================================
   ENEMY
========================================================= */

function drawEnemy(
  enemy
) {

  if (
    !enemy.alive
  )
    return;


  const x =
    enemy.x -
    state.cameraX;


  const bounce =
    Math.sin(
      enemy.frame
    ) * 2;


  const y =
    enemy.y +
    bounce;


  ctx.fillStyle =
    "#7956c9";


  ctx.fillRect(
    x,
    y,
    enemy.width,
    enemy.height
  );


  ctx.fillStyle =
    "#49317d";


  ctx.fillRect(
    x + 4,
    y + 27,
    28,
    8
  );


  ctx.fillStyle =
    "#ffffff";


  ctx.fillRect(
    x + 7,
    y + 8,
    8,
    8
  );


  ctx.fillRect(
    x + 21,
    y + 8,
    8,
    8
  );


  ctx.fillStyle =
    "#171225";


  ctx.fillRect(
    x + 10,
    y + 10,
    4,
    6
  );


  ctx.fillRect(
    x + 23,
    y + 10,
    4,
    6
  );
}


/* =========================================================
   PLAYER
========================================================= */

function drawPlayer() {

  if (
    player.invincible > 0 &&
    Math.floor(
      player.invincible / 5
    ) % 2 === 0
  ) {

    return;
  }


  const x =
    player.x -
    state.cameraX;


  const y =
    player.y;


  const moving =
    Math.abs(
      player.vx
    ) > .5 &&
    player.grounded;


  const legOffset =
    moving
      ? Math.sin(
          player.walkFrame
        ) * 4
      : 0;


  ctx.save();


  ctx.translate(
    x + player.width / 2,
    y
  );


  if (
    player.facing < 0
  ) {

    ctx.scale(
      -1,
      1
    );
  }


  /* shadow */

  ctx.fillStyle =
    "rgba(0,0,0,.2)";


  ctx.fillRect(
    -16,
    46,
    32,
    5
  );


  /* cape/back */

  ctx.fillStyle =
    "#e63f4e";


  ctx.fillRect(
    -17,
    17,
    7,
    18
  );


  /* body */

  ctx.fillStyle =
    "#ff4757";


  ctx.fillRect(
    -13,
    12,
    26,
    22
  );


  /* face */

  ctx.fillStyle =
    "#ffc8a6";


  ctx.fillRect(
    -11,
    17,
    22,
    18
  );


  /* hat */

  ctx.fillStyle =
    "#e43d4b";


  ctx.fillRect(
    -16,
    5,
    29,
    10
  );


  ctx.fillRect(
    -8,
    0,
    19,
    8
  );


  /* hat highlight */

  ctx.fillStyle =
    "#ff6875";


  ctx.fillRect(
    -5,
    2,
    10,
    3
  );


  /* eyes */

  ctx.fillStyle =
    "#151522";


  ctx.fillRect(
    0,
    22,
    4,
    5
  );


  ctx.fillRect(
    8,
    22,
    4,
    5
  );


  /* legs */

  ctx.fillStyle =
    "#313b54";


  ctx.fillRect(
    -12,
    34,
    10,
    12 + legOffset
  );


  ctx.fillRect(
    3,
    34,
    10,
    12 - legOffset
  );


  /* shoes */

  ctx.fillStyle =
    "#202637";


  ctx.fillRect(
    -14,
    44 + legOffset,
    13,
    5
  );


  ctx.fillRect(
    3,
    44 - legOffset,
    13,
    5
  );


  ctx.restore();
}


/* =========================================================
   GOAL
========================================================= */

function drawGoal() {

  const x =
    goal.x -
    state.cameraX;


  const wave =
    Math.sin(
      animationTime * .006
    ) * 5;


  ctx.fillStyle =
    "#f7f7f7";


  ctx.fillRect(
    x + 20,
    goal.y,
    7,
    120
  );


  ctx.fillStyle =
    "#ff4c62";


  ctx.beginPath();


  ctx.moveTo(
    x + 27,
    goal.y
  );


  ctx.lineTo(
    x + 75,
    goal.y + 20 + wave
  );


  ctx.lineTo(
    x + 27,
    goal.y + 43
  );


  ctx.closePath();


  ctx.fill();


  ctx.fillStyle =
    "#ffffff";


  ctx.fillRect(
    x + 12,
    goal.y + 112,
    23,
    8
  );
}


/* =========================================================
   PARTICLES DRAW
========================================================= */

function drawParticles() {

  particles.forEach(
    particle => {

      const alpha =
        particle.life /
        particle.maxLife;


      ctx.globalAlpha =
        Math.max(
          0,
          alpha
        );


      ctx.fillStyle =
        particle.color;


      ctx.fillRect(
        particle.x -
        state.cameraX,

        particle.y,

        particle.size,

        particle.size
      );
    }
  );


  ctx.globalAlpha =
    1;
}


/* =========================================================
   DRAW
========================================================= */

function draw() {

  drawBackground();


  ctx.save();


  if (
    state.shake > 0
  ) {

    const shakeX =
      (
        Math.random() -
        .5
      ) *
      state.shake;


    const shakeY =
      (
        Math.random() -
        .5
      ) *
      state.shake;


    ctx.translate(
      shakeX,
      shakeY
    );


    state.shake *=
      .88;


    if (
      state.shake < .3
    ) {

      state.shake = 0;
    }
  }


  platforms.forEach(
    platform =>
      drawPlatform(
        platform
      )
  );


  coins.forEach(
    coin =>
      drawCoin(
        coin
      )
  );


  enemies.forEach(
    enemy =>
      drawEnemy(
        enemy
      )
  );


  drawGoal();

  drawPlayer();

  drawParticles();


  ctx.restore();
}


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop(
  timestamp
) {

  if (
    !state.running
  )
    return;


  animationTime =
    timestamp;


  updatePlayer();

  updateCoins();

  updateEnemies();

  updateParticles();

  checkGoal();

  draw();


  requestAnimationFrame(
    gameLoop
  );
}


/* =========================================================
   FINISH
========================================================= */

function finishGame(
  won
) {

  if (
    !state.running
  )
    return;


  state.running =
    false;


  state.won =
    won;


  stopMusic();


  if (
    won
  ) {

    state.score +=
      500;


    createParticles(
      goal.x,
      goal.y + 30,
      50,
      "coin"
    );


    soundEffect(
      523.25,
      .25,
      .13
    );


    setTimeout(
      () =>
        soundEffect(
          659.25,
          .25,
          .13
        ),
      180
    );


    $("resultIcon")
      .textContent =
      "🏆";


    $("resultTitle")
      .textContent =
      "LEVEL SELESAI";

  } else {

    $("resultIcon")
      .textContent =
      "💫";


    $("resultTitle")
      .textContent =
      "GAME OVER";
  }


  $("resultPlayer")
    .textContent =
    state.playerName;


  $("finalScore")
    .textContent =
    state.score.toLocaleString(
      "id-ID"
    );


  $("finalCoins")
    .textContent =
    state.coins;


  $("finalStatus")
    .textContent =
    won
      ? "FINISH"
      : "GAME OVER";


  showScreen(
    screens.end
  );


  saveScore();
}


/* =========================================================
   SAVE SCORE
========================================================= */

async function saveScore() {

  if (
    !GOOGLE_SCRIPT_URL ||
    GOOGLE_SCRIPT_URL.includes(
      "PASTE_URL"
    )
  ) {

    console.warn(
      "Google Apps Script belum dipasang."
    );

    return;
  }


  try {

    await fetch(
      GOOGLE_SCRIPT_URL,
      {

        method:
          "POST",

        mode:
          "no-cors",

        headers: {

          "Content-Type":
            "text/plain;charset=utf-8"

        },

        body:
          JSON.stringify({

            action:
              "save",

            username:
              state.playerName,

            score:
              state.score,

            coins:
              state.coins,

            status:
              state.won
                ? "FINISH"
                : "GAME OVER"

          })

      }
    );

  } catch (
    error
  ) {

    console.error(
      "Save score error:",
      error
    );
  }
}


/* =========================================================
   LOAD LEADERBOARD
========================================================= */

async function loadLeaderboard() {

  const list =
    $("leaderboardList");


  list.innerHTML =
    `<div class="leader-loading">
      ⏳ Memuat leaderboard...
    </div>`;


  if (
    !GOOGLE_SCRIPT_URL ||
    GOOGLE_SCRIPT_URL.includes(
      "PASTE_URL"
    )
  ) {

    list.innerHTML =
      `<div class="leader-loading">
        ⚠️ URL Google Apps Script belum dipasang.
      </div>`;

    return;
  }


  try {

    const response =
      await fetch(
        GOOGLE_SCRIPT_URL +
        "?action=leaderboard"
      );


    if (
      !response.ok
    ) {

      throw new Error(
        "Server error"
      );
    }


    const result =
      await response.json();


    if (
      !result.success
    ) {

      throw new Error(
        result.message
      );
    }


    renderLeaderboard(
      result.data || []
    );

  } catch (
    error
  ) {

    console.error(
      error
    );


    list.innerHTML =
      `<div class="leader-loading">
        ❌ Gagal memuat leaderboard.
        <br><br>
        Periksa URL Google Apps Script.
      </div>`;
  }
}


/* =========================================================
   LEADERBOARD RENDER
========================================================= */

function renderLeaderboard(
  data
) {

  const list =
    $("leaderboardList");


  list.innerHTML =
    "";


  if (
    data.length === 0
  ) {

    list.innerHTML =
      `<div class="leader-loading">
        Belum ada pemain.
      </div>`;

    return;
  }


  data
    .slice(
      0,
      50
    )
    .forEach(
      (item, index) => {

        const row =
          document.createElement(
            "div"
          );


        row.className =
          "leader-row";


        row.style.animationDelay =
          `${index * .04}s`;


        let rank =
          String(
            index + 1
          );


        if (
          index === 0
        ) rank = "🥇";


        if (
          index === 1
        ) rank = "🥈";


        if (
          index === 2
        ) rank = "🥉";


        row.innerHTML = `

          <div class="rank">
            ${rank}
          </div>

          <div class="player-info">

            <strong>
              ${escapeHTML(
                item.username
              )}
            </strong>

            <small>
              🪙 ${Number(
                item.coins || 0
              )}
            </small>

          </div>

          <div class="player-score">

            ${Number(
              item.score || 0
            ).toLocaleString(
              "id-ID"
            )}

          </div>

        `;


        list.appendChild(
          row
        );
      }
    );
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
  value
) {

  const element =
    document.createElement(
      "div"
    );


  element.textContent =
    String(
      value
    );


  return element.innerHTML;
}


/* =========================================================
   BUTTONS
========================================================= */

$("startBtn")
  .addEventListener(
    "click",
    startGame
  );


$("leaderboardBtn")
  .addEventListener(
    "click",
    () => {

      showScreen(
        screens.leaderboard
      );

      loadLeaderboard();
    }
  );


$("endLeaderboardBtn")
  .addEventListener(
    "click",
    () => {

      showScreen(
        screens.leaderboard
      );

      loadLeaderboard();
    }
  );


$("refreshLeaderboard")
  .addEventListener(
    "click",
    loadLeaderboard
  );


$("closeLeaderboard")
  .addEventListener(
    "click",
    () => {

      showScreen(
        screens.start
      );
    }
  );


$("againBtn")
  .addEventListener(
    "click",
    () => {

      startGame();
    }
  );


$("backBtn")
  .addEventListener(
    "click",
    () => {

      state.running =
        false;


      input.left =
        false;

      input.right =
        false;


      stopMusic();


      showScreen(
        screens.start
      );
    }
  );


/* =========================================================
   MUSIC BUTTON
========================================================= */

$("musicBtn")
  .addEventListener(
    "click",
    () => {

      musicOn =
        !musicOn;


      if (
        musicOn
      ) {

        $("musicBtn")
          .textContent =
          "🎵 SOUNDTRACK ON";


        initAudio();

        startMusic();

      } else {

        $("musicBtn")
          .textContent =
          "🔇 SOUNDTRACK OFF";


        stopMusic();
      }
    }
  );


/* =========================================================
   ENTER
========================================================= */

$("password")
  .addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Enter"
      ) {

        startGame();
      }
    }
  );


/* =========================================================
   PREVENT MOBILE SCROLL
========================================================= */

document.addEventListener(
  "touchmove",
  event => {

    if (
      screens.game.classList.contains(
        "active"
      )
    ) {

      event.preventDefault();
    }

  },
  {
    passive: false
  }
);
