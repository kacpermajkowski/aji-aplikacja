import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import { OrderStatus } from "./model/OrderStatus";
import { endpoints } from "./endpoints";
import 'dotenv/config';
import { Category } from "model/Category";

const app = express()
const port = 3000

// to initialize the initial connection with the database, register all entities
// and "synchronize" database schema, call "initialize()" method of a newly created database
// once in your application bootstrap
AppDataSource.initialize()
  .then(initializeFixedDbData)
  .then(() => app.use(express.json()))
  .then(() => endpoints(app))
  .then(startListening)
  .catch((error) => {
    console.log(error)
  });

async function initializeFixedDbData() {
  const statusRepo = AppDataSource.getRepository(OrderStatus);

  const statuses = [
    new OrderStatus("NIEZATWIERDZONE", 1),
    new OrderStatus("ANULOWANE", 2),
    new OrderStatus("ZATWIERDZONE", 3),
    new OrderStatus("ZREALIZOWANE", 4)
  ]

  await statuses.forEach(async status => {
    const existing = await statusRepo.findOne({ where: { name: status.name } });
    if(!existing)
      statusRepo.save(status);
  })

  const categoryRepo = AppDataSource.getRepository(Category);

  const categories = [
    new Category('higieniczne', 1),
    new Category('dla zwierząt', 2),
    new Category('spożywcze', 3),
    new Category('elektronika', 4),
  ]

  await categories.forEach(async category => {
    const existing = await categoryRepo.findOne({ where: { name: category.name } });
    if(!existing)
      categoryRepo.save(category);
  })
}

function startListening(){
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
}

