import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import { OrderStatus } from "./model/OrderStatus";
import { endpoints } from "./endpoints";
import 'dotenv/config';

const app = express()
const port = 3000

// to initialize the initial connection with the database, register all entities
// and "synchronize" database schema, call "initialize()" method of a newly created database
// once in your application bootstrap
AppDataSource.initialize()
  .then(initializeOrderStatuses)
  .then(() => endpoints(app))
  .then(startListening)
  .catch((error) => {
    console.log(error)
  });

async function initializeOrderStatuses() {
  const repo = AppDataSource.getRepository(OrderStatus);

  const statuses = [
    new OrderStatus("NIEZATWIERDZONE", 1),
    new OrderStatus("ANULOWANE", 2),
    new OrderStatus("ZATWIERDZONE", 3),
    new OrderStatus("ZREALIZOWANE", 4)
  ]

  await statuses.forEach(async status => {
    const existing = await repo.findOne({ where: { name: status.name } });
    if(!existing)
      repo.save(status);
  })
}

function startListening(){
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
}

