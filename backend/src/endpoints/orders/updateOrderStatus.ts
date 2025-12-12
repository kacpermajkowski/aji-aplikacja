import { Express } from "express";
import { AppDataSource } from "data-source";
import { Product } from "model/Product";
import { Category } from "model/Category";
import { StatusCodes } from "http-status-codes";
import { Order } from "model/Order";
import { OrderStatus } from "model/OrderStatus";


const ordersRepo = AppDataSource.getRepository(Order);
const orderStatusRepo = AppDataSource.getRepository(OrderStatus);

export default function updateOrderStatus(app: Express){
    app.put('/orders/:id', async (req, res) => {
        try {
            const orderIdNum = Number(req.params.id);
            if (Number.isNaN(orderIdNum) || orderIdNum <= 0) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'orders/:id has to be an integer greater than 0'
                });
            }

            const { statusId } = req.body;
            if (statusId === undefined) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'Missing statusId in request body'
                });
            }
            if(Number.isNaN(Number(statusId)) || statusId <= 0)
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'statusID has to be an integer greater than 0'
                });
            
            const order = await ordersRepo.findOne({
                where: { id: orderIdNum },
                relations: ['orderStatus']
            });

            if (!order) {
                return res.status(StatusCodes.NOT_FOUND).send({
                    message: `Order id=${orderIdNum} not found`
                });
            }

            const newStatus = await orderStatusRepo.findOne({
                where: { id: Number(statusId) }
            });

            if (!newStatus) {
                return res.status(StatusCodes.NOT_FOUND).send({
                    message: `Status id=${statusId} not found`
                });
            }

            if (statusId == 3 && !order.confirmation_date) {
                order.confirmation_date = new Date();
            }

            const allowedStatusTransitions: Record<number, number[]> ={
                1: [2,3],
                3: [2,4],
                2: [],
                4: [],
            };

            if (!allowedStatusTransitions[order.orderStatus.id]?.includes(newStatus.id)) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: `Cannot change status from ${order.orderStatus.name} to ${newStatus.name}`
                });
            }

            order.orderStatus = newStatus;
            const saved = await ordersRepo.save(order);
            return res.status(StatusCodes.OK).send({ order: saved });

        } catch (err) {
            console.error(err);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Failed to update order status' });
        }
    })
}