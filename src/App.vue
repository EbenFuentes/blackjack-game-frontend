<script setup>
import { RouterView } from 'vue-router';
</script>

<template>
  <div id="app" class="flex  items-center justify-center bg-green-700 h-screen w-screen">

    <RouterView />

  </div>
</template>

<style>
#app {
  min-height: 100vh;
  min-width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
