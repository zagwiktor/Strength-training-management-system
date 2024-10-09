import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Exclude } from 'class-transformer';
import { ExerciseCategory } from "src/exercise-category/entities/exercise-category.entity";
import { Exercise } from "src/exercise/entities/exercise.entity";

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
}