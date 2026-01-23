<script setup lang="ts">
import { ref } from 'vue';
import type { OpinionFormData } from '../types';
import { addOpinion, getErrorMessage } from '../services/api';

const props = defineProps<{
  orderId: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved', orderId: number, opinion: any): void;
}>();


const formData = ref<OpinionFormData>({
  rating: 5,
  content: '',
  opinion_date: new Date(),
});

const saving = ref(false);
const serverError = ref<string | null>(null);
const validationErrors = ref<Record<string, string>>({});

function validate(): boolean {
  validationErrors.value = {};
  
  if (formData.value.rating < 1 || formData.value.rating > 5) {
    validationErrors.value.rating = 'Ocena musi być w skali 1-5';
  }
  
  if (!formData.value.content.trim()) {
    validationErrors.value.content = 'Treść opinii jest wymagana';
  }
  
  return Object.keys(validationErrors.value).length === 0;
}

async function saveOpinion() {
  if (!validate()) return;

  saving.value = true;
  serverError.value = null;

  try {
    const opinion = await addOpinion(props.orderId, {
      rating: formData.value.rating,
      content: formData.value.content.trim(),
      opinion_date: formData.value.opinion_date,
    });
    emit('saved', props.orderId, opinion);
  } catch (err) {
    serverError.value = getErrorMessage(err);
  } finally {
    saving.value = false;
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
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Dodaj opinię do zamówienia #{{ orderId }}</h5>
          <button type="button" class="btn-close" @click="emit('close')"></button>
        </div>
        
        <form @submit.prevent="saveOpinion">
          <div class="modal-body">
            <div v-if="serverError" class="alert alert-danger alert-dismissible">
              {{ serverError }}
              <button type="button" class="btn-close" @click="serverError = null"></button>
            </div>
            

            <div class="mb-3">
              <label class="form-label">Ocena *</label>
              <div class="rating-selector">
                <button 
                  v-for="star in 5" 
                  :key="star"
                  type="button"
                  class="btn btn-lg p-1"
                  :class="star <= formData.rating ? 'text-warning' : 'text-muted'"
                  @click="formData.rating = star"
                >
                  {{ star <= formData.rating ? '★' : '☆' }}
                </button>
                <span class="ms-2">({{ formData.rating }}/5)</span>
              </div>
              <div v-if="validationErrors.rating" class="text-danger small">
                {{ validationErrors.rating }}
              </div>
            </div>

            <div class="mb-3">
              <label for="opinion_date" class="form-label">Data opinii *</label>
              <input
                type="date"
                class="form-control"
                id="opinion_date"
                v-model="formData.opinion_date"
                required
              />
            </div>
            
            <div class="mb-3">
              <label for="content" class="form-label">Treść opinii *</label>
              <textarea 
                class="form-control"
                :class="{ 'is-invalid': validationErrors.content }"
                id="content"
                v-model="formData.content"
                rows="4"
                placeholder="Napisz swoją opinię o obsłudze zamówienia..."
              ></textarea>
              <div v-if="validationErrors.content" class="invalid-feedback">
                {{ validationErrors.content }}
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="emit('close')">
              Anuluj
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              Dodaj opinię
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

.rating-selector button {
  font-size: 1.5rem;
  border: none;
  background: none;
}

.rating-selector button:hover {
  transform: scale(1.2);
}
</style>
