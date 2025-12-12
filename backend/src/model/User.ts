import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export type UserRole = 'KLIENT' | 'PRACOWNIK' ;

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    login!: string;

    @Column()
    passwordHash!: string;

    @Column({
        type: "varchar"
    })
    role!: UserRole;
}