<template>
  <div class="controls">
    <button class="bg-lime-600" @click="$emit('hit')" :disabled="gameOver">🃏 Hit</button>
    <button class="bg-red-500" @click="$emit('stand')" :disabled="gameOver">✋ Stand  </button>
    <button class="bg-blue-500" @click="$emit('double')" :disabled="gameOver">💰 Double Down</button>
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
