// ======================================================
// PIXEL KINGDOM ADVENTURE
// ======================================================

const canvas =
document.getElementById("gameCanvas");

const ctx =
canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;


canvas.width = 1280;
canvas.height = 720;


// ======================================================
// SCREEN
// ======================================================

const homeScreen =
document.getElementById("homeScreen");

const gameScreen =
document.getElementById("gameScreen");

const leaderboardScreen =
document.getElementById(
"leaderboardScreen"
);


// ======================================================
// PLAYER
// ======================================================

let player = {

username:"",
passwordHash:"",

score:0,
coins:0,
level:1

};


let lives = 3;

let gameRunning = false;

let gameFinished = false;

let cameraX = 0;


// ======================================================
// HERO
// ======================================================

const hero = {

x:150,

y:400,

width:42,

height:55,

vx:0,

vy:0,

speed:5,

jumpPower:14,

grounded:false

};


// ======================================================
// WORLD
// ======================================================

const WORLD_WIDTH = 4300;

const WORLD_HEIGHT = 720;


const platforms = [

{x:0,y:650,w:850,h:70},

{x:1000,y:650,w:650,h:70},

{x:1800,y:650,w:700,h:70},

{x:2650,y:650,w:1650,h:70},


{x:350,y:530,w:180,h:25},

{x:650,y:430,w:180,h:25},

{x:1100,y:520,w:180,h:25},

{x:1350,y:400,w:190,h:25},

{x:1900,y:520,w:180,h:25},

{x:2200,y:420,w:190,h:25},

{x:2750,y:520,w:180,h:25},

{x:3050,y:400,w:190,h:25},

{x:3400,y:500,w:190,h:25},

{x:3750,y:400,w:200,h:25}

];


// ======================================================
// COINS
// ======================================================

const coins = [

{x:400,y:485,taken:false},

{x:460,y:485,taken:false},

{x:700,y:385,taken:false},

{x:750,y:385,taken:false},

{x:1150,y:475,taken:false},

{x:1210,y:475,taken:false},

{x:1400,y:355,taken:false},

{x:1460,y:355,taken:false},

{x:1950,y:475,taken:false},

{x:2250,y:375,taken:false},

{x:2310,y:375,taken:false},

{x:2800,y:475,taken:false},

{x:2860,y:475,taken:false},

{x:3100,y:355,taken:false},

{x:3160,y:355,taken:false},

{x:3450,y:455,taken:false},

{x:3800,y:355,taken:false},

{x:3860,y:355,taken:false},

{x:4100,y:600,taken:false}

];


// ======================================================
// ENEMIES
// ======================================================

const enemies = [

{
x:550,
y:615,
width:40,
height:35,
vx:1.4,
min:300,
max:800,
alive:true
},

{
x:1200,
y:615,
width:40,
height:35,
vx:-1.3,
min:1000,
max:1600,
alive:true
},

{
x:2000,
y:615,
width:40,
height:35,
vx:1.5,
min:1800,
max:2450,
alive:true
},

{
x:2900,
y:615,
width:40,
height:35,
vx:-1.5,
min:2650,
max:3300,
alive:true
},

{
x:3550,
y:615,
width:40,
height:35,
vx:1.5,
min:3300,
max:4200,
alive:true
}

];


// ======================================================
// GOAL
// ======================================================

const goal = {

x:4180,

y:500,

width:30,

height:150

};


// ======================================================
// INPUT
// ======================================================

const keys = {};


window.addEventListener(
"keydown",
e => {

keys[e.code] = true;


if(
e.code === "Space" ||
e.code === "ArrowUp"
) {

e.preventDefault();

}


if(
(
e.code === "Space" ||
e.code === "ArrowUp"
) &&
hero.grounded &&
gameRunning
) {

hero.vy =
-hero.jumpPower;

playJumpSound();

}

});


window.addEventListener(
"keyup",
e => {

keys[e.code] = false;

});


// ======================================================
// MOBILE
// ======================================================

function mobileControl(id,key) {

const button =
document.getElementById(id);


button.addEventListener(
"touchstart",
e => {

e.preventDefault();

keys[key] = true;

},
{passive:false}
);


button.addEventListener(
"touchend",
e => {

e.preventDefault();

keys[key] = false;

},
{passive:false}
);

}


mobileControl(
"leftBtn",
"ArrowLeft"
);

mobileControl(
"rightBtn",
"ArrowRight"
);


document
.getElementById("jumpBtn")
.addEventListener(
"touchstart",
e => {

e.preventDefault();


if(
hero.grounded &&
gameRunning
) {

hero.vy =
-hero.jumpPower;

playJumpSound();

}

},
{passive:false}
);


// ======================================================
// START
// ======================================================

document
.getElementById("startBtn")
.addEventListener(
"click",
startGame
);


async function startGame() {

const username =
document
.getElementById("username")
.value
.trim();


const password =
document
.getElementById("password")
.value;


if(!username) {

alert(
"Masukkan nama player."
);

return;

}


if(password.length < 4) {

alert(
"Password minimal 4 karakter."
);

return;

}


player.username =
username;


player.passwordHash =
await hashPassword(password);


resetGame();


homeScreen
.classList
.remove("active");


gameScreen
.classList
.add("active");


gameRunning = true;

gameFinished = false;


startMusic();


requestAnimationFrame(
gameLoop
);

}


// ======================================================
// RESET
// ======================================================

function resetGame() {

hero.x = 150;

hero.y = 400;

hero.vx = 0;

hero.vy = 0;

cameraX = 0;

lives = 3;

player.score = 0;

player.coins = 0;

player.level = 1;


coins.forEach(
coin => {

coin.taken = false;

}
);


enemies.forEach(
enemy => {

enemy.alive = true;

}
);


document
.getElementById("gameMessage")
.classList
.add("hidden");


updateUI();

}


// ======================================================
// UI
// ======================================================

function updateUI() {

document
.getElementById("playerName")
.textContent =
player.username || "PLAYER";


document
.getElementById("scoreText")
.textContent =
player.score;


document
.getElementById("coinText")
.textContent =
player.coins;


document
.getElementById("livesText")
.textContent =
"❤️ " + lives;

}


// ======================================================
// COLLISION
// ======================================================

function hit(a,b) {

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


// ======================================================
// UPDATE
// ======================================================

function update() {

if(!gameRunning)
return;


// MOVEMENT

hero.vx = 0;


if(keys["ArrowLeft"])
hero.vx = -hero.speed;


if(keys["ArrowRight"])
hero.vx = hero.speed;


hero.x += hero.vx;


// GRAVITY

hero.vy += .65;

hero.y += hero.vy;

hero.grounded = false;


// PLATFORM

for(
const p of platforms
) {

if(

hero.x <
p.x + p.w &&

hero.x +
hero.width >
p.x &&

hero.y +
hero.height >=
p.y &&

hero.y +
hero.height <=
p.y + 35 &&

hero.vy >= 0

) {

hero.y =
p.y -
hero.height;

hero.vy = 0;

hero.grounded = true;

}

}


// WORLD LIMIT

if(hero.x < 0)
hero.x = 0;


// FALL

if(
hero.y >
WORLD_HEIGHT + 100
) {

loseLife();

}


// ENEMY

enemies.forEach(
enemy => {

if(!enemy.alive)
return;


enemy.x += enemy.vx;


if(
enemy.x <= enemy.min ||
enemy.x >= enemy.max
) {

enemy.vx *= -1;

}


const box = {

x:enemy.x,

y:enemy.y,

width:enemy.width,

height:enemy.height

};


if(hit(hero,box)) {

if(hero.vy > 0) {

enemy.alive = false;

hero.vy = -9;

player.score += 100;

playEnemySound();

}
else {

loseLife();

}

}

});


// COINS

coins.forEach(
coin => {

if(coin.taken)
return;


const dx =
hero.x +
hero.width/2 -
coin.x;


const dy =
hero.y +
hero.height/2 -
coin.y;


const distance =
Math.sqrt(
dx*dx +
dy*dy
);


if(distance < 40) {

coin.taken = true;

player.coins++;

player.score += 50;

playCoinSound();

}

});


// CAMERA

cameraX =
hero.x - 450;


cameraX =
Math.max(
0,
Math.min(
cameraX,
WORLD_WIDTH -
canvas.width
)
);


// GOAL

if(
hero.x +
hero.width >
goal.x
) {

finishGame();

}


updateUI();

}


// ======================================================
// LOSE LIFE
// ======================================================

function loseLife() {

if(!gameRunning)
return;


lives--;

updateUI();


if(lives <= 0) {

endGame();

return;

}


hero.x = 150;

hero.y = 400;

hero.vx = 0;

hero.vy = 0;

cameraX = 0;

playDamageSound();

}


// ======================================================
// FINISH
// ======================================================

async function finishGame() {

if(gameFinished)
return;


gameFinished = true;

gameRunning = false;


player.score += 500;


await saveScore({

username:
player.username,

passwordHash:
player.passwordHash,

score:
player.score,

coins:
player.coins,

level:
player.level

});


showMessage(
"🏆",
"LEVEL SELESAI!",
"Selamat! Kamu berhasil menyelesaikan stage."
);

}


// ======================================================
// GAME OVER
// ======================================================

async function endGame() {

gameRunning = false;

gameFinished = true;


await saveScore({

username:
player.username,

passwordHash:
player.passwordHash,

score:
player.score,

coins:
player.coins,

level:
player.level

});


showMessage(
"💥",
"GAME OVER",
"Kamu kehabisan nyawa."
);

}


// ======================================================
// MESSAGE
// ======================================================

function showMessage(
icon,
title,
text
) {

document
.getElementById("messageIcon")
.textContent =
icon;


document
.getElementById("messageTitle")
.textContent =
title;


document
.getElementById("messageText")
.textContent =
text;


document
.getElementById("finalScore")
.textContent =
player.score;


document
.getElementById("finalCoins")
.textContent =
player.coins;


document
.getElementById("gameMessage")
.classList
.remove("hidden");

}


// ======================================================
// DRAW
// ======================================================

function draw() {

ctx.clearRect(
0,
0,
canvas.width,
canvas.height
);


drawSky();

drawClouds();


ctx.save();

ctx.translate(
-cameraX,
0
);


drawPlatforms();

drawCoins();

drawEnemies();

drawGoal();

drawHero();


ctx.restore();

}


// ======================================================
// SKY
// ======================================================

function drawSky() {

const gradient =
ctx.createLinearGradient(
0,
0,
0,
canvas.height
);


gradient.addColorStop(
0,
"#48bff4"
);

gradient.addColorStop(
1,
"#c3f3ff"
);


ctx.fillStyle =
gradient;


ctx.fillRect(
0,
0,
canvas.width,
canvas.height
);

}


// ======================================================
// CLOUD
// ======================================================

function drawClouds() {

const clouds = [

{x:100,y:100},

{x:600,y:150},

{x:1100,y:90},

{x:1600,y:130},

{x:2200,y:80},

{x:2800,y:140},

{x:3400,y:90},

{x:4000,y:150}

];


ctx.fillStyle =
"rgba(255,255,255,.85)";


clouds.forEach(
c => {

drawCloud(
c.x -
cameraX*.2,
c.y
);

});

}


function drawCloud(x,y) {

ctx.beginPath();

ctx.arc(
x,
y,
25,
0,
Math.PI*2
);

ctx.arc(
x+30,
y-15,
34,
0,
Math.PI*2
);

ctx.arc(
x+65,
y,
25,
0,
Math.PI*2
);

ctx.fill();

}


// ======================================================
// PLATFORMS
// ======================================================

function drawPlatforms() {

platforms.forEach(
p => {

ctx.fillStyle =
"#2fbd65";


ctx.fillRect(
p.x,
p.y,
p.w,
12
);


ctx.fillStyle =
"#a85d37";


ctx.fillRect(
p.x,
p.y+12,
p.w,
p.h-12
);


ctx.fillStyle =
"rgba(0,0,0,.12)";


for(
let x=p.x;
x<p.x+p.w;
x+=35
) {

ctx.fillRect(
x,
p.y+25,
18,
9
);

}

});

}


// ======================================================
// COINS
// ======================================================

function drawCoins() {

coins.forEach(
coin => {

if(coin.taken)
return;


ctx.fillStyle =
"#ffd43b";


ctx.beginPath();

ctx.arc(
coin.x,
coin.y,
13,
0,
Math.PI*2
);

ctx.fill();


ctx.strokeStyle =
"#ed9d20";

ctx.lineWidth=3;

ctx.stroke();


ctx.fillStyle =
"#fff6a8";


ctx.fillRect(
coin.x-3,
coin.y-8,
4,
12
);

});

}


// ======================================================
// ENEMIES
// ======================================================

function drawEnemies() {

enemies.forEach(
enemy => {

if(!enemy.alive)
return;


ctx.fillStyle =
"#743d91";


ctx.fillRect(
enemy.x,
enemy.y,
enemy.width,
enemy.height
);


ctx.fillStyle =
"white";


ctx.fillRect(
enemy.x+7,
enemy.y+8,
8,
8
);


ctx.fillRect(
enemy.x+25,
enemy.y+8,
8,
8
);


ctx.fillStyle =
"#111";


ctx.fillRect(
enemy.x+10,
enemy.y+11,
4,
4
);


ctx.fillRect(
enemy.x+28,
enemy.y+11,
4,
4
);


ctx.fillRect(
enemy.x,
enemy.y+31,
11,
5
);


ctx.fillRect(
enemy.x+29,
enemy.y+31,
11,
5
);

});

}


// ======================================================
// GOAL
// ======================================================

function drawGoal() {

ctx.fillStyle =
"#eee";


ctx.fillRect(
goal.x,
goal.y,
7,
goal.height
);


ctx.fillStyle =
"#ff4964";


ctx.beginPath();

ctx.moveTo(
goal.x+7,
goal.y
);

ctx.lineTo(
goal.x+55,
goal.y+22
);

ctx.lineTo(
goal.x+7,
goal.y+44
);

ctx.fill();

}


// ======================================================
// HERO
// ======================================================

function drawHero() {


// shadow

ctx.fillStyle =
"rgba(0,0,0,.2)";


ctx.fillRect(
hero.x-5,
hero.y+hero.height,
hero.width+10,
6
);


// body

ctx.fillStyle =
"#e8445d";


ctx.fillRect(
hero.x+5,
hero.y+16,
32,
32
);


// head

ctx.fillStyle =
"#ffc99b";


ctx.fillRect(
hero.x+8,
hero.y+4,
25,
22
);


// hat

ctx.fillStyle =
"#e8445d";


ctx.fillRect(
hero.x+3,
hero.y,
34,
10
);


// eye

ctx.fillStyle =
"#111";


ctx.fillRect(
hero.x+27,
hero.y+12,
4,
5
);


// pants

ctx.fillStyle =
"#294eaa";


ctx.fillRect(
hero.x+5,
hero.y+42,
13,
13
);


ctx.fillRect(
hero.x+24,
hero.y+42,
13,
13
);

}


// ======================================================
// LOOP
// ======================================================

function gameLoop() {

update();

draw();


if(
gameRunning ||
!gameFinished
) {

requestAnimationFrame(
gameLoop
);

}

}


// ======================================================
// RESTART
// ======================================================

document
.getElementById("restartBtn")
.addEventListener(
"click",
() => {

resetGame();

gameRunning = true;

gameFinished = false;

startMusic();

requestAnimationFrame(
gameLoop
);

}
);


// ======================================================
// HOME
// ======================================================

document
.getElementById("homeBtn")
.addEventListener(
"click",
() => {

gameRunning = false;

gameFinished = true;

stopMusic();


gameScreen
.classList
.remove("active");


homeScreen
.classList
.add("active");

}
);


// ======================================================
// LEADERBOARD
// ======================================================

document
.getElementById("leaderboardBtn")
.addEventListener(
"click",
openLeaderboard
);


document
.getElementById("closeLeaderboard")
.addEventListener(
"click",
() => {

leaderboardScreen
.classList
.remove("active");


homeScreen
.classList
.add("active");

}
);


document
.getElementById("refreshLeaderboard")
.addEventListener(
"click",
loadLeaderboard
);


async function openLeaderboard() {

homeScreen
.classList
.remove("active");


leaderboardScreen
.classList
.add("active");


loadLeaderboard();

}


async function loadLeaderboard() {

const list =
document.getElementById(
"leaderboardList"
);


list.innerHTML = `
<div class="loading">
Memuat leaderboard...
</div>
`;


const data =
await getLeaderboard();


if(!data.length) {

list.innerHTML = `
<div class="loading">
Belum ada data pemain.
</div>
`;

return;

}


list.innerHTML =
data
.slice(0,10)
.map(
(item,index) => `

<div class="leader-row">

<div class="rank">
${rank(index)}
</div>

<div>

<div class="rank-name">
${escapeHTML(item.username)}
</div>

<div class="rank-date">
${escapeHTML(item.date || "")}
</div>

</div>

<div class="rank-score">
${Number(item.score || 0)}
</div>

</div>

`
)
.join("");

}


function rank(index) {

if(index===0)
return "🥇";

if(index===1)
return "🥈";

if(index===2)
return "🥉";

return "#" + (index+1);

}


function escapeHTML(text) {

return String(text)

.replaceAll("&","&amp;")

.replaceAll("<","&lt;")

.replaceAll(">","&gt;")

.replaceAll('"',"&quot;")

.replaceAll("'","&#039;");

}


// ======================================================
// PASSWORD HASH
// ======================================================

async function hashPassword(password) {

const data =
new TextEncoder()
.encode(password);


const hash =
await crypto.subtle.digest(
"SHA-256",
data
);


return Array
.from(
new Uint8Array(hash)
)
.map(
b =>
b.toString(16)
.padStart(2,"0")
)
.join("");

}


// ======================================================
// AUDIO
// ======================================================

let audioContext = null;

let musicTimer = null;

let musicStep = 0;

let soundEnabled = true;


function getAudio() {

if(!audioContext) {

audioContext =
new (
window.AudioContext ||
window.webkitAudioContext
)();

}


if(
audioContext.state ===
"suspended"
) {

audioContext.resume();

}


return audioContext;

}


function beep(
frequency,
duration,
type="square",
volume=.035
) {

if(!soundEnabled)
return;


const audio =
getAudio();


const oscillator =
audio.createOscillator();


const gain =
audio.createGain();


oscillator.type =
type;


oscillator.frequency.value =
frequency;


gain.gain.setValueAtTime(
volume,
audio.currentTime
);


gain.gain.exponentialRampToValueAtTime(
.001,
audio.currentTime+duration
);


oscillator.connect(gain);

gain.connect(
audio.destination
);


oscillator.start();

oscillator.stop(
audio.currentTime+
duration
);

}


// ======================================================
// EFFECTS
// ======================================================

function playCoinSound() {

beep(
880,
.08,
"square",
.05
);


setTimeout(
() =>
beep(
1320,
.1,
"square",
.04
),
60
);

}


function playJumpSound() {

beep(
500,
.1,
"square",
.035
);


setTimeout(
() =>
beep(
700,
.12,
"square",
.03
),
60
);

}


function playEnemySound() {

beep(
180,
.12,
"sawtooth",
.04
);

}


function playDamageSound() {

beep(
120,
.2,
"sawtooth",
.05
);

}


// ======================================================
// ORIGINAL CHiptune
// ======================================================

const melody = [

261.63,
329.63,
392.00,
523.25,

392.00,
329.63,
293.66,
392.00,

261.63,
329.63,
440.00,
523.25,

440.00,
392.00,
329.63,
261.63

];


function musicTick() {

if(
!soundEnabled ||
!gameRunning
)
return;


const note =
melody[
musicStep %
melody.length
];


beep(
note,
.14,
"square",
.016
);


if(
musicStep % 4 === 0
) {

beep(
note/2,
.18,
"triangle",
.01
);

}


musicStep++;

}


function startMusic() {

if(!soundEnabled)
return;


getAudio();


if(musicTimer)
return;


musicStep=0;


musicTimer =
setInterval(
musicTick,
220
);

}


function stopMusic() {

if(musicTimer) {

clearInterval(
musicTimer
);

musicTimer=null;

}

}


// ======================================================
// SOUND BUTTON
// ======================================================

document
.getElementById("soundBtn")
.addEventListener(
"click",
() => {

soundEnabled =
!soundEnabled;


document
.getElementById("soundBtn")
.textContent =
soundEnabled
? "🔊"
: "🔇";


if(soundEnabled)
startMusic();
else
stopMusic();

}
);
