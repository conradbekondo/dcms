import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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

    constructor(datasource: DataSource, private readonly jwtService: JwtService) {
        this.principalSubject = new BehaviorSubject<IPrincipal>(null);
        this.userRepository = datasource.getRepository(User);
        this.userLoginRepository = datasource.getRepository(LoginEntry);
        this.profileRepository = datasource.getRepository(Profile);
        this.roleRepository = datasource.getRepository(Role);
        if (process.env.NODE_ENV == 'development') {
            // this.seed();
        }
    }


    private async seed() {
        hash('passwordAdmin123', 12).then(async password => {
            let adminRole = new Role();
            let staffRole = new Role();
            let systemRole = new Role();

            adminRole.roleName = Roles.ADMIN;
            staffRole.roleName = Roles.STAFF;
            systemRole.roleName = Roles.SYSTEM;

            await this.roleRepository.save([adminRole, staffRole, systemRole]);

            let systemProfile = new Profile();
            systemProfile.firstName = 'System';
            systemProfile.gender = Gender.UNKNOWN;
            systemProfile.phoneNumber = 'n/a';
            systemProfile.natId = 'n/a';

            systemProfile = await this.profileRepository.save(systemProfile);

            let systemUser = new User();
            systemUser.username = 'system';
            systemUser.passwordHash = password;
            systemUser.profileId = systemProfile.id;
            systemUser.roles = [systemRole];
            systemUser.profile = systemProfile;

            await this.userRepository.save(systemUser);
        });
    }

    set principal(principal: IPrincipal) {
        this.principalSubject.next(principal);
    }

    get principal$() {
        return this.principalSubject.asObservable();
    }

    async getUser(arg: IPrincipal | number | string) {
        switch (typeof arg) {
            case 'string':
                return this.userRepository.findOneBy({ username: arg });
            case 'number':
                return this.userRepository.findOneBy({ id: arg });
            case 'object':
            default:
                return this.userRepository.findOneBy({ username: arg.username });
        }
    }

    async loginUser(dto: ILoginDto) {
        const user = await this.userRepository.findOneBy({ isDeleted: false, username: dto.username });
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
        const roles = user.roles;
        const principal: IPrincipal = {
            displayName: `${profile.firstName} ${profile.lastName || ''}`.trim(),
            loginTime: loginEntry.dateCreated,
            username,
            roles: [...(roles.map(role => role.roleName))]
        };
        this.logger.log(`Successful login by '${principal.displayName}'`);
        this.principal = principal;
        this.logger.debug('Updated principal');

        return { success: true, error: '', jwtToken: this.jwtService.sign(JSON.stringify(principal)) };
    }
}
