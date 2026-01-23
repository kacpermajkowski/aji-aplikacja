import { createRouter, createWebHistory } from 'vue-router';
import ProductsView from '../views/ProductsView.vue';
import CartView from '../views/CartView.vue';
import OrdersView from '../views/OrdersView.vue';
import InitView from '../views/InitView.vue';

const routes = [
  {
    path: '/',
    name: 'products',
    component: ProductsView,
    meta: { title: 'Produkty' }
  },
  {
    path: '/cart',
    name: 'cart',
    component: CartView,
    meta: { title: 'Koszyk' }
  },
  {
    path: '/orders',
    name: 'orders',
    component: OrdersView,
    meta: { title: 'Zamówienia' }
  },
  {
    path: '/init',
    name: 'init',
    component: InitView,
    meta: { title: 'Inicjalizacja bazy danych' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || 'Sklep'} | AJI Aplikacja`;
  next();
});

export default router;
