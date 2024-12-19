import { Exercise } from "src/exercise/entities/exercise.entity";
import { Raport } from "src/raport/entities/raport.entity";
import { TrainingUnit } from "src/training-unit/entities/training-unit.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";


@Entity()
@Unique(['name', 'author'])
export class TrainingPlan {
    @PrimaryGeneratedColumn()
    id: number; 

    @ManyToOne(() => User, (user) => user.traningPlans, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'author_id' })
    author: User;

    @ManyToMany(() => TrainingUnit, (trainingUnit) => trainingUnit.trainingPlan, {onDelete: 'CASCADE'})
    @JoinTable({name: 'training-units-plans'})
    trainingUnits: TrainingUnit[];
    
    @Column()
    name: string;

    @Column()
    description?: string; 

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
      })
    dateCreated: Date;

    @OneToMany(() => Raport,(raports)=>raports.trainingPlan)
    raports: Raport[];

    @Column()
    mainPlan: boolean;
}
