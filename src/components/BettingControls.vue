<template>
  <div class="betting-controls">
    <h3>Choose Your Bet</h3>

    <div class="chip-container">
      <div v-for="chip in chips" :key="chip.value" class="chip-wrapper">
        <div class="chip" @click="addChip(chip.value)">
          <img :src="chip.image" :alt="'Chip ' + chip.value" />
        </div>
        <p class="chip-value">${{ chip.value }}</p>
      </div>
    </div>

    <div class="bet-info">
      <p>Current Bet: <span>${{ bet }}</span></p>
      <button @click="resetBet" class="reset-btn">❌ Reset Bet</button>
    </div>

    <button @click="confirmBet" :disabled="bet === 0">💰 Deal</button>

    <div class="stacked-chips">
      <div v-for="(count, value) in chipStack" :key="value" class="stack">
        <img :src="getChipImage(value)" class="stack-chip" />
        <p>x{{ count }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";

// Define props
const props = defineProps({
  gameOver: Boolean,
});

// Define emits
const emit = defineEmits(["betPlaced"]);

// Reactive state
const bet = ref(0);
const chipStack = ref({});
const chips = ref([
  { value: 25, image: "/chips/greenChip.svg" },
  { value: 50, image: "/chips/blueChip.svg" },
  { value: 100, image: "/chips/blackChip.svg" },
  { value: 500, image: "/chips/pinkChip.svg" },
  { value: 1000, image: "/chips/yellowChip.svg" },
]);

// Watch for game over reset
watch(() => props.gameOver, (newValue) => {
  if (newValue) {
    resetBet(); // Reset bet when game ends
  }
});

// Methods
const addChip = (value) => {
  bet.value += value;

  if (chipStack.value[value]) {
    chipStack.value[value] += 1;
  } else {
    chipStack.value[value] = 1;
  }
};

const resetBet = () => {
  bet.value = 0;
  chipStack.value = {};
};

const confirmBet = async () => {
  if (bet.value > 0) {
    await fetch("http://localhost:8080/api/players/1/bet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: bet.value }),
    });

    emit("betPlaced", bet.value); // Emit betPlaced event
  }
};

const getChipImage = (value) => {
  return chips.value.find(chip => chip.value === parseInt(value))?.image;
};
</script>

<style scoped>
.betting-controls {
  text-align: center;
  padding: 20px;
}

.chip-container {
  display: flex;
  gap: 15px;
  justify-content: center;
  align-items: center;
}

.chip-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.chip {
  width: 50px;
  transition: transform 0.2s ease-in-out;
}

.chip:hover {
  transform: scale(1.1);
}

.chip-value {
  margin-top: 5px;
  font-size: 14px;
  color: white;
  font-weight: bold;
}

.bet-info {
  margin-top: 15px;
}

.bet-info span {
  font-weight: bold;
  font-size: 18px;
}

.reset-btn {
  background: red;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  font-weight: bold;
}

button {
  margin-top: 10px;
  padding: 10px;
  background-color: #f4a236;
  color: white;
  border: none;
  cursor: pointer;
}

button:disabled {
  background-color: gray;
  cursor: not-allowed;
}

/* Stacked Chips Display */
.stacked-chips {
  display: flex;
  justify-content: center;
  margin-top: 10px;
  gap: 10px;
}

.stack {
  position: relative;
  text-align: center;
}

.stack-chip {
  width: 40px;
}

.stack p {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 16px;
  color: white;
  font-weight: bold;
  background: rgba(0, 0, 0, 0.6);
  padding: 2px 5px;
  border-radius: 5px;
}
</style>
