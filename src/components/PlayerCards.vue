<template>
    <div class="player-cards">
      <img v-for="(card, index) in cards" :key="index" :src="getCardImage(card)" class="card" />
    </div>
  </template>
  
  <script>
  export default {
    props: ["cards"],
    methods: {
      getCardImage(card) {
        if (!card || !card.rank || !card.suit) {
          return "/cards/back.png"; // Fallback to card back image
        }
        return `/cards/${card.rank.toLowerCase()}_of_${card.suit.toLowerCase()}.png`;
      },
    },
  };
  </script>
  
  <style scoped>
  .player-cards {
    display: flex;
    gap: 10px;
  }
  
  .card {
    width: 70px;
    height: 100px;
    border-radius: 5px;
  }
  </style>
  