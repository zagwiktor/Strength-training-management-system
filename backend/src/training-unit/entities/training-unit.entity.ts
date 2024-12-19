import { Exercise } from "src/exercise/entities/exercise.entity";
import { TrainingPlan } from "src/training-plan/entities/training-plan.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TrainingUnit {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string; 

    @Column({ nullable: true })
    description?: string; 

    @ManyToMany(() => TrainingPlan, (plan) => plan.trainingUnits, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'training_plan_id' })
    trainingPlan: TrainingPlan; 

    @ManyToMany(() => Exercise, (exercise) => exercise.trainingUnits, { cascade: true })
    @JoinTable({ name: 'training_unit_exercises' })
    exercises: Exercise[];

    @Column({ type: 'jsonb'})
    orderedExercises: { order: number; pkOfExercise: number }[];
    
    @ManyToOne(() => User, (user) => user.trainingUnits, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'author_id' })
    author: User;
}
