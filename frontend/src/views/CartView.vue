<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import type { OrderFormData } from '../types';
import { createOrder, getErrorMessage } from '../services/api';

const router = useRouter();
const cartStore = useCartStore();

const formData = ref<OrderFormData>({
  username: '',
  email: '',
  phone_number: '',
});

const submitting = ref(false);
const serverError = ref<string | null>(null);
const validationErrors = ref<Record<string, string>>({});
const orderSuccess = ref(false);
const createdOrderId = ref<number | null>(null);

function formatPrice(price: number): string {
  return price.toFixed(2) + ' zł';
}

function validateEmail(email: string): boolean {
  const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return regex.test(email);
}

function validatePhone(phone: string): boolean {
  const regex = /^\+\d{1,3}\d{6,14}$/;
  return regex.test(phone.replace(/\s/g, ''));
}

function validateForm(): boolean {
  validationErrors.value = {};
  
  if (!formData.value.username.trim()) {
    validationErrors.value.username = 'Nazwa użytkownika jest wymagana';
  }
  
  if (!formData.value.email.trim()) {
    validationErrors.value.email = 'Email jest wymagany';
  } else if (!validateEmail(formData.value.email)) {
    validationErrors.value.email = 'Nieprawidłowy format email';
  }
  
  if (!formData.value.phone_number.trim()) {
    validationErrors.value.phone_number = 'Numer telefonu jest wymagany';
  } else if (!validatePhone(formData.value.phone_number)) {
    validationErrors.value.phone_number = 'Numer telefonu musi być w formacie międzynarodowym (np. +48123456789)';
  }
  
  if (cartStore.items.length === 0) {
    validationErrors.value.cart = 'Koszyk jest pusty';
  }
  
  return Object.keys(validationErrors.value).length === 0;
}

async function submitOrder() {
  if (!validateForm()) return;
  
  submitting.value = true;
  serverError.value = null;
  
  try {
    const order = await createOrder({
      username: formData.value.username,
      email: formData.value.email,
      phone_number: formData.value.phone_number.replace(/\s/g, ''),
      items: cartStore.items.map(item => ({
        productId: item.product.id,
        amount: item.amount,
      })),
    });
    
    orderSuccess.value = true;
    createdOrderId.value = order.id;
    cartStore.clearCart();
  } catch (err) {
    serverError.value = getErrorMessage(err);
  } finally {
    submitting.value = false;
  }
}

function goToProducts() {
  router.push('/');
}

function goToOrders() {
  router.push('/orders');
}
</script>

<template>
  <div>
    <h1 class="mb-4">Koszyk</h1>
    
    <div v-if="orderSuccess" class="alert alert-success">
      <h4 class="alert-heading">Zamówienie złożone pomyślnie!</h4>
      <p>Twoje zamówienie nr <strong>#{{ createdOrderId }}</strong> zostało przyjęte.</p>
      <hr>
      <div class="d-flex gap-2">
        <button class="btn btn-success" @click="goToProducts">
          Kontynuuj zakupy
        </button>
        <button class="btn btn-outline-success" @click="goToOrders">
          Zobacz zamówienia
        </button>
      </div>
    </div>

    <template v-else>
      <div v-if="serverError" class="alert alert-danger alert-dismissible">
        {{ serverError }}
        <button type="button" class="btn-close" @click="serverError = null"></button>
      </div>

      <div class="row">
        <div class="col-lg-8">
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">Produkty w koszyku</h5>
            </div>
            <div class="card-body">
              <div v-if="validationErrors.cart" class="alert alert-warning">
                {{ validationErrors.cart }}
              </div>
              
              <div v-if="cartStore.items.length === 0" class="text-center py-4 text-muted">
                <p class="mb-3">Koszyk jest pusty</p>
                <button class="btn btn-primary" @click="goToProducts">
                  Przejdź do produktów
                </button>
              </div>
              
              <div v-else class="table-responsive">
                <table class="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Produkt</th>
                      <th class="text-center" style="width: 150px;">Ilość</th>
                      <th class="text-end">Cena jedn.</th>
                      <th class="text-end">Suma</th>
                      <th style="width: 50px;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in cartStore.items" :key="item.product.id">
                      <td>
                        <strong>{{ item.product.name }}</strong>
                        <br>
                        <small class="text-muted">{{ item.product.category.name }}</small>
                      </td>
                      <td class="text-center">
                        <div class="input-group input-group-sm justify-content-center">
                          <button 
                            class="btn btn-outline-secondary" 
                            type="button"
                            @click="cartStore.decrementAmount(item.product.id)"
                          >
                            −
                          </button>
                          <input 
                            type="number" 
                            class="form-control text-center" 
                            style="max-width: 60px;"
                            :value="item.amount"
                            min="1"
                            @change="(e) => cartStore.updateAmount(item.product.id, parseInt((e.target as HTMLInputElement).value) || 1)"
                          />
                          <button 
                            class="btn btn-outline-secondary" 
                            type="button"
                            @click="cartStore.incrementAmount(item.product.id)"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td class="text-end">{{ formatPrice(item.product.unit_price) }}</td>
                      <td class="text-end fw-bold">
                        {{ formatPrice(item.product.unit_price * item.amount) }}
                      </td>
                      <td>
                        <button 
                          class="btn btn-sm btn-outline-danger" 
                          @click="cartStore.removeFromCart(item.product.id)"
                          title="Usuń z koszyka"
                        >X</button>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="table-light">
                    <tr>
                      <td colspan="3" class="text-end fw-bold">Razem:</td>
                      <td class="text-end fw-bold fs-5">{{ formatPrice(cartStore.totalPrice) }}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Dane kontaktowe</h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="submitOrder">
                <div class="mb-3">
                  <label for="username" class="form-label">Nazwa użytkownika *</label>
                  <input 
                    type="text" 
                    class="form-control"
                    :class="{ 'is-invalid': validationErrors.username }"
                    id="username"
                    v-model="formData.username"
                  />
                  <div v-if="validationErrors.username" class="invalid-feedback">
                    {{ validationErrors.username }}
                  </div>
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">Email *</label>
                  <input 
                    type="email" 
                    class="form-control"
                    :class="{ 'is-invalid': validationErrors.email }"
                    id="email"
                    v-model="formData.email"
                    placeholder="example@email.com"
                  />
                  <div v-if="validationErrors.email" class="invalid-feedback">
                    {{ validationErrors.email }}
                  </div>
                </div>

                <div class="mb-3">
                  <label for="phone" class="form-label">Telefon *</label>
                  <input 
                    type="tel" 
                    class="form-control"
                    :class="{ 'is-invalid': validationErrors.phone_number }"
                    id="phone"
                    v-model="formData.phone_number"
                    placeholder="+48123456789"
                  />
                  <div v-if="validationErrors.phone_number" class="invalid-feedback">
                    {{ validationErrors.phone_number }}
                  </div>
                  <small class="text-muted">Format międzynarodowy, np. +48123456789</small>
                </div>

                <div class="card bg-light mb-3">
                  <div class="card-body py-2">
                    <div class="d-flex justify-content-between">
                      <span>Produktów:</span>
                      <strong>{{ cartStore.totalItems }}</strong>
                    </div>
                    <div class="d-flex justify-content-between">
                      <span>Do zapłaty:</span>
                      <strong class="text-success fs-5">{{ formatPrice(cartStore.totalPrice) }}</strong>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  class="btn btn-success w-100 btn-lg"
                  :disabled="submitting || cartStore.items.length === 0"
                >
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  Złóż zamówienie
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
