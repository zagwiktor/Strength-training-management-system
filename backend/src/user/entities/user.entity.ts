import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Exclude } from 'class-transformer';
import { ExerciseCategory } from "src/exercise-category/entities/exercise-category.entity";
import { Exercise } from "src/exercise/entities/exercise.entity";
import { Diet } from "src/diet/entities/diet.entity";
import { TrainingPlan } from "src/training-plan/entities/training-plan.entity";
import { Raport } from "src/raport/entities/raport.entity";

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
    age: number;

    @Column()
    gender: "Male" | "Female";

    @OneToMany(() => ExerciseCategory, (exerciseCategory) => exerciseCategory.author)
    exercisesCategories: ExerciseCategory[];

    @OneToMany(() => Exercise, (exercises) => exercises.author)
    exercises: Exercise[];

    @OneToMany(() => Diet, (diet) => diet.author)
    diet: Diet[];

    @OneToMany(() => TrainingPlan, (traningPlan) => traningPlan.author)
    traningPlans: TrainingPlan[];

    @OneToMany(() => Raport, (raport) => raport.author)
    raports: Raport[];

}