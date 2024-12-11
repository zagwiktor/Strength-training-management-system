import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
export class Diet {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    calories: number;

    @Column()
    protein: number;

    @Column()
    fat: number;

    @Column()
    carbohydrates: number;

    @OneToOne(() => User, (user) => user.diet, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'author_id' })
    author: User;

}
