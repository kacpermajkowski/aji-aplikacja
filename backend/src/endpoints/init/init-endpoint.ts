import { Express } from "express";
import { StatusCodes } from "http-status-codes";
import { AppDataSource } from "data-source";
import { Product } from "model/Product";
import { Category } from "model/Category";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
export function initEndpoints(app: Express) {

  const productsRepo = AppDataSource.getRepository(Product);
  const categoriesRepo = AppDataSource.getRepository(Category);

  app.post("/init", upload.single("file"), async (req, res) => {
    try {
      const count = await productsRepo.count();
      if (count > 0) {
        return res
          .status(StatusCodes.CONFLICT)
          .send({ message: "Products already exist in database" });
      }
      if (!req.file) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send({ message: "No file uploaded" });
      }
      let productsData;
      try {
        productsData = JSON.parse(req.file.buffer.toString());
      } catch (e) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send({ message: "Invalid products data" });
      }
      let productsArray = productsData.products;
      if (!Array.isArray(productsArray) || productsArray.length === 0) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send({ message: "Products data must be a non-empty array" });
      }
      for (const item of productsArray) {
        const { name, description, unit_price, weight, category } = item;
        if (!name || !description || !unit_price || !weight || !category)
          return res
            .status(StatusCodes.BAD_REQUEST)
            .send({ message: "Invalid product data in JSON file" });
        const cat = await categoriesRepo.findOne({ where: { id: parseInt(category) } });
        if (!cat) {
          return res
            .status(StatusCodes.NOT_FOUND)
            .send({ message: 'Category "${category}" not found' });
        }
        const product = new Product();
        product.name = name;
        product.description = description;
        product.unit_price = Number(unit_price);
        product.weight = Number(weight);
        product.category = cat;
        await productsRepo.save(product);
      }
      return res
        .status(StatusCodes.OK)
        .send({
          message: "Products initialized successfully",
          count: productsData.length,
        });
    } catch (err) {
      console.error(err);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ error: "Failed to initialize products" });
    }
  });
}
