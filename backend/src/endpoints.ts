import { Express } from "express";
import { AppDataSource } from "./data-source";
import { Product } from "./model/Product";
import { Category } from "./model/Category";
import { Order } from "./model/Order";
import { OrderStatus } from "./model/OrderStatus";
import { OrderProduct } from "./model/OrderProduct";
import {
	ReasonPhrases,
	StatusCodes,
	getReasonPhrase,
	getStatusCode,
} from 'http-status-codes';


export function endpoints(app: Express){
    const productsRepo = AppDataSource.getRepository(Product);
    const categoriesRepo = AppDataSource.getRepository(Category);
    const ordersRepo = AppDataSource.getRepository(Order);
    const orderStatusRepo = AppDataSource.getRepository(OrderStatus);
    const orderProductsRepo = AppDataSource.getRepository(OrderProduct);

    // Product

    app.get('/products', async (req, res) => {
        const allProducts = await productsRepo.find();
        res.send({
            products: allProducts
        })
    })

    app.get('/products/:id', async (req, res) => {
        const productList = await productsRepo.findBy({ id: parseInt(req.params.id) });
        res.send({ products: productList });
    })

    app.post('/products', async (req, res) => {
        try {
            const { name, description, unit_price, categoryId } = req.body;

            // unit_price can be 0 at this validation stage
            // so for now we check if it's undefined
            // because negating 0 would yield 'true' which would
            // trigger the error message incorrectly
            if (!name || !description || unit_price === undefined || !categoryId) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'Missing required fields: name, description, unit_price, categoryId'
                });
            }

            if (
                typeof name !== 'string' || typeof description !== 'string' ||
                name.length == 0 || description.length == 0
            ) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'name and description must be non-empty strings' 
                });
            }

            const parsedUnitPrice = Number(unit_price);
            const parsedCategoryId = Number(categoryId);
            if (Number.isNaN(parsedUnitPrice) || Number.isNaN(parsedCategoryId)) {
                return res.status(StatusCodes.BAD_REQUEST).send({ 
                    message: 'unit_price and categoryId must be numbers' 
                });
            }

            if(!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0 ){
                return res.status(StatusCodes.BAD_REQUEST).send({ 
                    message: 'categoryId must be an integer greater than 0' 
                });
            }

            if(parsedUnitPrice <= 0){
                return res.status(StatusCodes.BAD_REQUEST).send({ 
                    message: 'unitPrice must be greater than 0' 
                });
            }

            const category = await categoriesRepo.findOne({
                where: { id: parsedCategoryId } 
            });

            if (!category) {
                return res.status(StatusCodes.NOT_FOUND).send({ 
                    message: `Category with id = ${parsedCategoryId} not found` 
                });
            }

            // Create and save product
            const product = new Product();
            product.name = name;
            product.description = description;
            product.unit_price = parsedUnitPrice;
            product.category = category;

            const saved = await productsRepo.save(product);
            return res.status(StatusCodes.CREATED).send({ product: saved });
        } catch (err) {
            console.error(err);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                error: 'Failed to create product' 
            });
        }
    })
    
    app.put('/products/:id', async (req, res) => {
        try {
            const productId = parseInt(req.params.id);
            if (Number.isNaN(productId)) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'Invalid product id'
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

            const { name, description, unit_price, categoryId } = req.body;

            if (name !== undefined && typeof name === 'string') {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'name must be a string' 
                });
            }
            if (description !== undefined && typeof description === 'string') {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'description must be a string' 
                });
            }
            if (unit_price !== undefined) {
                const parsedUnitPrice = Number(unit_price);
                if (Number.isNaN(parsedUnitPrice)) {
                    return res.status(StatusCodes.BAD_REQUEST).send({
                        message: 'unit_price must be a number' 
                    });
                }
                product.unit_price = parsedUnitPrice;
            }
            if (categoryId !== undefined) {
                const parsedCategoryId = Number(categoryId);
                if (Number.isNaN(parsedCategoryId)) {
                    return res.status(StatusCodes.BAD_REQUEST).send({
                        message: 'categoryId must be a number' 
                    });
                }
                const category = await categoriesRepo.findOne({
                    where: { id: parsedCategoryId } 
                });
                if (!category) {
                    return res.status(StatusCodes.NOT_FOUND).send({ 
                        message: `Category with id = ${parsedCategoryId} not found` 
                    });
                }
                product.category = category;
            }
            if (name !== undefined) {
                product.name = name;
            }
            if (description !== undefined) {
                product.description = description;
            }
            
            const updated = await productsRepo.save(product);
            return res.status(StatusCodes.OK).send({ product: updated });
        } catch (err) {
            console.error(err);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                error: 'Failed to update product' 
            });
        }
    })

    // Category

    app.get('/categories', async (req, res) => {
        const allCategories = await categoriesRepo.find();
        res.send({
            categories: allCategories
        })
    })

    // Orders
    
    app.get('/orders', async (req, res) => {
        const allOrders = await ordersRepo.find();
        res.send({
            orders: allOrders
        })
    })

    
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
            
            if (!Array.isArray(orderProducts) || OrderProductlength === 0) {
                return res.status(StatusCodes.BAD_REQUEST).send({   
                    message: 'order'
        } catch (err) {
            console.error(err);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Failed to create order' });
        }
    })
    
    app.get('/orders/status/:id', async (req, res) => {
        const orderList = await ordersRepo.find({
            where: { orderStatus: { id: parseInt(req.params.id) } }
        })
        res.send({ orders: orderList });
    })

    // Do skończenia !!!!!!!!!!!
    app.patch('/orders/status/:id', async (req, res) => {
        try {
            const { username, email, phone_number, statusId, items } = req.body;

            // Basic validation
            if (!username || !email || !phone_number || !statusId || !Array.isArray(items) || items.length === 0) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'Missing required fields: username, email, phone_number, statusId, items[]'
                });
            }

            // Validate status
            const statusIdNum = Number(statusId);
            if (Number.isNaN(statusIdNum)) {
                return res.status(StatusCodes.BAD_REQUEST).send({ message: 'statusId must be a number' });
            }
            const orderStatus = await orderStatusRepo.findOne({ where: { id: statusIdNum } });
            if (!orderStatus) {
                return res.status(StatusCodes.NOT_FOUND).send({ message: `OrderStatus id=${statusIdNum} not found` });
            }

            // Validate items and fetch products
            // Expect items: [{ productId: number, amount: number }]
            const normalizedItems = [];
            for (const item of items) {
                const productIdNum = Number(item?.productId);
                const amountNum = Number(item?.amount);
                if (Number.isNaN(productIdNum) || Number.isNaN(amountNum) || amountNum <= 0) {
                    return res.status(StatusCodes.BAD_REQUEST).send({
                        message: 'Each item must have valid productId (number) and amount (> 0)'
                    });
                }
                const product = await productsRepo.findOne({ where: { id: productIdNum } });
                if (!product) {
                    return res.status(StatusCodes.NOT_FOUND).send({ message: `Product id=${productIdNum} not found` });
                }
                normalizedItems.push({ product, amount: amountNum, unit_price: product.unit_price });
            }

            // Create order
            const order = new Order();
            order.username = username;
            order.email = email;
            order.phone_number = phone_number;
            order.orderStatus = orderStatus;
            // Leave confirmation_date undefined initially (can be set on status change)

            const savedOrder = await ordersRepo.save(order);

            // Create OrderProduct rows
            const orderProducts = normalizedItems.map(({ product, amount, unit_price }) => {
                const op = new OrderProduct();
                op.product = product;
                op.order = savedOrder;
                op.amount = amount;
                op.unit_price = unit_price; // snapshot of price at order time
                return op;
            });
            await orderProductsRepo.save(orderProducts);

            // Optionally, return order with items; simplest is echoing
            res.location(`/orders/${savedOrder.id}`);
            return res.status(StatusCodes.CREATED).send({
                order: {
                    ...savedOrder,
                    orderProducts: orderProducts.map(op => ({
                        id: op.id,
                        productId: op.product.id,
                        amount: op.amount,
                        unit_price: op.unit_price
                    }))
                }
            });
        } catch (err) {
            console.error(err);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Failed to create order' });
        }
    })      

    // Order Statuses
    app.get('/status', async (req, res) => {
        const allStatuses = await orderStatusRepo.find();
        res.send({
            statuses: allStatuses
        })
    })
}