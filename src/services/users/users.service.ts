import { Injectable, Logger } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { BehaviorSubject } from 'rxjs';
import { ILoginDto } from 'src/dto/login.dto';
import { Gender, Profile } from 'src/entities/profile.entity';
import { Role } from 'src/entities/Role';
import { Roles } from 'src/entities/roles';
import { LoginEntry } from 'src/entities/user-login-entry.entity';
import { User } from 'src/entities/user.entity';
import { IPrincipal } from 'src/models/principal.model';
import { DataSource, Repository } from 'typeorm';
@Injectable()
export class UsersService {
    private readonly userRepository: Repository<User>;
    private readonly userLoginRepository: Repository<LoginEntry>;
    private readonly principalSubject: BehaviorSubject<IPrincipal>;
    private readonly logger = new Logger(UsersService.name);
    private readonly profileRepository: Repository<Profile>;
    private readonly roleRepository: Repository<Role>;

    constructor (datasource: DataSource) {
        this.principalSubject = new BehaviorSubject<IPrincipal>(null);
        this.userRepository = datasource.getRepository(User);
        this.userLoginRepository = datasource.getRepository(LoginEntry);
        this.profileRepository = datasource.getRepository(Profile);
        this.roleRepository = datasource.getRepository(Role);
        if (process.env.NODE_ENV == 'development') {
            this.seed();
        }
    }

    private async seed() {
        hash('password123', 12).then(async password => {
            let adminRole = new Role();
            let staffRole = new Role();

            adminRole.roleName = Roles.ADMIN;
            staffRole.roleName = Roles.STAFF;

            await this.roleRepository.save([adminRole, staffRole]);

            let adminProfile = new Profile();
            adminProfile.firstName = 'Conrad';
            adminProfile.lastName = 'Bekondo';
            adminProfile.gender = Gender.MALE;
            adminProfile.phoneNumber = '654020651';
            adminProfile.natId = '000175124';

            adminProfile = await this.profileRepository.save(adminProfile);

            let adminUser = new User();
            adminUser.username = 'conrad';
            adminUser.passwordHash = password;
            adminUser.profileId = adminProfile.id;
            adminUser.roles = [adminRole];
            adminUser.profile = adminProfile;

            adminUser = await this.userRepository.save(adminUser);
        });
    }

    private set principal(principal: IPrincipal) {
        this.principalSubject.next(principal);
    }

    get principal$() {
        return this.principalSubject.asObservable();
    }

    async loginUser(dto: ILoginDto) {
        const user = await this.userRepository.findOneBy({ username: dto.username });
        if (!user) {
            this.logger.warn(`Failed login attempt - Account not found - Attempt credentials: { username: '${dto.username}', password: '${dto.password}' }`)
            return { success: false, error: 'Account not found with username: ' + dto.username };
        }
        const { profile, username } = user;

        const verificationResult = await compare(dto.password, user.passwordHash);
        if (!verificationResult) {
            this.logger.warn(`Invalid login credentials provided for: '${profile.firstName} ${profile.lastName?.trim() || ''}'`.trim());
            return { success: false, error: 'Invalid username or password' };
        }

        let loginEntry = new LoginEntry();
        loginEntry.userId = user.id;

        loginEntry = await this.userLoginRepository.save(loginEntry);
        const roles = await user.roles;
        const principal: IPrincipal = {
            displayName: `${profile.firstName} ${profile.lastName || ''}`.trim(),
            loginTime: loginEntry.dateCreated,
            username,
            roles: [...(roles.map(role => role.roleName))]
        };
        this.logger.log(`Successful login at ${principal.loginTime} by ${principal.displayName}`);
        this.principal = principal;
        this.logger.debug('Updated principal');

        return { success: true, error: '' };
    }
}
