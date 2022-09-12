import { Column, Entity, JoinTable, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { ActivityOperation } from "./activity-operation";
import { Permission } from "./permission.entity";


@Entity('user_activity_tracking')
export class UserActivity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    timestamp: Date;

    @Column()
    description: string;

    @Column()
    operation: ActivityOperation;

    @Column()
    targetId?: number;

    @Column()
    targetTable?: string;

    @ManyToOne(() => Permission)
    @JoinTable({ name: 'permission_used' })
    permissionUsed: Promise<Permission>;
}