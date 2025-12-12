import { Express } from "express";
import { AppDataSource } from "data-source";
import { Product } from "model/Product";
import { Order } from "model/Order";
import { StatusCodes } from "http-status-codes";
import { OrderProduct } from "model/OrderProduct";
import { OrderStatus } from "model/OrderStatus";

const productsRepo = AppDataSource.getRepository(Product);
const ordersRepo = AppDataSource.getRepository(Order);
const orderStatusRepo = AppDataSource.getRepository(OrderStatus);
const orderProductsRepo = AppDataSource.getRepository(OrderProduct);

export default function addNewOrder(app: Express){
    
    app.post('/orders', async (req, res) => {
        try {
            const { username, email, phone_number, statusId, items } = req.body;

            if (!username || !email || !phone_number || !statusId || !Array.isArray(items) || items.length === 0) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'Missing required fields: username, email, phone_number, statusId, items[]'
                });
            }

            if (typeof username !== 'string' || typeof email !== 'string' || typeof phone_number !== 'string') {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'username, email, and phone_number must be strings'
                });
            }

            if (username.length === 0 || email.length === 0 || phone_number.length === 0) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'username, email, and phone_number cannot be empty strings'
                });
            }

            const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

            if (!emailRegex.test(email)) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'Invalid email format'
                });
            }

            const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
            if (!phoneRegex.test(phone_number)) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'Invalid phone number format'
                });
            }

            const parsedStatusId = Number(statusId);
            if (Number.isNaN(parsedStatusId)) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'statusId must be a number'
                });
            }

            const status = await orderStatusRepo.findOne({
                where: { id: parsedStatusId }
            });

            if (!status) {
                return res.status(StatusCodes.NOT_FOUND).send({
                    message: `Order status with id = ${parsedStatusId} not found`
                });
            }

            const orderItems : OrderProduct[] = [];
            for (const item of items) {
                const productId = Number(item?.productId); 
                const amount = Number(item?.amount);

                if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(amount) || amount <= 0) {
                    return res.status(StatusCodes.BAD_REQUEST).send({
                        message: 'Each item must have a valid productId and amount (both positive integers)'
                    });
                }
                const product = await productsRepo.findOne({
                    where: { id: productId }
                });
                if (!product) {
                    return res.status(StatusCodes.NOT_FOUND).send({
                        message: `Product with id = ${productId} not found`
                    });
                }
                const orderProduct = new OrderProduct();
                orderProduct.product = product;
                orderProduct.amount = amount;
                orderProduct.unit_price = product.unit_price;
                orderItems.push(orderProduct);
            }

            const order = new Order();
            order.username = username;
            order.email = email;
            order.phone_number = phone_number;
            order.orderStatus = status;
            
            const savedOrder = await ordersRepo.save(order);

            for (const orderItem of orderItems) {
                orderItem.order = savedOrder;
            }
            await orderProductsRepo.save(orderItems);

            return res.status(StatusCodes.CREATED).send({
                order: savedOrder,
                items: orderItems
            });
        } catch (err) {
            console.error(err);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                error: 'Failed to create order'
            });
        }
    })
}