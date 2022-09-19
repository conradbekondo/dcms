import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { BehaviorSubject, startWith } from 'rxjs';
import { ILoginDto } from 'src/dto/login.dto';
import { INewUserDto } from 'src/dto/new-user.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { Gender, Profile } from 'src/entities/profile.entity';
import { Role } from 'src/entities/Role';
import { Roles } from 'src/entities/roles';
import { LoginEntry } from 'src/entities/user-login-entry.entity';
import { User } from 'src/entities/user.entity';
import { IPrincipal } from 'src/models/principal.model';
import { DataSource, FindOptionsSelect, Repository } from 'typeorm';

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

    this.principalSubject.subscribe(p => {
      if (!p) return;
      this.logger.debug('Principal updated => ' + JSON.stringify(p));
    })
  }

  private async seed() {
    hash('passwordAdmin123', 12).then(async (password) => {
      const adminRole = new Role();
      const staffRole = new Role();
      const systemRole = new Role();

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

      const systemUser = new User();
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

  getPrincipal(): IPrincipal | null {
    return this.principalSubject.getValue();
  }

  get principal$() {
    return this.principalSubject.pipe(startWith(this.principalSubject.getValue()));
  }

  async isUserInRoles(roleNames: string[], username: string) {
    return this.userRepository.findOne({
      relations: { roles: true },
      where: { username },
      select: { roles: { roleName: true } }
    }).then(user => {
      for (let roleName of roleNames) {
        if (user.roles.some(role => role.roleName === roleName))
          return true;
      }
      return false;
    });
  }

  async getUser(arg: IPrincipal | number | string) {
    let user: User;
    switch (typeof arg) {
      case 'string':
        user = await this.userRepository.findOneBy({ username: arg });
        break;
      case 'number':
        user = await this.userRepository.findOneBy({ id: arg });
        break;
      case 'object':
        user = await this.userRepository.findOneBy({ username: arg.username });
        break;
      default:
        const msg = `Could not find user`;
        this.logger.error(msg);
        throw new Error(msg);
    }
    return user;
  }


  async loginUser(dto: ILoginDto) {
    const user = await this.userRepository.findOneBy({
      username: dto.username,
    });
    if (!user) {
      this.logger.warn(
        `Failed login attempt - Account not found - Attempt credentials: { username: '${dto.username}', password: '${dto.password}' }`,
      );
      return {
        success: false,
        error: 'Account not found with username: ' + dto.username,
      };
    }
    const { profile, username } = user;

    const verificationResult = await compare(dto.password, user.passwordHash);
    if (!verificationResult) {
      this.logger.warn(
        `Invalid login credentials provided for: '${profile.firstName} ${profile.lastName?.trim() || ''
          }'`.trim(),
      );
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
      roles: [...roles.map((role) => role.roleName)],
    };
    this.logger.log(`Successful login by '${principal.displayName}'`);
    this.principal = principal;
    this.logger.debug('Updated principal');

    return {
      success: true,
      error: '',
      jwtToken: this.jwtService.sign(JSON.stringify(principal)),
    };
  }

  async createUser(dto: INewUserDto) {
    const existingUser = await this.userRepository.findOneBy({
      username: dto.username,
    });
    if (existingUser) {
      const msg = `A user with username: ${dto.username} already exists!`;
      this.logger.error(msg);
      throw new Error(msg);
    }

    let user = new User();
    let profile = new Profile();
    profile.firstName = dto.firstName;
    profile.lastName = dto.lastName;
    profile.phoneNumber = dto.phoneNumber;
    profile.gender = parseInt(`${dto.gender}`) as Gender;
    profile.notes = dto.notes;
    profile.natId = dto.natId;

    profile = await this.profileRepository.save(profile);

    const currentUser = await this.getUser(this.getPrincipal());
    user.username = dto.username;
    user.creator = currentUser;
    const _hash = await hash(dto.password, 12);
    user.passwordHash = _hash;
    if (!(Object.values(Roles).map(x => x.toString()).includes(dto.role))) {
      const msg = `Role: ${dto.role} is not a valid role in the system`;
      this.logger.error(msg);
      throw new Error(msg);
    }

    user.profile = profile;
    const role = await this.roleRepository.findOneBy({ roleName: dto.role });
    user.roles = [role];

    user = await this.userRepository.save(user);;
    let msg: string;
    if (user.id) {
      msg = `${dto.firstName} ${dto.lastName || ''} account & profile created successfully`;
      this.logger.debug(msg);
      return { success: true, message: msg };
    } else {
      msg = `Could not create user: '${dto.firstName} ${dto.lastName || ''}'`;
      return { success: false, message: msg };
    }
  }

  /**
   * Get clients index.
   *
   * @returns
   */
  async getUsers(startAt: number = 0, size: number = 50, select?: FindOptionsSelect<User>) {
    const users = await this.userRepository.find({
      relations: {
        profile: true,
        creator: true
      },
      order: {
        dateCreated: 'DESC',
        lastUpdated: 'DESC'
      },
      select,
      skip: startAt * size,
      take: size
    });
    return users;
  }

  /**
   * Update the given client.
   *
   * @param dto New client data
   * @param id Client to update
   * @returns
   */
  async updateUser(dto: UpdateUserDto, id: number) {
    const user = await this.userRepository.findOneBy({ id: id });

    if (!user) {
      const msg = `No user found: ${id}`;
      this.logger.error(msg);
      throw new Error(msg);
    }

    const { profile, roles } = user;

    profile.firstName = dto.firstName;
    profile.phoneNumber = dto.phone;
    profile.lastName = dto.lastName;
    profile.address = dto.address;
    profile.gender = parseInt(dto.gender as '0' | '1');
    profile.natId = dto.natId;

    if (dto.role && !roles.every((r) => r.roleName !== dto.role)) {
      if (!(Object.values(Roles).map(r => r.toString()).every(r => r != dto.role))) {
        const msg = `Role: ${dto.role} is not a valid role in the system`;
        this.logger.error(msg);
        throw new Error(msg);
      }

      const role = await this.roleRepository.findOneBy({ roleName: dto.role });
      role.roleName = role.roleName;
      user.roles = [role];
    }

    await this.userRepository.save(user);
    this.logger.log(`Client with ID #${user.id} updated`);

    return { success: true, user: user };
  }

  /**
   * Delete the given client.
   *
   * @param id Client to delete
   * @returns
   */
  async deleteUser(id: number) {
    const user = await this.userRepository.findOneBy({ id: id });

    if (user) {
      await this.userRepository.remove(user);
      return { success: true };
    } else {
      const msg = "User doesn't exists";
      this.logger.error(msg);
      throw new Error(msg);
    }
  }
}
