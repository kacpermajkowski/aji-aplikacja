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
            if(!req.body){
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'Missing request body'
                });
            }

            const { username, email, phone_number, statusId, items } = req.body;

            if (!username || !email || !phone_number || !Array.isArray(items) || items.length === 0) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'Missing required fields: username, email, phone_number, items[]'
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
            // International phone number regex from https://stackoverflow.com/questions/2113908/what-regular-expression-will-match-valid-international-phone-numbers
            const phoneRegex = /^\+((?:9[679]|8[035789]|6[789]|5[90]|42|3[578]|2[1-689])|9[0-58]|8[1246]|6[0-6]|5[1-8]|4[013-9]|3[0-469]|2[70]|7|1)(?:\W*\d){0,13}\d$/;
            if (!phoneRegex.test(phone_number)) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'Invalid phone number format'
                });
            }

            const parsedStatusId = statusId === undefined || statusId === null || statusId === '' ? 1 : Number(statusId);

            if (!Number.isInteger(parsedStatusId) || parsedStatusId <= 0) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'statusId must be a positive integer'
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

                let unit_price_to_save: number;
                if (item.unit_price !== undefined) {
                    const parsedUnitPrice = Number(item.unit_price);
                    if (isNaN(parsedUnitPrice) || parsedUnitPrice < 0) {
                        return res.status(StatusCodes.BAD_REQUEST).send({
                            message: 'unit_price must be a non-negative number'
                        });
                    }
                    unit_price_to_save = parsedUnitPrice;
                } else {
                    unit_price_to_save = product.unit_price;
                }
                const orderProduct = new OrderProduct();
                orderProduct.product = product;
                orderProduct.amount = amount;
                orderProduct.unit_price = unit_price_to_save;

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

            const fullOrder = await ordersRepo.findOne({
                where: { id: savedOrder.id },
                relations: {
                    orderProducts: { product: true },
                    orderStatus: true,
                },
            });

            return res.status(StatusCodes.CREATED).send({
                order: fullOrder,
            });
        } catch (err) {
            console.error(err);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                error: 'Failed to create order'
            });
        }
    })
}