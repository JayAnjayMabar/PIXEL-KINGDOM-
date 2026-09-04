// ======================================================
// GOOGLE SHEETS API
// ======================================================

// TEMPEL URL GOOGLE APPS SCRIPT DI SINI

const API_URL =
"https://script.google.com/macros/s/PASTE_ID_DISINI/exec";


// ======================================================
// SAVE SCORE
// ======================================================

async function saveScore(data) {

if (
!API_URL ||
API_URL.includes("PASTE_ID")
) {

console.warn(
"Google Apps Script belum dipasang."
);

return false;

}


try {

const response =
await fetch(
API_URL,
{

method:"POST",

headers:{
"Content-Type":
"text/plain;charset=utf-8"
},

body:
JSON.stringify({

action:"saveScore",

username:
data.username,

passwordHash:
data.passwordHash,

score:
data.score,

coins:
data.coins,

level:
data.level

})

}
);


const result =
await response.json();


return result.success === true;

}
catch(error) {

console.error(error);

return false;

}

}


// ======================================================
// LEADERBOARD
// ======================================================

async function getLeaderboard() {

if (
!API_URL ||
API_URL.includes("PASTE_ID")
) {

return [];

}


try {

const response =
await fetch(
API_URL +
"?action=leaderboard"
);


const result =
await response.json();


return result.data || [];

}
catch(error) {

console.error(error);

return [];

}

}
