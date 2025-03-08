<template>
    <div class="controls">
      <button @click="$emit('deal')">🎲 Deal</button>
      <button @click="$emit('hit')">🃏 Hit</button>
      <button @click="$emit('stand')">✋ Stand</button>
    </div>
  </template>
  
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
  </style>
  