import "reflect-metadata"
import { DataSource } from "typeorm"
import { Product } from "./model/Product"
import { Order } from "./model/Order"
import { Category } from "./model/Category"
import { OrderProduct } from "./model/OrderProduct"
import { OrderStatus } from "./model/OrderStatus"

const host: string = process.env.DATABASE_HOST ?? "localhost"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: host,
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "aji_db",
    entities: [Product, Order, Category, OrderProduct, OrderStatus],
    synchronize: true,
    logging: false,
})
