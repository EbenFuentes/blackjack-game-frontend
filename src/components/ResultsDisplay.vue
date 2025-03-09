<template>
    <div v-if="show" class="results-modal">
      <h2>{{ resultMessage }}</h2>
      <p>Winnings: ${{ winnings }}</p>
      <p>New Balance: ${{ newBalance }}</p>
      <button @click="$emit('playAgain')">🔄 Play Again</button>
    </div>
  </template>
  
  <script>
  export default {
    props: ["resultMessage", "winnings", "newBalance", "show"],
  };
  </script>
  
  <style scoped>
  .results-modal {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
  }
  button {
    padding: 10px;
    margin-top: 10px;
    cursor: pointer;
  }
  </style>
  