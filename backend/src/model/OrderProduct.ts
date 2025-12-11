import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Category } from "./Category"
import { Product } from "./Product"
import { Order } from "./Order"

@Entity()
export class OrderProduct {
    @PrimaryGeneratedColumn()
    id!: number

    @Column("real")
    unit_price!: number

    @Column()
    amount!: number

    @ManyToOne(() => Product, (product) => product.orderProducts, { nullable: false })
    product!: Product

    @ManyToOne(() => Order, (order) => order.orderProducts, { nullable: false })
    order!: Order
}



