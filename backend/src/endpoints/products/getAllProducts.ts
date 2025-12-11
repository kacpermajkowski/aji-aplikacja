import { Express } from "express";
import { AppDataSource } from "data-source";
import { Product } from "model/Product";

const productsRepo = AppDataSource.getRepository(Product);

export default function getAllProducts(app: Express){
    app.get('/products', async (req, res) => {
        const allProducts = await productsRepo.find();
        res.send({
            products: allProducts
        })
    })
}