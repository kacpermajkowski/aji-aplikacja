import { Express } from "express";

import getAllProducts from "endpoints/products/getAllProducts";
import getSpecificProduct from "endpoints/products/getSpecificProduct";
import addNewProduct from "endpoints/products/addNewProduct";
import updateSpecificProduct from "endpoints/products/updateSpecificProduct";
import getSeoDescription from "endpoints/products/getSeoDescription";

import getAllCategories from "endpoints/categories/getAllCategories";

import getAllOrders from "endpoints/orders/getAllOrders";
import addNewOrder from "endpoints/orders/addNewOrder";
import updateOrderStatus from "endpoints/orders/updateOrderStatus";
import getSpecificOrder from "endpoints/orders/getSpecificOrder";

import getAllStatuses from "endpoints/status/getAllStatuses";


export function endpoints(app: Express) {
    // Product
    getAllProducts(app);
    getSpecificProduct(app);
    addNewProduct(app);
    updateSpecificProduct(app);
    getSeoDescription(app);

    // Category
    getAllCategories(app);
    
    // Orders
    getAllOrders(app);
    addNewOrder(app);
    updateOrderStatus(app);
    getSpecificOrder(app);

    // Order Statuses
    getAllStatuses(app);
}