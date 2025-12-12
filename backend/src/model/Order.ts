import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import type { Product } from "./Product"
import { OrderProduct } from "./OrderProduct"
import { OrderStatus } from "./OrderStatus"
import { Opinion } from "./Opinion"

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: "timestamptz", nullable: true })
    confirmation_date?: Date

    @Column()
    username!: string

    @Column()
    email!: string

    @Column()
    phone_number!: string

    @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order)
    orderProducts!: OrderProduct[]

    @ManyToOne(() => OrderStatus, (orderStatus) => orderStatus.orders, { nullable: false })
    orderStatus!: OrderStatus

    @OneToOne(() => Opinion, (opinion) => opinion.order)
    opinion?: Opinion
}