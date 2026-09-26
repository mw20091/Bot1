import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

const transport = pino.transport({
  target: 'pino-pretty',
  options: {
    colorize: isDev,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname'
  }
});

export const logger = isDev ? pino(transport) : pino();
