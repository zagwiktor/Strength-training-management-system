import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "src/user/entities/user.entity";
import { Exercise } from "src/exercise/entities/exercise.entity";

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

    @ManyToMany(() => Exercise, (exercise) => exercise.categories)
    exercises: Exercise[];
}
