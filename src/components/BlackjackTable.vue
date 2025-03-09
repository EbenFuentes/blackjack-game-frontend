<template>
  <div class="blackjack-table">
    <!-- Show Player Setup if not registered -->
    <PlayerSetup v-if="!playerRegistered" @playerCreated="handlePlayerCreated" />

    <!-- Show Betting Controls if game hasn't started -->
    <BettingControls v-if="!gameStarted && playerRegistered" @betPlaced="handleBetPlaced" :gameOver="gameOver" />


    <!-- Main Game Area -->
    <div v-if="gameStarted" class="game-area">
      <!-- Dealer's Hand -->
      <div class="dealer-area">
        <h3>Dealer</h3>
        <DealerCards :cards="dealerCards" />
      </div>

      <!-- Game Info -->
      <div class="game-info">
        <h2>Balance: ${{ newBalance }}</h2>
        <h2>Current Bet: ${{ bet }}</h2>
        <h2>Winnings: ${{ winnings }}</h2>
        <h2>Dealer Score: {{ dealerScore }}</h2>
        <h2>Player Score: {{ playerScore }}</h2>
        <h3 v-if="gameStatus">{{ gameStatus }}</h3>
      </div>


      <!-- Player's Hand -->
      <div class="player-area">
        <h3>Player</h3>
        <PlayerCards :cards="playerCards" />
      </div>

      <!-- Controls -->
      <Controls v-if="gameStarted" @hit="hit" @stand="stand" @double="doubleDown" :gameOver="gameOver" />

      <br />
      <!-- Show Reset Button when the game is over -->
      <button v-if="gameOver" @click="resetGame" class="reset-btn">🔄 Play Again</button>

      <!-- Show results when game is over -->
      <ResultsDisplay v-if="showResults" :resultMessage="gameStatus" :winnings="winnings" :newBalance="newBalance"
        @playAgain="resetGame" />

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import DealerCards from "./DealerCards.vue";
import PlayerCards from "./PlayerCards.vue";
import Controls from "./Controls.vue";
import PlayerSetup from "./PlayerSetup.vue";
import BettingControls from "./BettingControls.vue";
import ResultsDisplay from "./ResultsDisplay.vue";

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

// Computed properties
const gameStarted = computed(() => gameStatus.value !== "Game not in session.");
const gameOver = computed(() => ["Player wins!", "Dealer wins.", "Push", "Blackjack! Player Wins!"].includes(gameStatus.value));

// Lifecycle hook (runs on component mount)
onMounted(async () => {
  await fetchPlayerInfo();
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
    newBalance.value = data.balance; // ✅ Update balance in UI
  } catch (error) {
    console.error("Error fetching balance:", error);
  }
};




// Fetch current hand
const fetchCurrentHand = async () => {
  const response = await fetch("http://localhost:8080/api/players/1/hand-value");
  const data = await response.json();

  playerScore.value = data.handValue;
  dealerScore.value = data.dealerHandValue;

  playerCards.value = formatCards(data.playerCards);
  dealerCards.value = formatCards([data.dealerFaceUpCard]);
};

// Handle player creation
const handlePlayerCreated = async () => {
  playerRegistered.value = true;
  await fetchPlayerInfo();
};

// Handle bet placement
const handleBetPlaced = async (amount) => {
  bet.value = amount;
  gameStatus.value = "Bet placed! Waiting to start...";
  await deal();
};

const deal = async () => {
  if (bet.value === 0) {
    alert("You need to place a bet first!");
    return;
  }

  // Reset UI for a new round
  playerCards.value = [];
  dealerCards.value = [];
  playerScore.value = 0;
  dealerScore.value = 0;
  gameStatus.value = "Dealing cards...";

  try {
    const response = await fetch("http://localhost:8080/api/players/1/start", {
      method: "POST",
    });

    if (!response.ok) throw new Error("Failed to start game");

    const data = await response.json();

    // Ensure UI updates correctly
    playerCards.value = formatCards(data.playerCards);
    dealerCards.value = formatCards([data.dealerFaceUpCard]);
    playerScore.value = data.handValue;
    dealerScore.value = data.dealerHandValue;
    gameStatus.value = "Game started!";
  } catch (error) {
    console.error("Error starting game:", error);
    gameStatus.value = "Error starting game!";
  }
};

const fetchBalance = async () => {
  try {
    const response = await fetch("http://localhost:8080/api/players/1/balance");
    if (!response.ok) throw new Error("Failed to fetch balance");

    const data = await response.json();
    newBalance.value = data.balance;
  } catch (error) {
    console.error("Error fetching balance:", error);
  }
};


const hit = async () => {
  if (gameOver.value) return; // Prevent hitting if the game is over

  try {
    const response = await fetch("http://localhost:8080/api/players/1/hit", {
      method: "POST",
    });

    if (!response.ok) throw new Error("Failed to hit");

    const data = await response.json();
    playerCards.value = formatCards(data.playerCards);
    await fetchCurrentHand();
    
    gameStatus.value = data.status;

    await fetchPlayerBalance();

  } catch (error) {
    console.error("Error hitting:", error);
    gameStatus.value = "Error hitting!";
  }
};




const stand = async () => {
  if (gameOver.value) return;

  try {
    const response = await fetch("http://localhost:8080/api/players/1/stand", {
      method: "POST",
    });

    if (!response.ok) throw new Error("Failed to stand");

    const data = await response.json();
    dealerCards.value = formatCards(data.dealerHand);
    gameStatus.value = data.message;
    winnings.value = data.winnings;
    newBalance.value = data.playerNewBalance;

    await fetchBalance();
  } catch (error) {
    console.error("Error standing:", error);
    gameStatus.value = "Error standing!";
  }
};



const doubleDown = async () => {
  if (gameOver.value) return;

  try {
    const response = await fetch("http://localhost:8080/api/players/1/double-down", {
      method: "POST",
    });

    if (!response.ok) throw new Error("Failed to double down");

    const data = await response.json();
    playerCards.value = formatCards(data.playerHand);
    playerScore.value = data.playerValue;
    gameStatus.value = data.message;
    winnings.value = data.winnings;
    newBalance.value = data.playerNewBalance;
    bet.value = data.bet;

    await fetchBalance();
  } catch (error) {
    console.error("Error doubling down:", error);
    gameStatus.value = "Error doubling down!";
  }
};





// Reset game
const resetGame = async () => {
  await fetch("http://localhost:8080/api/players/1/reset", { method: "POST" });

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
};


// Format card data
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
