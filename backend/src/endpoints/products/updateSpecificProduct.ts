import { Express } from "express";
import { AppDataSource } from "data-source";
import { Product } from "model/Product";
import { StatusCodes } from "http-status-codes";
import { Category } from "model/Category";

const productsRepo = AppDataSource.getRepository(Product);
const categoriesRepo = AppDataSource.getRepository(Category);

export default function updateSpecificProduct(app: Express){
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

            const { name, description, unit_price, weight, categoryId } = req.body;
            if (name !== undefined) {
                if (typeof name !== 'string' || name.length == 0) {
                    return res.status(StatusCodes.BAD_REQUEST).send({
                        message: 'name must be a non-empty string'
                    });
                }
                product.name = name;
            }
            if (description !== undefined) {
                if (typeof description !== 'string' || description.length == 0) {
                    return res.status(StatusCodes.BAD_REQUEST).send({
                        message: 'description must be a non-empty string'
                    });
                }
                product.description = description;
            }
            if (unit_price !== undefined) {
                const parsedUnitPrice = Number(unit_price);
                if (Number.isNaN(parsedUnitPrice) || parsedUnitPrice <= 0) {
                    return res.status(StatusCodes.BAD_REQUEST).send({
                        message: 'unit_price must be a number greater than 0'
                    });
                }
                product.unit_price = parsedUnitPrice;
            }
            if (weight !== undefined) {
                const parsedWeight = Number(weight);
                if (Number.isNaN(parsedWeight) || parsedWeight <= 0) {
                    return res.status(StatusCodes.BAD_REQUEST).send({
                        message: 'weight must be a number greater than 0'
                    });
                }
                product.weight = parsedWeight;
            }
            if (categoryId !== undefined) {
                const parsedCategoryId = Number(categoryId);
                if (Number.isNaN(parsedCategoryId) || !Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
                    return res.status(StatusCodes.BAD_REQUEST).send({
                        message: 'categoryId must be a positive integer'
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
            const saved = await productsRepo.save(product);
            return res.status(StatusCodes.OK).send({ product: saved });
        } catch (err) {
            console.error(err);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                error: 'Failed to update product'
            });
        }
    })

}