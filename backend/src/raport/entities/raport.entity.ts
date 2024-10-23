import { IsDate } from "class-validator";
import { TrainingPlan } from "src/training-plan/entities/training-plan.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Raport{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })

    @IsDate()
    dateCreated: Date;

    @ManyToOne(() => TrainingPlan, (traningPlan) => traningPlan.raports, {onDelete: 'CASCADE'})
    @JoinColumn({ name: 'traning_plan_id' })
    trainingPlan: TrainingPlan;

    @ManyToOne(() => User, (user) => user.raports, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'author_id' })
    author: User;

    @Column()
    weight: number;

    @Column()
    chestCircuit: number;
    
    @Column()
    bicepsCircuit: number;
    
    @Column()
    thighCircuit: number;
    
    @Column()
    waistCircuit: number;
    
    @Column()
    calfCircuit: number;

    @Column("int", { array: true })
    loads: number[];
}
