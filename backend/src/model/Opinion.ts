import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Check, JoinColumn } from "typeorm"
import { OrderProduct } from "./OrderProduct"
import { OrderStatus } from "./OrderStatus"
import { Order } from "./Order"

@Entity()
export class Opinion {
    @PrimaryGeneratedColumn()
    id!: number

    @Check(
        'CHK_opinion_rating',
        '"rating" BETWEEN 1 AND 5'
    )
    @Column()
    rating!: number

    @Column()
    content!: string

    @Column()
    opinion_date!: Date

    @OneToOne(() => Order)
    @JoinColumn()
    order!: Order
}