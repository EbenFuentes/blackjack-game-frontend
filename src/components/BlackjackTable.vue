<template>
    <div class="blackjack-table">
      <!-- Dealer's Hand -->
      <div class="dealer-area">
        <h3>Dealer</h3>
        <DealerCards :cards="dealerCards" />
      </div>
  
      <!-- Game Info -->
      <div class="game-info">
        <h2>Bet: ${{ bet }}</h2>
        <h3 v-if="gameStatus">{{ gameStatus }}</h3>
      </div>
  
      <!-- Player's Hand -->
      <div class="player-area">
        <h3>Player</h3>
        <PlayerCards :cards="playerCards" />
      </div>
  
      <!-- Controls -->
      <Controls @hit="hit" @stand="stand" @deal="deal" />
    </div>
  </template>
  
  <script>
  import DealerCards from "./DealerCards.vue";
  import PlayerCards from "./PlayerCards.vue";
  import Controls from "./Controls.vue";
  
  export default {
    components: { DealerCards, PlayerCards, Controls },
    data() {
      return {
        bet: 100,
        playerCards: [],
        dealerCards: [],
        gameStatus: "",
      };
    },
    methods: {
      async deal() {
        const response = await fetch("http://localhost:8080/api/players/1/start", { method: "POST" });
        const data = await response.json();
        this.playerCards = data.playerCards;
        this.dealerCards = [data.dealerFaceUpCard];
        this.gameStatus = "Game started!";
      },
      async hit() {
        const response = await fetch("http://localhost:8080/api/players/1/hit", { method: "POST" });
        const data = await response.json();
        this.playerCards = data.playerCards;
        this.gameStatus = data.status;
      },
      async stand() {
        const response = await fetch("http://localhost:8080/api/players/1/stand", { method: "POST" });
        const data = await response.json();
        this.dealerCards = data.dealerHand;
        this.gameStatus = data.message;
      },
    },
  };
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
  
  .dealer-area, .player-area {
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
  
  h2, h3 {
    color: white;
  }
  </style>
  