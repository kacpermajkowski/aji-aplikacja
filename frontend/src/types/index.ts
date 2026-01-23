export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  unit_price: number;
  weight: number;
  category: Category;
}

export interface OrderStatus {
  id: number;
  name: string;
}

export interface Opinion {
  id: number;
  rating: number;
  content: string;
  opinion_date: Date;
}

export interface OrderProduct {
  id: number;
  unit_price: number;
  amount: number;
  product: Product;
}

export interface Order {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  confirmation_date: string | null;
  orderStatus: OrderStatus;
  orderProducts: OrderProduct[];
  opinion?: Opinion | null;
}

export interface CartItem {
  product: Product;
  amount: number;
}

export interface OrderFormData {
  username: string;
  email: string;
  phone_number: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  unit_price: number | string;
  weight: number | string;
  categoryId: number | string;
}

export interface OpinionFormData {
  rating: number;
  content: string;
  opinion_date: Date;
}

export interface ProductInitData {
  name: string;
  description: string;
  unit_price: number;
  weight: number;
  category: number;
}

export interface ProductsInitFile {
  products: ProductInitData[];
}
