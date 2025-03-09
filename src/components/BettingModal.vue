<template>
    <div v-show="show" class="modal-overlay">
        <div class="modal-content bg-white text-black p-6 rounded-lg shadow-lg text-center">
            <h2 class="text-xl font-bold mb-2">Place Your Bet</h2>
            <!-- Pass player balance to BettingControls -->
            <BettingControls @betPlaced="handleBet" :balance="playerBalance" />
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from "vue";
import BettingControls from "./BettingControls.vue";

const props = defineProps({ show: Boolean, playerBalance: Number });
const emit = defineEmits(["close", "betPlaced"]);
const bet = ref(0);

const handleBet = (amount) => {
    bet.value = amount;
    emit("betPlaced", amount);
    emit("close"); // Close modal after bet is placed
};

const closeModal = () => {
    if (bet.value > 0) {
        emit("close");
    }
};
</script>