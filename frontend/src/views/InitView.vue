<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { ProductsInitFile, ProductInitData, Category } from '../types';
import { initializeProducts, getAllProducts, getAllCategories, getErrorMessage } from '../services/api';

const file = ref<File | null>(null);
const fileContent = ref<ProductsInitFile | null>(null);
const categories = ref<Category[]>([]);
const productsCount = ref<number | null>(null);

const loading = ref(true);
const uploading = ref(false);
const serverError = ref<string | null>(null);
const validationErrors = ref<string[]>([]);
const successMessage = ref<string | null>(null);

const isDatabaseEmpty = computed(() => productsCount.value === 0);

async function checkDatabase() {
  loading.value = true;
  try {
    const [products, cats] = await Promise.all([
      getAllProducts(),
      getAllCategories()
    ]);
    productsCount.value = products.length;
    categories.value = cats;
  } catch (err) {
    serverError.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

function validateFileStructure(data: any): string[] {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Plik musi zawierać obiekt JSON');
    return errors;
  }
  
  if (!Array.isArray(data.products)) {
    errors.push('Plik musi zawierać tablicę "products"');
    return errors;
  }
  
  if (data.products.length === 0) {
    errors.push('Tablica produktów nie może być pusta');
    return errors;
  }
  
  const categoryIds = categories.value.map(c => c.id);
  
  data.products.forEach((product: any, index: number) => {
    const productErrors: string[] = [];
    
    if (!product.name || typeof product.name !== 'string' || product.name.trim() === '') {
      productErrors.push('brak nazwy');
    }
    
    if (!product.description || typeof product.description !== 'string' || product.description.trim() === '') {
      productErrors.push('brak opisu');
    }
    
    if (typeof product.unit_price !== 'number' || product.unit_price <= 0) {
      productErrors.push('nieprawidłowa cena (musi być liczbą > 0)');
    }
    
    if (typeof product.weight !== 'number' || product.weight <= 0) {
      productErrors.push('nieprawidłowa waga (musi być liczbą > 0)');
    }
    
    if (!product.category || !Number.isInteger(product.category)) {
      productErrors.push('brak kategorii (musi być ID kategorii)');
    } else if (!categoryIds.includes(product.category)) {
      productErrors.push(`kategoria o ID ${product.category} nie istnieje (dostępne: ${categoryIds.join(', ')})`);
    }
    
    if (productErrors.length > 0) {
      errors.push(`Produkt #${index + 1}${product.name ? ` (${product.name})` : ''}: ${productErrors.join(', ')}`);
    }
  });
  
  return errors;
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const selectedFile = input.files?.[0];
  
  fileContent.value = null;
  validationErrors.value = [];
  serverError.value = null;
  successMessage.value = null;
  
  if (!selectedFile) {
    file.value = null;
    return;
  }
  
  if (!selectedFile.name.endsWith('.json')) {
    validationErrors.value = ['Plik musi mieć rozszerzenie .json'];
    file.value = null;
    return;
  }
  
  file.value = selectedFile;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = JSON.parse(e.target?.result as string);
      fileContent.value = content;
      validationErrors.value = validateFileStructure(content);
    } catch (err) {
      validationErrors.value = ['Nieprawidłowy format JSON: ' + (err as Error).message];
      fileContent.value = null;
    }
  };
  reader.readAsText(selectedFile);
}

async function uploadFile() {
  if (!file.value || validationErrors.value.length > 0) return;
  
  uploading.value = true;
  serverError.value = null;
  successMessage.value = null;
  
  try {
    const result = await initializeProducts(file.value);
    successMessage.value = `${result.message}. Dodano produktów: ${result.count || fileContent.value?.products.length}`;
    file.value = null;
    fileContent.value = null;
    await checkDatabase();
  } catch (err) {
    serverError.value = getErrorMessage(err);
  } finally {
    uploading.value = false;
  }
}

function resetForm() {
  file.value = null;
  fileContent.value = null;
  validationErrors.value = [];
  serverError.value = null;
  successMessage.value = null;
  const input = document.getElementById('fileInput') as HTMLInputElement;
  if (input) input.value = '';
}

onMounted(checkDatabase);
</script>

<template>
  <div>
    <h1 class="mb-4">Inicjalizacja bazy danych</h1>
    
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Ładowanie...</span>
      </div>
    </div>

    <template v-else>
      <div v-if="successMessage" class="alert alert-success alert-dismissible">
        {{ successMessage }}
        <button type="button" class="btn-close" @click="successMessage = null"></button>
      </div>

      <div v-if="!isDatabaseEmpty" class="alert alert-warning">
        <h5 class="alert-heading">Baza danych zawiera już produkty</h5>
        <p class="mb-0">
          W bazie danych znajduje się już <strong>{{ productsCount }}</strong> produktów.
          Inicjalizacja jest możliwa tylko gdy baza jest pusta.
        </p>
        <hr>
        <RouterLink to="/" class="btn btn-warning">
          Przejdź do produktów
        </RouterLink>
      </div>

      <div v-else class="card">
        <div class="card-header">
          <h5 class="mb-0">Wczytaj produkty z pliku JSON</h5>
        </div>
        <div class="card-body">
          <div v-if="serverError" class="alert alert-danger alert-dismissible">
            {{ serverError }}
            <button type="button" class="btn-close" @click="serverError = null"></button>
          </div>

          <div class="alert alert-info">
            <h6>Format pliku JSON:</h6>
            <pre class="mb-0 small"><code>{
  "products": [
    {
      "name": "Nazwa produktu",
      "description": "Opis produktu",
      "unit_price": 19.99,
      "weight": 0.5,
      "category": 1
    }
  ]
}</code></pre>
            <hr>
            <p class="mb-0">
              <strong>Dostępne kategorie: </strong> 
              <span v-for="(cat, index) in categories" :key="cat.id">
                {{ cat.id }} ({{ cat.name }})<span v-if="index < categories.length - 1">, </span>
              </span>
              <span v-if="categories.length === 0" class="text-danger">Brak kategorii w bazie!</span>
            </p>
          </div>

          <div class="mb-3">
            <label for="fileInput" class="form-label">Wybierz plik JSON</label>
            <input 
              type="file" 
              class="form-control"
              :class="{ 'is-invalid': validationErrors.length > 0 }"
              id="fileInput"
              accept=".json"
              @change="onFileChange"
            />
          </div>

          <div v-if="validationErrors.length > 0" class="alert alert-danger">
            <h6>Błędy walidacji:</h6>
            <ul class="mb-0">
              <li v-for="(error, index) in validationErrors" :key="index">
                {{ error }}
              </li>
            </ul>
          </div>

          <div v-if="fileContent && validationErrors.length === 0" class="alert alert-success">
            <h6>Plik poprawny</h6>
            <p class="mb-0">
              Znaleziono <strong>{{ fileContent.products.length }}</strong> produktów do dodania.
            </p>
          </div>

          <div class="d-flex gap-2">
            <button 
              class="btn btn-primary"
              :disabled="!file || validationErrors.length > 0 || uploading"
              @click="uploadFile"
            >
              <span v-if="uploading" class="spinner-border spinner-border-sm me-1"></span>
              Zainicjalizuj bazę danych
            </button>
            <button 
              class="btn btn-outline-secondary"
              @click="resetForm"
              :disabled="uploading"
            >
              Resetuj
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
pre {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.25rem;
  overflow-x: auto;
}
</style>
