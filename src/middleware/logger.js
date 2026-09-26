import PinoHttp from 'pino-http';

const logger = PinoHttp({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid, hostname',
      messageFormat:
        '{req.method} {req.url} {req.statusCode} - {responseTime}ms',
      hideObject: true,
    },
  },
});

export { logger };
