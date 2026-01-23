import { Express } from "express";
import { AppDataSource } from "data-source";
import { Product } from "model/Product";
import { Category } from "model/Category";
import { Order } from "model/Order";
import { OrderStatus } from "model/OrderStatus";

const productsRepo = AppDataSource.getRepository(Product);
const categoriesRepo = AppDataSource.getRepository(Category);
const orderStatusRepo = AppDataSource.getRepository(OrderStatus);

export default function getAllStatuses(app: Express){
    app.get('/status', async (req, res) => {
        const allStatuses = await orderStatusRepo.find();
        res.send({
            statuses: allStatuses
        })
    })
}