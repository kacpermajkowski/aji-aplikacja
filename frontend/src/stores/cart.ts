import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Product, CartItem } from '../types';

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);

  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.amount, 0);
  });

  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + item.product.unit_price * item.amount, 0);
  });

  function addToCart(product: Product, amount: number = 1) {
    const existingItem = items.value.find(item => item.product.id === product.id);
    if (existingItem) {
      existingItem.amount += amount;
    } else {
      items.value.push({ product, amount });
    }
  }

  function removeFromCart(productId: number) {
    const index = items.value.findIndex(item => item.product.id === productId);
    if (index !== -1) {
      items.value.splice(index, 1);
    }
  }

  function updateAmount(productId: number, amount: number) {
    const item = items.value.find(item => item.product.id === productId);
    if (item) {
      if (amount <= 0) {
        removeFromCart(productId);
      } else {
        item.amount = amount;
      }
    }
  }

  function incrementAmount(productId: number) {
    const item = items.value.find(item => item.product.id === productId);
    if (item) {
      item.amount++;
    }
  }

  function decrementAmount(productId: number) {
    const item = items.value.find(item => item.product.id === productId);
    if (item) {
      if (item.amount <= 1) {
        removeFromCart(productId);
      } else {
        item.amount--;
      }
    }
  }

  function clearCart() {
    items.value = [];
  }

  return {
    items,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateAmount,
    incrementAmount,
    decrementAmount,
    clearCart,
  };
});
