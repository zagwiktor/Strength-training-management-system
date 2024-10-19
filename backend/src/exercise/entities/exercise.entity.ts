import { ExerciseCategory } from "src/exercise-category/entities/exercise-category.entity";
import { TrainingPlan } from "src/training-plan/entities/training-plan.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Exercise {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    sets: number;

    @Column()
    reps: number;

    @Column('json')
    tempo: [eccentricPhase: number, ePause: number, concentricPhases: number, cPause: number];

    @Column()
    load: number;

    @ManyToMany(() => ExerciseCategory, (categories) => categories.exercises ,{onDelete: "SET NULL"})
    @JoinTable({name: 'exercises_categories'})
    categories: ExerciseCategory[];

    @ManyToMany(() => ExerciseCategory, (categories) => categories.exercises ,{onDelete: "SET NULL"})
    @JoinTable({name: 'exercises_traning_plans'})
    traningPlans: TrainingPlan[];


    @ManyToOne(() => User, (user) => user.exercises, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'author_id' })
    author: User;
}
