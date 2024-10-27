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

    @Column('float')
    weight: number;

    @Column('float')
    chestCircuit: number;
    
    @Column('float')
    bicepsCircuit: number;
    
    @Column('float')
    thighCircuit: number;
    
    @Column('float')
    waistCircuit: number;
    
    @Column('float')
    calfCircuit: number;

    @Column({ type: 'jsonb', nullable: true })
    loads: Record<string, number>;
}
