
import { AppDataSource } from "data-source";
import { Product } from "model/Product";
import { Express } from "express";
import { StatusCodes } from "http-status-codes";
import generateSEODescription from "llm";

export default function getSeoDescription(app: Express) {
    const productsRepo = AppDataSource.getRepository(Product);


    app.get('/products/:id/seo-description', async (req, res) => {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                message: 'Invalid product ID'
            });
        }

        const product = await productsRepo.findOne({
            where: { id },
            relations: ["category"]
        });

        if (!product) {
            return res.status(StatusCodes.NOT_FOUND).send({
                message: 'Product not found'
            });
        }

        try {
            const seoHtml = await generateSEODescription({
                name: product.name,
                description: product.description,
                unit_price: product.unit_price,
                weight: product.weight,
                category: product.category.name
            });

            return res.send(seoHtml);
        }
        catch (error) {
            console.error('Error generating SEO description:', error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                message: 'Failed to generate SEO description'
            });
        }
    });
}