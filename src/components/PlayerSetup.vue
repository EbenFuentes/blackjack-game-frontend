<template>
    <div class="player-setup">
      <h2>Welcome to Blackjack</h2>
      <input type="text" v-model="username" placeholder="Enter your username" />
      <button @click="createPlayer">Start Game</button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        username: "",
      };
    },
    methods: {
      async createPlayer() {
        const response = await fetch("http://localhost:8080/api/players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: this.username, balance: 1000}),
        });
        const data = await response.json();
        this.$emit("playerCreated", data);
      },
    },
  };
  </script>
  
  <style scoped>
  .player-setup {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  input {
    padding: 8px;
  }
  button {
    padding: 10px;
    cursor: pointer;
  }
  </style>
  