<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { useCartStore } from './stores/cart';

const cartStore = useCartStore();

const cartBadge = computed(() => {
  return cartStore.totalItems > 0 ? cartStore.totalItems : null;
});
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
    <div class="container">
      <RouterLink class="navbar-brand" to="/">
        <i class="bi bi-shop me-2"></i>AJI Sklep
      </RouterLink>
      
      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/" active-class="active">
              Produkty
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/orders" active-class="active">
              Zamówienia
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/init" active-class="active">
              Inicjalizacja DB
            </RouterLink>
          </li>
        </ul>
        
        <RouterLink 
          class="btn btn-outline-light position-relative" 
          to="/cart"
        >
          Koszyk
          <span 
            v-if="cartBadge" 
            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
          >
            {{ cartBadge }}
          </span>
        </RouterLink>
      </div>
    </div>
  </nav>
  
  <main class="container pb-5">
    <RouterView />
  </main>
  
  <footer class="bg-light py-3 mt-auto">
    <div class="container text-center text-muted">
      <small>AJI Aplikacja - Zadanie 3 i 4 &copy; Tobiasz Kowalczyk & Kacper Majkowski 2026</small>
    </div>
  </footer>
</template>

<style scoped>
.navbar-brand {
  font-weight: 600;
}
</style>
