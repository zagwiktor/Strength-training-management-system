import { ExerciseCategory } from "src/exercise-category/entities/exercise-category.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";



@Entity()
export class Exercise {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    comment: string;

    @Column()
    sets: number;

    @Column()
    reps: number;

    @Column()
    tempo: [eccentricPhase: number, ePause: number, concentricPhases: number, cPause: number];

    @Column()
    load: number;

    @ManyToMany(() => ExerciseCategory, (exerciseCategory) => exerciseCategory.id, {onDelete: "SET NULL"})
    @JoinColumn({name: 'category_id'})
    category: ExerciseCategory[];

    @ManyToOne(() => User, (user) => user.exercises, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'author_id' })
    author: User;
}
