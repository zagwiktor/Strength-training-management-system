import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(['name', 'author'])
export class Diet {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    calories: number;

    @Column()
    protein: number;

    @Column()
    fat: number;

    @Column()
    carbohydrates: number;

    @ManyToOne(() => User, (user) => user.diet, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'author_id' })
    author: User;

}
