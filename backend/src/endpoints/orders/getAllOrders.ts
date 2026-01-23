import { Express } from "express";
import { AppDataSource } from "data-source";
import { Product } from "model/Product";
import { Order } from "model/Order";

const productsRepo = AppDataSource.getRepository(Product);
const ordersRepo = AppDataSource.getRepository(Order);

export default function getAllOrders(app: Express){
    app.get('/orders', async (req, res) => {
        const allOrders = await ordersRepo.find({
            relations: {
                orderProducts: {
                    product: true,
                },
                orderStatus: true,
                opinion: true
            },
        });
        res.send({
            orders: allOrders,
        })
    })
}