import { Express } from "express";
import { AppDataSource } from "data-source";
import { Product } from "model/Product";
import { Category } from "model/Category";

const productsRepo = AppDataSource.getRepository(Product);
const categoriesRepo = AppDataSource.getRepository(Category);

export default function addNewOrder(app: Express){
    app.get('/categories', async (req, res) => {
        const allCategories = await categoriesRepo.find();
        res.send({
            categories: allCategories
        })
    })
}