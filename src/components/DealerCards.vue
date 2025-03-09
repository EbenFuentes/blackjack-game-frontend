<template>
  <div class="dealer-cards">
    <img 
      v-for="(card, index) in cards" 
      :key="index" 
      :src="card.image" 
      class="card" 
      :alt="`${card.rank} of ${card.suit}`"
    />
  </div>
</template>

<script>
export default {
  props: ["cards"],
};
</script>

<style scoped>
.dealer-cards {
  display: flex;
  gap: 10px;
}
.card {
  width: 200px;
  height: 200px;
  border-radius: 5px;
}
</style>
