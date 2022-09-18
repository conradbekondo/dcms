import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpStatus, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import { INewUserDto } from 'src/dto/new-user.dto';
import injectionTokenKeys from 'src/injection-tokens';
import { UsersService } from 'src/services/users/users.service';

@Catch(BadRequestException)
export class CreateUserFailedFilter<T> implements ExceptionFilter {
  constructor(private userService: UsersService, @Inject(injectionTokenKeys.appName) private appName: string) { }
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const messages = (exception.getResponse() as { message: string[] }).message;
    const dto = host.switchToHttp().getRequest<Request>().body;
    response.status(HttpStatus.BAD_REQUEST).json({ messages, dto });
  }
}
