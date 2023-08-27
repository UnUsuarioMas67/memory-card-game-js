/// GLOBAL QUERIES ///
const cardContainer = document.querySelector(".card-container");
const hudContainer = document.querySelector(".hud-container");
const modalContainer = document.querySelector(".modal-container");
const modalBtn = document.querySelector(".modal__btn");

/// INTERNAL VARIABLES //////////////////////////////////////////////////////////
var firstCard = null;
var secondCard = null;
var cardsPlayed = 0;

var score = 0;
var round = 0;

var rows = 3;
var columns = 4;

var playable;
var visibleTime; // in milliseconds
var timeLeft; // in seconds
var timer;

const allColors = ["red", "blue", "green", "yellow", "purple", "dark"];

/// CARD CLASS //////////////////////////////////////////////////////////
class Card {
	constructor(color) {
		this.id = 0;
		this.color = color;
	}
}

/// FUNCTIONS //////////////////////////////////////////////////////////
// Enable Modal
function enableModal(message = "YOU LOST. PRESS THE BUTTON BELLOW TO PLAY AGAIN") {
	const modalTitle = modalContainer.querySelector(".modal__title");

	modalTitle.textContent = message;
	modalContainer.classList.add("active");
}

// Game start
function startGame() {
	score = 0;
	round = 0;

	visibleTime = 3000;
	clearInterval(timer);
	newRound();
}

// Game over
function gameOver() {
	if (score > getTopScore()) {
		setTopScore(score);
		const topScore = document.querySelector(".top-score__number");
		topScore.textContent = getTopScore();
	}

	enableModal();
}

// Advance round
function newRound() {
	round++;
	generateCards();
	updateGameStatus();
	playable = false;

	timeLeft = 30;
	//visibleTime = Math.max(800, 360 * rows * columns - (round - 1) * 50);

	const timerObj = hudContainer.querySelector(".timer__number");
	timerObj.textContent = timeLeft;

	setTimeout(() => {
		const cards = cardContainer.querySelectorAll(".card");

		cards.forEach((card) => hideCard(card));

		playable = true;

		timer = setInterval(updateTimer, 1000);
	}, visibleTime);
}

// Generate new pairs cards
function generateCards() {
	const pairs = (rows * columns) / 2;
	const colors = JSON.parse(JSON.stringify(allColors));

	var output = [];

	for (var i = 0; i < pairs; ++i) {
		const rand = Math.floor(Math.random() * colors.length);

		output.push(new Card(colors[rand]));
		output.push(new Card(colors[rand]));
		colors.splice(rand, 1);
	}

	cardsPlayed = 0;

	setCardsInStorage(shuffleCards(output));
	displayGame();
}

// Shuffle cards in random order
function shuffleCards(cards) {
	let currId = cards.length;

	while (currId !== 0) {
		randId = Math.floor(Math.random() * currId);
		currId--;

		let temp = cards[currId];
		cards[currId] = cards[randId];
		cards[randId] = temp;
	}

	return cards;
}

// Display cards on UI
function displayGame() {
	const cards = getCardsFromStorage();
	cardContainer.innerHTML = "";
	cardContainer.style = `grid-template-columns: repeat(${columns}, 1fr);`;

	cards.forEach((card) => {
		const cardObject = document.createElement("div");
		cardObject.className = `card card--${card.color}`;

		cardObject.innerHTML = `<span hidden>${card.id}</span>`;

		cardContainer.appendChild(cardObject);
	});
}

// Card Selection
function selectCard(e) {
	if (!playable) return;

	const card = e.target;
	if (!card.classList.contains("card")) return;

	// Check if the card is available
	if (card.classList.contains("card--hidden") && secondCard === null) {
		showCard(card);

		if (firstCard === null) firstCard = card;
		else {
			secondCard = card;
			compareSelectedCards();
		}
	}
}

// Compare two selected cards
function compareSelectedCards() {
	var color1, color2;

	allColors.forEach((color) => {
		if (firstCard.classList.contains("card--" + color)) color1 = color;
		if (secondCard.classList.contains("card--" + color)) color2 = color;
	});

	if (color1 === color2) {
		score += 5;
		cardsPlayed += 2;

		cardUpdate("success", firstCard, secondCard);
		updateGameStatus();
	} else {
		cardUpdate("failure", firstCard, secondCard);
	}
}

function cardUpdate(className, card1, card2) {
	card1.classList.add(`card--${className}`);
	card2.classList.add(`card--${className}`);

	setTimeout(() => {
		card1.classList.remove(`card--${className}`);
		card2.classList.remove(`card--${className}`);

		if (className === "failure") {
			hideCard(firstCard);
			hideCard(secondCard);
		}

		firstCard = null;
		secondCard = null;
	}, 500);
}

// Show cards
function showCard(card) {
	if (card.classList.contains("card--hidden")) card.classList.remove("card--hidden");
}

// Hide cards
function hideCard(card) {
	if (!card.classList.contains("card--hidden")) card.classList.add("card--hidden");
}

// Update game
function updateGameStatus() {
	const scoreObj = hudContainer.querySelector(".score__number");
	const roundObj = hudContainer.querySelector(".round__number");

	scoreObj.textContent = score;

	// advance round
	if (cardsPlayed >= rows * columns) {
		clearInterval(timer);
		setTimeout(newRound, 2000);
	}

	roundObj.textContent = round;
}

// Update timer
function updateTimer() {
	if (timeLeft !== 0 && cardsPlayed < rows * columns) {
		timeLeft--;
		const timerObj = hudContainer.querySelector(".timer__number");
		timerObj.textContent = timeLeft;
	} else {
		gameOver();
	}
}

/// LOCAL STORAGE //////////////////////////////////////////////////////////
// Get card batch
function getCardsFromStorage() {
	let cards;
	if (localStorage.getItem("memoryGame.cards") === null) {
		cards = [];
	} else {
		cards = JSON.parse(localStorage.getItem("memoryGame.cards"));
	}

	return cards;
}

// Set card batch
function setCardsInStorage(cards) {
	// Assign an id to each card
	for (const card in cards) {
		cards[card].id = card;
	}

	localStorage.setItem("memoryGame.cards", JSON.stringify(cards));
}

// Get top score
function getTopScore() {
	let topScore;
	if (localStorage.getItem("memoryGame.score") === null) {
		topScore = 0;
	} else {
		topScore = JSON.parse(localStorage.getItem("memoryGame.score"));
	}

	return topScore > 0 ? topScore : 0;
}

// Save new top score
function setTopScore(score) {
	localStorage.setItem("memoryGame.score", JSON.stringify(score));
}

/// EVENTS ///////////////////////////////////////////////////////
// Generate cards on reload
modalBtn.addEventListener("click", () => {
	modalContainer.classList.remove("active");
	startGame();
});

// Select clicked card
cardContainer.addEventListener("click", (e) => selectCard(e));

// Get top score on reload
document.addEventListener("DOMContentLoaded", () => {
	const topScore = document.querySelector(".top-score__number");
	topScore.textContent = getTopScore();
});
