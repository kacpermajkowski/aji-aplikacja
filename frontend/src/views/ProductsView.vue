<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Product, Category } from '../types';
import { getAllProducts, getAllCategories, updateProduct, getSeoDescription, getErrorMessage } from '../services/api';
import { useCartStore } from '../stores/cart';
import ProductEditModal from '../components/ProductEditModal.vue';

const cartStore = useCartStore();

const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const nameFilter = ref('');
const categoryFilter = ref<number | ''>('');

const showEditModal = ref(false);
const editingProduct = ref<Product | null>(null);

const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchesName = product.name.toLowerCase().includes(nameFilter.value.toLowerCase());
    const matchesCategory = categoryFilter.value === '' || product.category?.id === categoryFilter.value;
    return matchesName && matchesCategory;
  });
});

async function fetchData() {
  loading.value = true;
  error.value = null;
  try {
    const [productsData, categoriesData] = await Promise.all([
      getAllProducts(),
      getAllCategories()
    ]);
    products.value = productsData;
    categories.value = categoriesData;
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

function addToCart(product: Product) {
  cartStore.addToCart(product, 1);
}

function openEditModal(product: Product) {
  editingProduct.value = { ...product };
  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
  editingProduct.value = null;
}

function onProductUpdated(updatedProduct: Product) {
  const index = products.value.findIndex(p => p.id === updatedProduct.id);
  if (index !== -1) {
    products.value[index] = updatedProduct;
  }
  closeEditModal();
}

function formatPrice(price: number): string {
  return price.toFixed(2) + ' zł';
}

onMounted(fetchData);
</script>

<template>
  <div>
    <h1 class="mb-4">Produkty</h1>
    
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <label for="nameFilter" class="form-label">Szukaj po nazwie</label>
            <input 
              type="text" 
              class="form-control" 
              id="nameFilter"
              v-model="nameFilter"
              placeholder="Wpisz nazwę produktu..."
            />
          </div>
          <div class="col-md-6">
            <label for="categoryFilter" class="form-label">Kategoria</label>
            <select 
              class="form-select" 
              id="categoryFilter"
              v-model="categoryFilter"
            >
              <option value="">Wszystkie kategorie</option>
              <option 
                v-for="category in categories" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
      <button type="button" class="btn btn-link" @click="fetchData">Spróbuj ponownie</button>
    </div>

    <div v-else-if="filteredProducts.length > 0" class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th>Nazwa</th>
            <th>Opis</th>
            <th>Kategoria</th>
            <th class="text-end">Cena</th>
            <th class="text-end">Waga (kg)</th>
            <th class="text-center">Akcje</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in filteredProducts" :key="product.id">
            <td class="fw-medium">{{ product.name }}</td>
            <td>
              <div class="product-description" v-html="product.description"></div>
            </td>
            <td>
              <span class="badge bg-secondary">{{ product.category?.name || 'Brak kategorii' }}</span>
            </td>
            <td class="text-end">{{ formatPrice(product.unit_price) }}</td>
            <td class="text-end">{{ product.weight.toFixed(2) }}</td>
            <td class="text-center">
              <div class="btn-group btn-group-sm">
                <button 
                  class="btn btn-primary" 
                  @click="addToCart(product)"
                  title="Dodaj do koszyka"
                >
                  Kup
                </button>
                <button 
                  class="btn btn-outline-secondary" 
                  @click="openEditModal(product)"
                  title="Edytuj produkt"
                >
                  Edytuj
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="alert alert-info">
      <template v-if="products.length === 0">
        Brak produktów w bazie danych. 
      </template>
      <template v-else>
        Brak produktów spełniających kryteria wyszukiwania.
      </template>
    </div>

    <ProductEditModal
      v-if="showEditModal && editingProduct"
      :product="editingProduct"
      :categories="categories"
      @close="closeEditModal"
      @saved="onProductUpdated"
    />
  </div>
</template>

<style scoped>
.product-description {
  max-width: 300px;
  max-height: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9rem;
}
</style>
