import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Exclude } from 'class-transformer';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    surname: string;

    @Column()
    @Exclude()
    password: string;

    @Column()
    email: string;

    @Column()
    weight: number;

    @Column()
    height: number;

    @Column()
    gender: "Male" | "Female";
}