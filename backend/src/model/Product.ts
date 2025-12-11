import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Category } from "./Category"
import { OrderProduct } from "./OrderProduct"

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id!: number
    
    @Column()
    name!: string

    @Column("text")
    description!: string

    @Column("real")
    unit_price!: number

    @Column("real")
    weight!: number

    @ManyToOne(() => Category, (category) => category.products, { nullable: false })
    category!: Category

    @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.product)
    orderProducts!: OrderProduct
}



