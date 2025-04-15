import { HttpStatus } from '@nestjs/common';

export class BaseResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode: number;

  private constructor(
    success: boolean,
    message: string,
    data?: T,
    statusCode?: number,
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.statusCode =
      statusCode || (success ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
  }

  static success<T>(
    message: string = 'Operação realizada com sucesso',
    data?: T,
  ): BaseResponse<T> {
    return new BaseResponse(true, message, data, HttpStatus.OK);
  }

  static created<T>(
    message: string = 'Recurso criado com sucesso',
    data?: T,
  ): BaseResponse<T> {
    return new BaseResponse(true, message, data, HttpStatus.CREATED);
  }

  static error(
    message: string = 'Ocorreu um erro ao processar sua solicitação',
  ): BaseResponse {
    return new BaseResponse(false, message, null, HttpStatus.BAD_REQUEST);
  }

  static notFound(message: string = 'Recurso não encontrado'): BaseResponse {
    return new BaseResponse(false, message, null, HttpStatus.NOT_FOUND);
  }

  static unauthorized(message: string = 'Não autorizado'): BaseResponse {
    return new BaseResponse(false, message, null, HttpStatus.UNAUTHORIZED);
  }

  static forbidden(message: string = 'Acesso negado'): BaseResponse {
    return new BaseResponse(false, message, null, HttpStatus.FORBIDDEN);
  }

  static serverError(
    message: string = 'Erro interno do servidor',
  ): BaseResponse {
    return new BaseResponse(
      false,
      message,
      null,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
