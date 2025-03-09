<template>
  <div class="controls">
    <button @click="$emit('hit')" :disabled="gameOver">🃏 Hit</button>
    <button @click="$emit('stand')" :disabled="gameOver">✋ Stand</button>
    <button @click="$emit('double')" :disabled="gameOver">💰 Double Down</button>
  </div>
</template>

<script setup>
defineProps(["gameOver"]);
</script>

<style scoped>
.controls {
  display: flex;
  gap: 10px;
}

button {
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
}

button:disabled {
  background-color: gray;
  cursor: not-allowed;
}
</style>
