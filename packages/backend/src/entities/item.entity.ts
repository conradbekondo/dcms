import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('item_types')
export class Item {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    notes: string;
}