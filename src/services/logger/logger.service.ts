import { createLogger, format, transports } from 'winston';
const { combine, timestamp, json } = format;

type LogInput = { message: unknown; level: string };

const logger = createLogger({
  level: process.env.FOX_LOG_LEVEL || 'error',
  format: combine(timestamp(), json()),
  transports: [new transports.Console()],
});

const log = ({ message, level }: LogInput) => logger.log({ level, message: message as string });

export const debug = (message: unknown) => {
  log({ message, level: 'debug' });
};

export const info = (message: unknown) => {
  log({ message, level: 'info' });
};

export const warning = (message: unknown) => {
  log({ message, level: 'warn' });
};

export const error = (message: unknown) => {
  log({ message, level: 'error' });
};
