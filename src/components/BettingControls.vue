<template>
  <div class="betting-controls">
    <h3 class="text-lg font-bold mb-3">Choose Your Bet</h3>

    <!-- Show user balance -->
    <p class="mb-2 font-bold text-green-700">Balance: ${{ balance }}</p>

    <div class="chip-container">
      <div v-for="chip in chips" :key="chip.value" class="chip-wrapper">
        <div class="chip" @click="addChip(chip.value)">
          <img :src="chip.image" :alt="'Chip ' + chip.value" />
          <span v-if="selectedChips[chip.value]" class="chip-count">x{{ selectedChips[chip.value] }}</span>
        </div>
        <p class="chip-value">${{ chip.value }}</p>
      </div>
    </div>

    <div class="bet-info mt-4">
      <p>Current Bet: <span class="text-lg font-bold">${{ bet }}</span></p>
      <button @click="resetBet" class="reset-btn">❌ Reset Bet</button>
    </div>

    <button @click="confirmBet" :disabled="bet === 0 || bet > balance">💰 Deal</button>

    <p v-if="bet > balance" class="text-red-600 text-sm font-bold mt-2">Not enough balance!</p>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from "vue";

// Receive balance from parent
const props = defineProps({ balance: Number });

const emit = defineEmits(["betPlaced"]);
const bet = ref(0);
const selectedChips = ref({});

const chips = ref([
  { value: 25, image: "/chips/greenChip.svg" },
  { value: 50, image: "/chips/blueChip.svg" },
  { value: 100, image: "/chips/blackChip.svg" },
  { value: 500, image: "/chips/pinkChip.svg" },
  { value: 1000, image: "/chips/yellowChip.svg" },
]);

const addChip = (value) => {
  if (bet.value + value <= props.balance) {
    bet.value += value;
    if (!selectedChips.value[value]) {
      selectedChips.value[value] = 1;
    } else {
      selectedChips.value[value]++;
    }
  }
};

const resetBet = () => {
  bet.value = 0;
  selectedChips.value = {}; // Reset selected chips
};

const confirmBet = async () => {
  if (bet.value > 0 && bet.value <= props.balance) {
    await fetch("http://localhost:8080/api/players/1/bet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: bet.value }),
    });

    emit("betPlaced", bet.value); // Emit betPlaced event
  }
};
</script>

<style scoped>
.betting-controls {
  text-align: center;
  padding: 20px;
}

.chip-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  align-items: center;
  max-width: 400px;
}

.chip-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  position: relative;
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
  font-weight: bold;
}

.chip-count {
  position: absolute;
  top: 0;
  right: 0;
  background: black;
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 5px;
  border-radius: 50%;
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
</style>
