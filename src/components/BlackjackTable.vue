<template>
  <div class="blackjack-table flex flex-col items-center justify-between min-h-screen overflow-hidden">
    <!-- Player Setup -->
    <PlayerSetup v-if="!playerRegistered" @playerCreated="handlePlayerCreated" />

    <!-- Main Game Area -->
    <div v-if="gameStarted || gameOver" class="game-area flex flex-col items-center flex-grow w-full">
      <div class="dealer-area">
        <h3>Dealer</h3>
        <DealerCards :cards="dealerCards" />
      </div>

      <div class="game-info bg-black bg-opacity-40 text-white p-4 rounded-lg w-full max-w-lg text-center">
        <h2>Balance: ${{ newBalance }}</h2>
        <h2>Current Bet: ${{ bet }}</h2>
        <h2>Winnings: ${{ winnings }}</h2>
        <h2>Dealer Score: {{ dealerScore }}</h2>
        <h2>Player Score: {{ playerScore }}</h2>
        <h3 v-if="gameStatus">{{ gameStatus }}</h3>
      </div>

      <div class="player-area mt-4">
        <h3>Player</h3>
        <PlayerCards :cards="playerCards" />
      </div>

      <div v-if="gameStarted && !gameOver" class="game-controls flex gap-4 mt-4">
        <Controls @hit="hit" @stand="stand" @double="doubleDown" />
      </div>
    </div>

    <!-- Betting Modal -->
    <BettingModal :show="showBettingModal" :playerBalance="newBalance" @close="showBettingModal = false"
      @betPlaced="handleBetPlaced" />

    <!-- Game Controls -->
    <button v-if="gameOver" @click="resetGame" class="reset-btn bg-orange-500 text-white px-6 py-3 rounded-lg mt-4">
      🔄 Play Again
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import DealerCards from "./DealerCards.vue";
import PlayerCards from "./PlayerCards.vue";
import Controls from "./Controls.vue";
import PlayerSetup from "./PlayerSetup.vue";
import BettingModal from "./BettingModal.vue";

// Reactive state
const playerRegistered = ref(false);
const gameStatus = ref("Game not in session.");
const bet = ref(0);
const playerCards = ref([]);
const dealerCards = ref([]);
const playerScore = ref(0);
const dealerScore = ref(0);
const winnings = ref(0);
const newBalance = ref(0);
const showBettingModal = ref(false);

// Computed properties
const gameStarted = computed(() => gameStatus.value !== "Game not in session.");
const gameOver = computed(() => ["Player wins!", "Dealer wins.", "It's a push!", "Blackjack! Player Wins!", "Bust! Dealer wins."].includes(gameStatus.value));

// Lifecycle hook (runs on component mount)
onMounted(async () => {
  await fetchPlayerInfo();
  if (!gameStarted.value) {
    showBettingModal.value = true; // Ensure betting modal appears on first load
  }
});

// Fetch player info
const fetchPlayerInfo = async () => {
  try {
    const response = await fetch("http://localhost:8080/api/players/1");
    if (!response.ok) throw new Error("Player not found");

    const data = await response.json();
    playerRegistered.value = true;
    gameStatus.value = data.status;
    bet.value = data.bet || 0;

    await fetchPlayerBalance();

    if (gameStarted.value) {
      await fetchCurrentHand();
    }
  } catch (error) {
    console.log("No existing player found. Showing PlayerSetup.");
    playerRegistered.value = false;
  }
};

const fetchPlayerBalance = async () => {
  try {
    const response = await fetch("http://localhost:8080/api/players/1/balance");
    if (!response.ok) throw new Error("Failed to fetch balance");

    const data = await response.json();
    newBalance.value = data.balance;
  } catch (error) {
    console.error("Error fetching balance:", error);
  }
};

// Fetch current hand
const fetchCurrentHand = async () => {
  try {
    const response = await fetch("http://localhost:8080/api/players/1/hand-value");
    if (!response.ok) throw new Error("Failed to fetch hand value");

    const data = await response.json();
    playerScore.value = data.handValue;
    dealerScore.value = data.dealerHandValue;
    playerCards.value = formatCards(data.playerCards);
    dealerCards.value = formatCards([data.dealerFaceUpCard]);
  } catch (error) {
    console.error("Error fetching hand:", error);
  }
};

// Handle player creation
const handlePlayerCreated = async () => {
  playerRegistered.value = true;
  await fetchPlayerInfo();
  showBettingModal.value = true; // Ensure the betting modal opens
};

// Handle bet placement
const handleBetPlaced = async (amount) => {
  bet.value = amount;
  gameStatus.value = "Bet placed! Waiting to start...";
  showBettingModal.value = false; // Close modal after bet
  await deal();
};

// Deal cards to start the game
const deal = async () => {
  if (bet.value === 0) {
    alert("You need to place a bet first!");
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/api/players/1/start", {
      method: "POST",
    });

    if (!response.ok) throw new Error("Failed to start game");

    const data = await response.json();
    playerCards.value = formatCards(data.playerCards);
    dealerCards.value = formatCards([data.dealerFaceUpCard]);
    playerScore.value = data.handValue;
    dealerScore.value = data.dealerHandValue;
    gameStatus.value = "Game started!";
    await fetchPlayerBalance();
  } catch (error) {
    console.error("Error starting game:", error);
    gameStatus.value = "Error starting game!";
  }
};

// Reset game function
const resetGame = async () => {
  try {
    await fetch("http://localhost:8080/api/players/1/reset", { method: "POST" });

    // Reset all values
    gameStatus.value = "Game not in session.";
    bet.value = 0;
    playerCards.value = [];
    dealerCards.value = [];
    playerScore.value = 0;
    dealerScore.value = 0;
    winnings.value = 0;
    newBalance.value = 0;
    playerRegistered.value = true;

    await fetchPlayerInfo();
    await fetchPlayerBalance();

    // Ensure the betting modal appears again
    showBettingModal.value = true;
  } catch (error) {
    console.error("Error resetting game:", error);
  }
};

// Hit
const hit = async () => {
  if (gameOver.value) return;

  try {
    const response = await fetch("http://localhost:8080/api/players/1/hit", { method: "POST" });
    if (!response.ok) throw new Error("Failed to hit");


    const data = await response.json();
    playerCards.value = formatCards(data.playerCards);
    playerScore.value = data.handValue;
    gameStatus.value = data.status;
    if (playerScore.value > 21) {
      dealerCards.value = formatCards(data.dealerHand);
      dealerScore.value = data.dealerValue;
      stand();
    }
    await fetchPlayerInfo();
    await fetchPlayerBalance();
  } catch (error) {
    console.error("Error hitting:", error);
  }
};

// Stand
const stand = async () => {
  if (gameOver.value) return;

  try {
    const response = await fetch("http://localhost:8080/api/players/1/stand", { method: "POST" });
    if (!response.ok) throw new Error("Failed to stand");

    const data = await response.json();
    dealerCards.value = formatCards(data.dealerHand);
    gameStatus.value = data.message;
    winnings.value = data.winnings;
    newBalance.value = data.playerNewBalance;
    dealerScore.value = data.dealerValue;
  } catch (error) {
    console.error("Error standing:", error);
  }
};

// Double Down
const doubleDown = async () => {
  if (gameOver.value) return;

  try {
    const response = await fetch("http://localhost:8080/api/players/1/double-down", { method: "POST" });
    if (!response.ok) throw new Error("Failed to double down");

    const data = await response.json();
    playerCards.value = formatCards(data.playerHand);
    playerScore.value = data.playerValue;
    gameStatus.value = data.message;
    winnings.value = data.winnings;
    newBalance.value = data.playerNewBalance;
    bet.value = data.bet;
    dealerScore.value = data.dealerValue;
    await fetchPlayerBalance();
  } catch (error) {
    console.error("Error doubling down:", error);
  }
};

const formatCards = (cards) =>
  cards.map((card) => ({
    rank: card.rank,
    suit: card.suit.toLowerCase(),
    image: `/cards/${card.rank.toLowerCase()}_of_${card.suit.toLowerCase()}.svg`,
  }));
</script>

<style scoped>
.blackjack-table {
  background-color: #0b6623;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
}

.dealer-area,
.player-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.game-info {
  background-color: rgba(0, 0, 0, 0.3);
  padding: 10px 20px;
  border-radius: 10px;
  color: white;
}

h2,
h3 {
  color: white;
}

.reset-btn {
  background: linear-gradient(to right, #ff8c00, #ff4500);
  color: white;
  font-size: 18px;
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: 0.3s;
}

.reset-btn:hover {
  background: linear-gradient(to right, #ff4500, #ff8c00);
}
</style>