import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk'; 

export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    DATA = 'DATA',
    RESPONSE = 'RES',
    WARN = 'WARN', 
    ERROR = 'ERROR',
}

export class Logger {
    private logFilePath?: string;
    private verbosityLevel: number;

    /**
    * @param logFilePath – if specified, logs are also saved to this file
    * @param verbosityLevel – console verbosity level (0: Info/Warn/Error/RESPONSE, 1: Data, 2: Debug)
    */
    constructor(logFilePath?: string, verbosityLevel: number = 0) {
        this.logFilePath = logFilePath;
        this.verbosityLevel = verbosityLevel;
    }

    private async writeToFile(level: LogLevel, message: any, ...args: any[]): Promise<void> {
        if (!this.logFilePath) return;
        const timestamp = new Date().toISOString();
        const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
        const argsStr = args.length ? ' ' + JSON.stringify(args) : '';
        const logLine = `[${timestamp}] [${level}] ${messageStr}${argsStr}\n`;
        try {
            await fs.appendFile(this.logFilePath, logLine, 'utf-8');
        } catch (err) {
            console.error('Failed to write log to file:', err);
        }
    }


    private getLevelStyle(level: LogLevel): (text: string) => string {
        switch (level) {
            case LogLevel.DEBUG: return chalk.cyan;
            case LogLevel.INFO: return chalk.hex("FFA500");
            case LogLevel.DATA: return chalk.magenta;
            case LogLevel.RESPONSE: return chalk.green;
            case LogLevel.WARN: return chalk.yellow;
            case LogLevel.ERROR: return chalk.red;
            default: return chalk.white;
        }
    }

    private consoleLog(level: LogLevel, message: string, ...args: any[]): void {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] [${level}]`;
        const messageStr = typeof message === 'string' ? message : JSON.stringify(message);

        const print = () => {
            switch (level) {
                case LogLevel.DEBUG:
                    console.log(this.getLevelStyle(level)(prefix), this.getLevelStyle(level)(messageStr), ...args);
                    break;
                case LogLevel.INFO:
                    console.warn(this.getLevelStyle(level)(prefix), messageStr, ...args);
                    break;
                default:
                    console.error(this.getLevelStyle(level)(prefix), messageStr, ...args);
                    break;
            }
        };

        if (level === LogLevel.ERROR || level === LogLevel.WARN || level === LogLevel.INFO || level === LogLevel.RESPONSE) {
            print();
            return;
        }

        if (this.verbosityLevel >= 1 && level === LogLevel.DATA) {
            print();
            return;
        }

        if (this.verbosityLevel >= 2 && level === LogLevel.DEBUG) {
            print();
            return;
        }
    }

    async debug(message: any, ...args: any[]): Promise<void> {
        this.consoleLog(LogLevel.DEBUG, message, ...args);
        await this.writeToFile(LogLevel.DEBUG, message, ...args);
    }

    async info(message: any, ...args: any[]): Promise<void> {
        this.consoleLog(LogLevel.INFO, message, ...args);
        await this.writeToFile(LogLevel.INFO, message, ...args);
    }

    async data(message: any, ...args: any[]): Promise<void> {
        this.consoleLog(LogLevel.DATA, message, ...args);
        await this.writeToFile(LogLevel.DATA, message, ...args);
    }

    async res(message: any, ...args: any[]): Promise<void> {
        this.consoleLog(LogLevel.RESPONSE, message, ...args);
        await this.writeToFile(LogLevel.RESPONSE, message, ...args);
    }

    async warn(message: any, ...args: any[]): Promise<void> {
        this.consoleLog(LogLevel.WARN, message, ...args);
        await this.writeToFile(LogLevel.WARN, message, ...args);
    }

    async error(message: any, ...args: any[]): Promise<void> {
        this.consoleLog(LogLevel.ERROR, message, ...args);
        await this.writeToFile(LogLevel.ERROR, message, ...args);
    }

}