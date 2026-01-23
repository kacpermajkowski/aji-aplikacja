import axios, { AxiosError } from 'axios';
import type { 
  Product, 
  Category, 
  Order, 
  OrderStatus, 
  Opinion,
  ProductFormData,
  OpinionFormData 
} from '../types';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError && error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Wystąpił nieznany błąd';
}


export async function getAllProducts(): Promise<Product[]> {
  const response = await api.get<{ products: Product[] }>('/products');
  return response.data.products;
}

export async function getProduct(id: number): Promise<Product> {
  const response = await api.get<{ products: Product[] }>(`/products/${id}`);
  const product = response.data.products[0];
  if (!product) {
    throw new Error(`Product with id ${id} not found`);
  }
  return product;
}

export async function createProduct(data: ProductFormData): Promise<Product> {
  const response = await api.post<{ product: Product }>('/products', {
    name: data.name,
    description: data.description,
    unit_price: Number(data.unit_price),
    weight: Number(data.weight),
    categoryId: Number(data.categoryId),
  });
  return response.data.product;
}

export async function updateProduct(id: number, data: Partial<ProductFormData>): Promise<Product> {
  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.description !== undefined) payload.description = data.description;
  if (data.unit_price !== undefined) payload.unit_price = Number(data.unit_price);
  if (data.weight !== undefined) payload.weight = Number(data.weight);
  if (data.categoryId !== undefined) payload.categoryId = Number(data.categoryId);
  
  const response = await api.put<{ product: Product }>(`/products/${id}`, payload);
  return response.data.product;
}

export async function getSeoDescription(id: number): Promise<string> {
  const response = await api.get<string>(`/products/${id}/seo-description`);
  return response.data;
}

export async function getAllCategories(): Promise<Category[]> {
  const response = await api.get<{ categories: Category[] }>('/categories');
  return response.data.categories;
}

export async function getAllOrders(): Promise<Order[]> {
  const response = await api.get<{ orders: Order[] }>('/orders');
  return response.data.orders;
}

export async function getOrder(id: number): Promise<Order> {
  const response = await api.get<{ order: Order }>(`/orders/${id}`);
  return response.data.order;
}

export async function getOrdersByStatus(statusId: number): Promise<Order[]> {
  const response = await api.get<{ orders: Order[] }>(`/orders/status/${statusId}`);
  return response.data.orders;
}

export interface CreateOrderData {
  username: string;
  email: string;
  phone_number: string;
  items: Array<{
    productId: number;
    amount: number;
  }>;
}

export async function createOrder(data: CreateOrderData): Promise<Order> {
  const response = await api.post<{ order: Order }>('/orders', data);
  return response.data.order;
}

export async function updateOrderStatus(id: number, statusId: number): Promise<Order> {
  const response = await api.put<{ order: Order }>(`/orders/${id}`, { statusId });
  return response.data.order;
}

export async function getAllStatuses(): Promise<OrderStatus[]> {
  const response = await api.get<{ statuses: OrderStatus[] }>('/status');
  return response.data.statuses;
}

export async function addOpinion(orderId: number, data: OpinionFormData): Promise<Opinion> {
  const payload = {
    rating: data.rating,
    content: data.content,
    opinion_date: data.opinion_date,
  };
  const response = await api.post<{ opinion: Opinion }>(`/orders/${orderId}/opinions`, payload);
  return response.data.opinion;
}

export async function initializeProducts(file: File): Promise<{ message: string; count: number }> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post<{ message: string; count: number }>('/init', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}
