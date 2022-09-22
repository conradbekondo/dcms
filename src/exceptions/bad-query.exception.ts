import { HttpException } from '@nestjs/common';

export class BadQueryParamsException extends HttpException {
  constructor(
    readonly queryMap: {
      [key: string]: string | number | symbol | object;
    } = {},
  ) {
    super('Bad or invalid query parameters provided', 400);
  }
}
