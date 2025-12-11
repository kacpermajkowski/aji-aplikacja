import { Express } from "express";
import { AppDataSource } from "data-source";
import { Category } from "model/Category";

const categoriesRepo = AppDataSource.getRepository(Category);

export default function getAllCategories(app: Express){
    app.get('/categories', async (req, res) => {
        const allCategories = await categoriesRepo.find();
        res.send({
            categories: allCategories
        })
    })
}