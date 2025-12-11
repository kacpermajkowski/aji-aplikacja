import { Express } from "express";
import { AppDataSource } from "data-source";
import { Product } from "model/Product";
import { StatusCodes } from "http-status-codes";
import { Category } from "model/Category";

const productsRepo = AppDataSource.getRepository(Product);
const categoriesRepo = AppDataSource.getRepository(Category);

export default function addNewProduct(app: Express){
    app.post('/products', async (req, res) => {
        try {
            const { name, description, unit_price, weight, categoryId } = req.body;

            // unit_price can be 0 at this validation stage
            // so for now we check if it's undefined
            // because negating 0 would yield 'true' which would
            // trigger the error message incorrectly
            if (!name || !description || unit_price === undefined || weight === undefined || !categoryId) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'Missing required fields: name, description, weight, unit_price, categoryId'
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
            const parsedWeight = Number(weight);
            if (Number.isNaN(parsedUnitPrice) || Number.isNaN(parsedCategoryId) || Number.isNaN(parsedWeight)) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'unit_price, weight and categoryId must be numbers'
                });
            }

            if (!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'categoryId must be an integer greater than 0'
                });
            }

            if (parsedUnitPrice <= 0 || parsedWeight <= 0) {
                return res.status(StatusCodes.BAD_REQUEST).send({
                    message: 'unit_price and weight must be greater than 0'
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
            product.weight = parsedWeight;

            const saved = await productsRepo.save(product);
            return res.status(StatusCodes.CREATED).send({ product: saved });
        } catch (err) {
            console.error(err);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                error: 'Failed to create product'
            });
        }
    })
}