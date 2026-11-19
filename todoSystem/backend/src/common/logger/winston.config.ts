import { WinstonModule, utilities } from "nest-winston";
import * as winston from "winston";
import "winston-daily-rotate-file";

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp(),
  utilities.format.nestLike("TodoSystem", { prettyPrint: true }),
);

const appFile = new winston.transports.DailyRotateFile({
  level: "debug",
  dirname: "logs",
  filename: "app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
});

const errorFile = new winston.transports.DailyRotateFile({
  level: "error",
  dirname: "logs",
  filename: "error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxFiles: "30d",
});

export const winstonConfig = WinstonModule.forRoot({
  format: fileFormat,
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    appFile,
    errorFile,
  ],
});
