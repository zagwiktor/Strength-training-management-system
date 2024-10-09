import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "src/user/entities/user.entity";

@Entity()
@Unique(['name', 'author'])
export class ExerciseCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => User, (user) => user.exercisesCategories, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'author_id' })
    author: User;
}
