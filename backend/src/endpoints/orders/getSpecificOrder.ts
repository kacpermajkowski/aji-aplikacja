import { Express } from "express";
import { AppDataSource } from "data-source";
import { Product } from "model/Product";
import { Order } from "model/Order";
import { StatusCodes } from "http-status-codes";

const ordersRepo = AppDataSource.getRepository(Order);

export default function getSpecificOrder(app: Express){
    app.get('/orders/:id', async (req, res) => {
        const orderId = Number(req.params.id);
        if (Number.isNaN(orderId)) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                message: 'Invalid order id'
            });
        }
        const order = await ordersRepo.findOne({
            where: { id: orderId },
            relations: ['orderProducts', 'orderProducts.product', 'orderStatus']
        });
        if (!order) {
            return res.status(StatusCodes.NOT_FOUND).send({
                message: `Order with id = ${orderId} not found`
            });
        }
        res.send({ order });
    })
}