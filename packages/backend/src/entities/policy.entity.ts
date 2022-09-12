import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('policies')
export class Policy {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    pricePercentage: number;
}