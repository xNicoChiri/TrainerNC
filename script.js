const basePath = window.location.hostname.includes("github.io")
    ? "/TrainerNC/"
    : "/";

let awaitingConfirmation = false;
let mode = "learn";
let score = 0;

// ==============================
// KARTEN
// ==============================

let cards = [];

// ==============================
// KARTEN LADEN (JSON)
// ==============================

async function loadCards() {
    const response = await fetch("cards.json");
    cards = await response.json();
}

// Beim Laden der Seite Karten vorbereiten
window.onload = async function() {
    await loadCards();
    loadLastResult();

    let savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");
}
};

let currentCard = 0;
let isBackVisible = false;

// ==============================
// SHUFFLE (Fisher-Yates)
// ==============================

function shuffleCards() {
    for (let i = cards.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
}

// ==============================
// MENÜ
// ==============================

function startGame(selectedMode) {

    mode = selectedMode;
    score = 0;
    currentCard = 0;

    shuffleCards();

    document.getElementById("menu").style.display = "none";
    document.getElementById("result").style.display = "none";
    document.getElementById("game").style.display = "block";

    showCard();
}

function goMenu() {

    document.getElementById("game").style.display = "none";
    document.getElementById("result").style.display = "none";
    document.getElementById("menu").style.display = "block";

    loadLastResult();
}

// ==============================
// KARTE ANZEIGEN
// ==============================

function showCard() {

    let card = cards[currentCard];

    document.getElementById("cardImage").src = basePath + card.image;
    document.getElementById("deviceName").innerText = card.name;

    document.getElementById("articleNr").innerText = card.article;
    document.getElementById("serialNr").innerText = card.serial;

    document.getElementById("flashcard").classList.remove("flipped");

    // 🔥 Buttons je nach Modus wechseln
    if (mode === "exam") {

        document.getElementById("mainButtons").innerHTML = `
            <button onclick="answer(true)">Gewusst</button>
            <button onclick="answer(false)">Nicht gewusst</button>
        `;

    } else {

        document.getElementById("mainButtons").innerHTML = `
            <button onclick="turnCard()">Details</button>
            <button onclick="nextCard()">Weiter</button>
        `;
    }

    updateProgress();
}

    // Buttons je nach Modus steuern
if (mode === "exam") {
    document.getElementById("mainButtons").innerHTML = `    
        <button onclick="answer(true)">Gewusst</button>
        <button onclick="answer(false)">Nicht gewusst</button>
    `;
} else {
    document.getElementById("mainButtons").innerHTML = `    
        <button onclick="turnCard()">Details</button>
        <button onclick="nextCard()">Weiter</button>
    `;
}


// ==============================
// DETAILS EINBLENDEN
// ==============================

function turnCard() {
    document.getElementById("flashcard").classList.toggle("flipped");
}

// ==============================
// NÄCHSTE KARTE
// ==============================

function nextCard() {
    currentCard++;

    if (currentCard >= cards.length) {
        currentCard = 0;
    }

    showCard();
}

// ==============================
// PROGRESS BAR
// ==============================

function updateProgress() {
    let progress = ((currentCard + 1) / cards.length) * 100;
    document.getElementById("progressBar").style.width = progress + "%";
}

function answer(knewIt) {

    // Karte erst drehen
    document.getElementById("flashcard").classList.add("flipped");

    awaitingConfirmation = true;

    // Buttons ändern sich zur Bestätigung
    document.getElementById("mainButtons").innerHTML = `
        <button onclick="confirmAnswer(true)">War korrekt</button>
        <button onclick="confirmAnswer(false)">War falsch</button>
    `;

    // Speichern, was Nutzer zuerst dachte
    window.tempAnswer = knewIt;
}

 function showResult() {

    document.getElementById("game").style.display = "none";
    document.getElementById("result").style.display = "block";

    document.getElementById("resultText").innerText =
        "Ergebnis: " + score + " von " + cards.length;

    localStorage.setItem("lastScore", score);
    localStorage.setItem("lastTotal", cards.length);
}


function loadLastResult() {

    let lastScore = localStorage.getItem("lastScore");
    let lastTotal = localStorage.getItem("lastTotal");

    if (lastScore && lastTotal) {
        document.getElementById("lastResult").innerText =
            "Letzte Prüfung: " + lastScore + " von " + lastTotal;
    }
}

function confirmAnswer(wasCorrect) {

    // Punkt nur wenn Nutzer dachte "gewusst" UND es war korrekt
    if (window.tempAnswer && wasCorrect) {
        score++;
    }

    awaitingConfirmation = false;

    currentCard++;

    if (currentCard >= cards.length) {
        showResult();
        return;
    }

    showCard();
}

function toggleTheme() {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
}