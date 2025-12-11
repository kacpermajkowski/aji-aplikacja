import { Express } from "express";
import { AppDataSource } from "data-source";
import { Product } from "model/Product";

const productsRepo = AppDataSource.getRepository(Product);

export default function getSpecificProduct(app: Express){
    app.get('/products/:id', async (req, res) => {
        const productList = await productsRepo.findBy({ id: parseInt(req.params.id) });
        res.send({ products: productList });
    })
}