import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import { OrderStatus } from "./model/OrderStatus";

const app = express()
const port = 3000

// to initialize the initial connection with the database, register all entities
// and "synchronize" database schema, call "initialize()" method of a newly created database
// once in your application bootstrap
AppDataSource.initialize()
  .then(endpoints)
  .then(seedDatabase)
  .catch((error) => {
    console.log(error)
  });

async function seedDatabase() {
  const repo = AppDataSource.getRepository(OrderStatus);

  const statuses = [
    new OrderStatus("NIEZATWIERDZONE"),
    new OrderStatus("ZATWIERDZONE"),
    new OrderStatus("ANULOWANE"),
    new OrderStatus("ZREALIZOWANE")
  ]

  await statuses.forEach(status => repo.save(status))
}

function endpoints(){
  app.get('/products', (req, res) => {
    res.send('Hello World!3333')
    
  })

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
}