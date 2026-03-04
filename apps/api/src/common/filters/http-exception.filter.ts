import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null && 'message' in res) {
        const msg = (res as { message: string | string[] }).message;
        message = Array.isArray(msg) ? msg[0] ?? '오류가 발생했습니다' : msg;
      } else {
        message = '오류가 발생했습니다';
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = '서버 오류가 발생했습니다';
      this.logger.error('Unhandled exception', exception);
    }

    if (status >= 500 && process.env.SENTRY_DSN) {
      Sentry.captureException(exception, {
        extra: { path: request.url, method: request.method, status },
      });
    }

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
    });
  }
}
