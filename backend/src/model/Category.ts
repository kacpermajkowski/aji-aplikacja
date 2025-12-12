import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Product } from "./Product"

@Entity()
export class Category {
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

    @Column()
    name!: string

    @OneToMany(() => Product, (product) => product.category)
    products!: Product
}