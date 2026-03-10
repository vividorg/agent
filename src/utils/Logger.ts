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
    private enableConsole: boolean;

    /**
    * @param logFilePath – if specified, logs are also saved to this file
    * @param enableConsole – whether to log to the console (default true)
    */
    constructor(logFilePath?: string, enableConsole: boolean = true) {
        this.logFilePath = logFilePath;
        this.enableConsole = enableConsole;
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
        if (!this.enableConsole) return;

        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] [${level}]`;
        const messageStr = typeof message === 'string' ? message : JSON.stringify(message);

        switch (level) {
            case LogLevel.DEBUG:
                console.log(this.getLevelStyle(level)(prefix), this.getLevelStyle(level)(messageStr), ...args);
                break;
            case LogLevel.INFO:
                console.warn(this.getLevelStyle(level)(prefix), messageStr, ...args);
                break;
            case LogLevel.DATA:
                console.error(this.getLevelStyle(level)(prefix), messageStr, ...args);
                break;
            case LogLevel.RESPONSE:
                console.error(this.getLevelStyle(level)(prefix), messageStr, ...args);
                break;
            case LogLevel.WARN:
                console.error(this.getLevelStyle(level)(prefix), this.getLevelStyle(level)(messageStr), ...args);
                break;
            case LogLevel.ERROR:
                console.error(this.getLevelStyle(level)(prefix), this.getLevelStyle(level)(messageStr), ...args);
                break;
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