import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Order } from "./Order"

@Entity()
export class OrderStatus {
    constructor(name: string) {
        this.name = name
    }

    @PrimaryGeneratedColumn()
    id!: number

    @Column({ unique: true })
    name!: string

    @OneToMany(() => Order, (order) => order.orderStatus)
    orders!: Order[]
}