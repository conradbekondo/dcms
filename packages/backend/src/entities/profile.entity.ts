import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('profiles')
export class Profile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;
    @Column()
    lastName: string;
    @Column()
    phoneNumber: string;
    @Column()
    natId: string;
    @Column()
    gender: boolean;
    @Column()
    notes: string;
    @Column()
    address: string;
}