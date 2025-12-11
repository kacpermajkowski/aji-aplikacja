import { Express } from "express";
import { AppDataSource } from "data-source";
import { Product } from "model/Product";
import { Category } from "model/Category";
import { Order } from "model/Order";

const productsRepo = AppDataSource.getRepository(Product);
const categoriesRepo = AppDataSource.getRepository(Category);
const ordersRepo = AppDataSource.getRepository(Order);

export default function getOrdersByStatus(app: Express){
    app.get('/orders/status/:id', async (req, res) => {
        const orderList = await ordersRepo.find({
            where: { orderStatus: { id: parseInt(req.params.id) } }
        })
        res.send({ orders: orderList });
    })
}