import { ExerciseCategory } from "src/exercise-category/entities/exercise-category.entity";
import { TrainingPlan } from "src/training-plan/entities/training-plan.entity";
import { TrainingUnit } from "src/training-unit/entities/training-unit.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(['name', 'author'])
export class Exercise {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({nullable: true})
    description?: string;

    @Column()
    sets: number;

    @Column()
    reps: number;

    @Column('json', {nullable: true})
    tempo?: [eccentricPhase: number, ePause: number, concentricPhases: number, cPause: number];

    @Column({nullable: true})
    load?: number;

    @ManyToMany(() => ExerciseCategory, (categories) => categories.exercises ,{onDelete: 'CASCADE'})
    @JoinTable({name: 'exercises_categories'})
    categories: ExerciseCategory[];

    @ManyToMany(() => TrainingUnit, (trainingUnit) => trainingUnit.exercises ,{onDelete: 'CASCADE'})
    trainingUnits: TrainingPlan[];

    @ManyToOne(() => User, (user) => user.exercises, {onDelete: 'CASCADE'})
    @JoinColumn({ name: 'author_id' })
    author: User;
}
