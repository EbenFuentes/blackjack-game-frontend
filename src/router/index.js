import Test from '@/components/Test.vue'
import GameView from '@/components/GameView.vue'
import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/', component: GameView,
    },
  ],
})

export default router
