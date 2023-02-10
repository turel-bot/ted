/** Singleton Logger */
import type { Chalk } from 'chalk';
import chalk from 'chalk';

/** @private @description The singleton instance of the Logger. */
let LoggerInstance: Logger | undefined;

/**
 * @description A very simplistic Singleton logger.
 * @author AceLikesGhosts
 * @warning DROP THIS PLEASE.
 */
class Logger
{
    /**
     * @description Gets the Singleton instance of the Logger.
     * @returns {Logger}
     */
    public static getInstance(): Logger
    {
        if(!LoggerInstance || LoggerInstance === null)
            LoggerInstance = new Logger();

        return LoggerInstance;
    }

    /** @description Sends an info log. */
    public info(msg: string): void
    {
        console.log(this.format(['info', 'blue'], msg));
    }

    /** @description Sends a warn log. */
    public warn(msg: string): void
    {
        console.warn(this.format(['warn', 'yellow'], msg));
    }

    /** @description Sends an error log. */
    public error(msg: string): void
    {
        console.error(this.format(['error', 'red'], msg));
    }

    /**
     * @warning POTENTIALLY UNSAFE. WATCH WHAT YOU PUT INTO THIS.
     * @param {[string, string]} level - The level & color. EX: ['info', 'blue']
     * @param {string} msg - The message to format. 
     * @returns {string} The formatted message.
     */
    public format(level: [string, string], msg: string): string // level -> [type, color]
    {
        // first char uppercased + the rest of the string
        // EX: blue -> Blue
        // yeah.. thats it.

        //            fist char uppercased        rest of string
        const color = level[1][0].toUpperCase() + level[1].slice(1);

        // + this is completely unsafe, but i dont care! dont be an idiot and pass bullshit to it!
        const colorFunc = chalk[`bg${color}` as keyof Chalk] as (m: string) => void;

        return `${ chalk.cyan(colorFunc(this.fetchStupidBrackets(level[0]) + ': ' + msg)) }`;
    }

    /** @description utility to send the funny brackets around our log level. IE: '[INFO]'. */
    private fetchStupidBrackets(level: string): string
    {
        return `${ chalk.gray('[') }${ level.toUpperCase() }${ chalk.gray(']') }`;
    }
}

export default Logger;