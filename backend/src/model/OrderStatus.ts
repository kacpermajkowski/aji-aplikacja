import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Order } from "./Order"

@Entity()
export class OrderStatus {
    constructor(name: string, id?: number) {
        if(id){
            if(!Number.isInteger(id) || id <= 0)
                throw TypeError("id must be an integer greater than 1");
            else
                this.id = id;
        }
            
        this.name = name;
    }

    @PrimaryGeneratedColumn()
    id!: number

    @Column({ unique: true })
    name!: string

    @OneToMany(() => Order, (order) => order.orderStatus)
    orders!: Order[]
}