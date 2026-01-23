<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { Order, OrderStatus, OpinionFormData } from '../types';
import { 
  getAllOrders, 
  getOrdersByStatus, 
  getAllStatuses, 
  updateOrderStatus,
  addOpinion,
  getErrorMessage 
} from '../services/api';
import OpinionModal from '../components/OpinionModal.vue';

const orders = ref<Order[]>([]);
const statuses = ref<OrderStatus[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const actionError = ref<string | null>(null);

const statusFilter = ref<number | ''>('');

const showOpinionModal = ref(false);
const opinionOrderId = ref<number | null>(null);

function formatDate(dateString: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('pl-PL');
}

function formatPrice(price: number): string {
  return price.toFixed(2) + ' zł';
}

function calculateOrderValue(order: Order): number {
  return order.orderProducts.reduce((sum, op) => sum + op.unit_price * op.amount, 0);
}

async function fetchOrders() {
  loading.value = true;
  error.value = null;
  try {
    if (statusFilter.value === '') {
      orders.value = await getAllOrders();
    } else {
      orders.value = await getOrdersByStatus(statusFilter.value);
    }
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

async function fetchStatuses() {
  try {
    statuses.value = await getAllStatuses();
  } catch (err) {
    console.error('Nie udało się pobrać statusów:', err);
  }
}

async function changeStatus(orderId: number, newStatusId: number) {
  actionError.value = null;
  try {
    const updatedOrder = await updateOrderStatus(orderId, newStatusId);
    const index = orders.value.findIndex(o => o.id === orderId);
    if (index !== -1) {
      if(orders.value[index] != undefined){
          orders.value[index].orderStatus = updatedOrder.orderStatus;
          orders.value[index].confirmation_date = updatedOrder.confirmation_date;
      }
    }
  } catch (err) {
    actionError.value = `Zamówienie #${orderId}: ${getErrorMessage(err)}`;
  }
}

function canChangeStatus(order: Order): boolean {
  return ![2, 3].includes(order.orderStatus.id);
}

function canAddOpinion(order: Order): boolean {
  return [3, 4].includes(order.orderStatus.id) && !order.opinion;
}

function openOpinionModal(orderId: number) {
  opinionOrderId.value = orderId;
  showOpinionModal.value = true;
}

function closeOpinionModal() {
  showOpinionModal.value = false;
  opinionOrderId.value = null;
}

function onOpinionAdded(orderId: number, opinion: any) {
  const order = orders.value.find(o => o.id === orderId);
  if (order) {
    order.opinion = opinion;
  }
  closeOpinionModal();
}

watch(statusFilter, () => {
  fetchOrders();
});

onMounted(async () => {
  await fetchStatuses();
  await fetchOrders();
});

function renderStars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}
</script>

<template>
  <div>
    <h1 class="mb-4">Zamówienia</h1>
    
    <div class="card mb-4">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-4">
            <label for="statusFilter" class="form-label">Filtruj wg statusu</label>
            <select 
              class="form-select" 
              id="statusFilter"
              v-model="statusFilter"
            >
              <option value="">Wszystkie statusy</option>
              <option 
                v-for="status in statuses" 
                :key="status.id" 
                :value="status.id"
              >
                {{ status.name }}
              </option>
            </select>
          </div>
          <div class="col-md-8 text-end">
            <span class="text-muted">
              Znaleziono zamówień: <strong>{{ orders.length }}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
      <button type="button" class="btn btn-link" @click="fetchOrders">Spróbuj ponownie</button>
    </div>

    <div v-if="actionError" class="alert alert-warning alert-dismissible">
      {{ actionError }}
      <button type="button" class="btn-close" @click="actionError = null"></button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Ładowanie...</span>
      </div>
    </div>

    <div v-else-if="orders.length > 0">
      <div class="accordion" id="ordersAccordion">
        <div v-for="order in orders" :key="order.id" class="accordion-item">
          <h2 class="accordion-header">
            <button 
              class="accordion-button collapsed" 
              type="button" 
              data-bs-toggle="collapse" 
              :data-bs-target="`#order-${order.id}`"
            >
              <div class="d-flex justify-content-between w-100 me-3">
                <span>
                  <strong>#{{ order.id }}</strong> — {{ order.username }}
                  <span 
                    class="badge ms-2"
                    :class="{
                      'bg-warning text-dark': order.orderStatus.id === 1,
                      'bg-danger': order.orderStatus.id === 3,
                      'bg-info': order.orderStatus.id === 4,
                      'bg-success': order.orderStatus.id === 2,
                    }"
                  >
                    {{ order.orderStatus.name }}
                  </span>
                </span>
                <span class="text-muted">
                  {{ formatDate(order.confirmation_date) }} | 
                  <strong>{{ formatPrice(calculateOrderValue(order)) }}</strong>
                </span>
              </div>
            </button>
          </h2>
          <div :id="`order-${order.id}`" class="accordion-collapse collapse">
            <div class="accordion-body">
              <div class="row mb-3">
                <div class="col-md-4">
                  <small class="text-muted">Email</small>
                  <div>{{ order.email }}</div>
                </div>
                <div class="col-md-4">
                  <small class="text-muted">Telefon</small>
                  <div>{{ order.phone_number }}</div>
                </div>
                <div class="col-md-4">
                  <small class="text-muted">Data zatwierdzenia</small>
                  <div>{{ formatDate(order.confirmation_date) }}</div>
                </div>
              </div>

              <h6>Produkty:</h6>
              <table class="table table-sm table-bordered">
                <thead class="table-light">
                  <tr>
                    <th>Produkt</th>
                    <th class="text-center">Ilość</th>
                    <th class="text-end">Cena jedn.</th>
                    <th class="text-end">Suma</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="op in order.orderProducts" :key="op.id">
                    <td>{{ op.product.name }}</td>
                    <td class="text-center">{{ op.amount }}</td>
                    <td class="text-end">{{ formatPrice(op.unit_price) }}</td>
                    <td class="text-end">{{ formatPrice(op.unit_price * op.amount) }}</td>
                  </tr>
                </tbody>
                <tfoot class="table-light">
                  <tr>
                    <td colspan="3" class="text-end"><strong>Razem:</strong></td>
                    <td class="text-end"><strong>{{ formatPrice(calculateOrderValue(order)) }}</strong></td>
                  </tr>
                </tfoot>
              </table>

              <div v-if="order.opinion" class="card bg-light mb-3">
                <div class="card-body">
                  <h6 class="card-title">
                    Opinia klienta
                    <span class="rating-stars ms-2">{{ renderStars(order.opinion.rating) }}</span>
                  </h6>
                  <p class="mb-1 text-muted small">
                    Data opinii: {{
                      new Date(order.opinion.opinion_date).toLocaleDateString('pl-PL')
                    }}
                  </p>
                  <p class="card-text mb-0">{{ order.opinion.content }}</p>
                </div>
              </div>

              <div class="d-flex gap-2 flex-wrap">
                <template v-if="canChangeStatus(order)">
                  <template v-if="order.orderStatus.id === 1">
                    <button 
                      class="btn btn-info btn-sm"
                      @click="changeStatus(order.id, 4)"
                    >
                      Zatwierdź
                    </button>
                    <button 
                      class="btn btn-outline-danger btn-sm"
                      @click="changeStatus(order.id, 3)"
                    >
                      Anuluj
                    </button>
                  </template>
                  <template v-else-if="order.orderStatus.id === 4">
                    <button 
                      class="btn btn-success btn-sm"
                      @click="changeStatus(order.id, 2)"
                    >
                      Zrealizowane
                    </button>
                    <button 
                      class="btn btn-outline-danger btn-sm"
                      @click="changeStatus(order.id, 3)"
                    >
                      Anuluj
                    </button>
                  </template>
                </template>

                <button 
                  v-if="canAddOpinion(order)"
                  class="btn btn-outline-primary btn-sm"
                  @click="openOpinionModal(order.id)"
                >
                  Dodaj opinię
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-info">
      Brak zamówień{{ statusFilter !== '' ? ' o wybranym statusie' : '' }}.
    </div>

    <OpinionModal
      v-if="showOpinionModal && opinionOrderId"
      :order-id="opinionOrderId"
      @close="closeOpinionModal"
      @saved="onOpinionAdded"
    />
  </div>
</template>

<style scoped>
.rating-stars {
  color: #ffc107;
  letter-spacing: 2px;
}

.accordion-button:not(.collapsed) {
  background-color: #e7f1ff;
}
</style>
