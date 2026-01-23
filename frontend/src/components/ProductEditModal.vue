<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Product, Category, ProductFormData } from '../types';
import { updateProduct, getSeoDescription, getErrorMessage } from '../services/api';

const props = defineProps<{
  product: Product;
  categories: Category[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved', product: Product): void;
}>();

const formData = ref<ProductFormData>({
  name: props.product.name,
  description: props.product.description,
  unit_price: props.product.unit_price,
  weight: props.product.weight,
  categoryId: props.product.category.id,
});

const saving = ref(false);
const optimizing = ref(false);
const serverError = ref<string | null>(null);

async function saveProduct() {
  saving.value = true;
  serverError.value = null;
  
  try {
    const updatedProduct = await updateProduct(props.product.id, formData.value);
    emit('saved', updatedProduct);
  } catch (err) {
    serverError.value = getErrorMessage(err);
  } finally {
    saving.value = false;
  }
}

async function optimizeDescription() {
  optimizing.value = true;
  serverError.value = null;
  
  try {
    const seoDescription = await getSeoDescription(props.product.id);
    formData.value.description = seoDescription;
  } catch (err) {
    serverError.value = getErrorMessage(err);
  } finally {
    optimizing.value = false;
  }
}

function handleBackdropClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('modal')) {
    emit('close');
  }
}
</script>

<template>
  <div class="modal fade show d-block" tabindex="-1" @click="handleBackdropClick">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Edytuj produkt: {{ product.name }}</h5>
          <button type="button" class="btn-close" @click="emit('close')"></button>
        </div>
        
        <form @submit.prevent="saveProduct">
          <div class="modal-body">
            <div v-if="serverError" class="alert alert-danger alert-dismissible">
              {{ serverError }}
              <button type="button" class="btn-close" @click="serverError = null"></button>
            </div>
            
            <div class="mb-3">
              <label for="name" class="form-label">Nazwa *</label>
              <input 
                type="text" 
                class="form-control" 
                id="name"
                v-model="formData.name"
                required
              />
            </div>
            
            <div class="mb-3">
              <label for="description" class="form-label">
                Opis *
                <button 
                  type="button" 
                  class="btn btn-sm btn-outline-info ms-2"
                  @click="optimizeDescription"
                  :disabled="optimizing"
                >
                  <span v-if="optimizing" class="spinner-border spinner-border-sm me-1"></span>
                  Optymalizuj opis
                </button>
              </label>
              <textarea 
                class="form-control" 
                id="description"
                v-model="formData.description"
                rows="5"
                required
              ></textarea>
            </div>
            
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="unit_price" class="form-label">Cena (zł) *</label>
                <input 
                  type="number" 
                  class="form-control" 
                  id="unit_price"
                  v-model="formData.unit_price"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
              <div class="col-md-6 mb-3">
                <label for="weight" class="form-label">Waga (kg) *</label>
                <input 
                  type="number" 
                  class="form-control" 
                  id="weight"
                  v-model="formData.weight"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
            </div>
            
            <div class="mb-3">
              <label for="categoryId" class="form-label">Kategoria *</label>
              <select 
                class="form-select" 
                id="categoryId"
                v-model="formData.categoryId"
                required
              >
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
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="emit('close')">
              Anuluj
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              Zapisz zmiany
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show"></div>
</template>

<style scoped>
.modal {
  background: rgba(0, 0, 0, 0.5);
}
</style>
