import type { ClientOptions, RESTPostAPIChatInputApplicationCommandsJSONBody, ApplicationCommandDataResolvable, Awaitable, ClientEvents, Interaction } from 'discord.js';
import { Routes, Collection, Client } from 'discord.js';
import { lstatSync, readdirSync } from 'fs';
import Logger from '../utils/Logger';
import Log from '../annotations/Log';

interface TedOptions extends ClientOptions
{
    /** @description Should we enable debugging logs? */
    debug?: boolean;
    /** @description Should the bot be displayed as being on mobile? */
    mobile?: boolean;
    /** @description Should we use Ted's built in command handler? @todo RENAME */
    shouldWeUseTedCommandHandler?: boolean;
}

interface TedClientEvents extends ClientEvents
{
    /** 
     * @description The same as a normal Interaction, although slightly renamed. 
     * We pass the same data as the normal interactionCreate event. 
     */
    tedInteractionCreate: [interaction: Interaction];
}

class Ted extends Client
{
    /** 
     * @description Should debugging logs be enabled? 
     * THIS MUST BE SET TO TRUE IN THE CONSTRUCTOR FOR THE TED LOGS TO OCCUR. 
     * IF ENABLED LATER TED WILL STILL SEND THINGS VIA client#emit 
     * just with some details left out.
     */
    public debug: boolean = false;
    /** @description Should we use Ted's built in command handler? @todo RENAME */
    private shouldWeUseTedCommandHandler: boolean = true;
    /** @description map of name to method & metadata */
    private readonly commands: Collection<string, { method: (...args: any[]) => any | Promise<any>, raw: RESTPostAPIChatInputApplicationCommandsJSONBody; }> = new Collection();

    public constructor(opts: TedOptions)
    {
        super({
            ...opts,
            ws: {
                properties:
                {
                    browser: opts.mobile ? 'Discord iOS' : 'Ted Browser (fr fr cuh)',
                    os: 'ted (v' + import('../../package.json').then((pckg) => pckg.version).catch(() => 'UNKNOWN') + ')'
                }
            }
        });

        if(!opts.debug || opts.debug === undefined)
            this.debug = false;
        else /** haha, funny way to stop people from injecting shitty payloads. */
            this.debug = true;

        if(!opts.shouldWeUseTedCommandHandler || opts.shouldWeUseTedCommandHandler === undefined)
            this.shouldWeUseTedCommandHandler = false;
        else /** haha, funny way to stop people from injecting shitty payloads. x2 */
            this.shouldWeUseTedCommandHandler = true;
    }

    /**
     * @description Registers all the commands within a class.
     * @param {new (...args: A[]) => any} clazz - The Class (object not instance) to register the commands from. 
     * @param {A} args - The arguments to pass to the Class when creating a new instance of it. (Yes. We forcefully create a new instance of the class. COPE!) 
     * @since 0.0.1
     */
    @Log(this!)
    public registerClass<T extends (new (...args: A[]) => any), A extends any[]>(clazz: T, ...args: A): void
    {
        const cassth: Record<string, any> = new clazz(args);
        const methods: string[] = Object.getOwnPropertyNames(cassth.prototype);

        for(let i: number = 0; i < methods.length; i++)
        {
            const metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = Reflect.getMetadata('ted::command', cassth[methods[i]] as (...args: any[]) => any);
            this.commands.set(metadata.name, { method: cassth[methods[i]], raw: metadata });

            if(this.debug)
            {
                Logger.getInstance().info(`Registered command ${ metadata.name }`);
                this.emit('debug', `Registered command ${ metadata.name }`);
            }
        }
    }

    /**
     * @description Recursively (or not) scans over the classes within a folder and registers the commands (from default export).
     * @param {string} directory - The directory to scan for classes.
     * @param {boolean} recursive - Should we be recursive?
     * @since 0.0.1
     */
    @Log(this!)
    public async registerPath(directory: string, recursive: boolean = false): Promise<void>
    {
        const files: string[] = readdirSync(directory);

        for(let i: number = 0; i < files.length; i++)
        {
            const file: string = files[i];
            const path: string = `${ directory }/${ file }`;

            if(file.endsWith('.js') || file.endsWith('ts'))
            {
                const baseCommand: new () => any = await import(path);
                this.registerClass(baseCommand);
            }
            /** Start recursion if the path is a directory and recursive is set to true. */
            else if(lstatSync(path).isDirectory() && recursive)
                await this.registerPath(path, recursive);
        }
    }

    /**
     * @description Publishes slash commands, using a long list of options.
     * @param { { global?: boolean, clientId?: string, guilds?: { selective: { id: string; }; } }} opts - The options to publish the commands with. 
     * @warning Please implement your own method/and or utility to do this.
     * @deprecated This is a copy of acelikesghosts/kyusei's UNFINISHED (start of an) impl for automatic command redeployment.
     */
    public async publishCommands(opts: { global?: boolean, clientId?: string, guilds?: { selective: { id: string; }; }; }): Promise<void>
    {
        if(!this.commands || typeof this.commands === undefined)
            throw new Error('Unable to publish commands due to the `Commands` collection being empty.');

        const JSONCommands: any[] = [];

        this.commands?.forEach(async (val) =>
        {
            const { raw: metadata } = val;

            const isOkayJSON: boolean = this.isJson(metadata);

            if(isOkayJSON)
                JSONCommands.push(metadata);
            else
                throw new Error('Invalid JSON was provided when parsing commands\nName: ' + metadata.name);
        });

        if(opts.global === false || typeof opts.global === undefined)
        {
            if(opts?.guilds?.selective && opts.guilds.selective.id)
            {
                await (await this.guilds.fetch(opts.guilds.selective.id)).commands.set(JSONCommands as ApplicationCommandDataResolvable[]);
            }
        }
        else await this.rest.put(
            Routes.applicationCommands(opts.clientId!),
            { body: JSONCommands }
        );
    }

    /**
     * @description Registers our fancy little command handler (and passes any interaction that isnt a ChatInputCommand back over VIA #emit('tedInteractionCreate', ...))
     * @returns {void}
     */
    private registerCommandHandler(): void
    {
        if(!this.shouldWeUseTedCommandHandler)
            return;

        super.on('interactionCreate', (interaction: Interaction) =>
        {
            if(!interaction.isChatInputCommand())
            {
                super.emit('tedInteractionCreate', interaction);
                return;
            }

            const command:
                { method: (...args: any[]) => any | Promise<any>, raw: RESTPostAPIChatInputApplicationCommandsJSONBody; } | undefined
                = this.commands?.get(interaction.commandName);

            if(!command)
                return;

            try
            {
                command.method.call(this, interaction);
            }
            catch(err: unknown)
            {
                console.warn(`Failed to execute command ${ command.raw.name }.\nError: ${ err }`);
            }
        });
    }

    public on<K extends keyof TedClientEvents>(event: K, listener: (...args: TedClientEvents[K]) => Awaitable<void>): this;
    public on<S extends string | symbol>(event: Exclude<S, keyof TedClientEvents>, listener: (...args: any[]) => Awaitable<void>): this;
    public on(event: unknown, listener: unknown): this
    {
        if(this.isReady())
            throw new Error('Cannot define an event after the Client is logged in. Did you mean to call #init afterwards?');

        if(String(event).toLowerCase() === 'interactionCreate')
            this.shouldWeUseTedCommandHandler = false;

        super.on(event as any, listener as (...args: any) => any);
        return this;
    }

    /**
     * @description Initializes our command handler, and logs in the bot. (agiven you dont override the interactionCreate event)
     * @param {string} token - The Discord bot token to login w/. 
     * @returns {Promise<string>} The token you provided.
     */
    public async init(token: string): Promise<string>
    {
        this.registerCommandHandler();
        await this.login(token);
        return token;
    }

    /**
     * @deprecated Please don't actually use this.
     */
    private isJson(data: unknown): boolean
    {
        try
        {
            JSON.parse(data as string);
            return true;
        }
        catch(e: unknown)
        {
            return false;
        }
    }
}

export default Ted;