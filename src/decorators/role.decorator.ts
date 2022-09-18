import { SetMetadata } from '@nestjs/common';
import { Roles } from 'src/entities/roles';

export const ROLE_KEY = 'role';
export const Role = (...args: Roles[]) => SetMetadata(ROLE_KEY, args);
