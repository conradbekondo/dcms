import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('services')
export class OfferedService {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    pricePercentage: number;
}