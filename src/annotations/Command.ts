import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';

type CommandData = RESTPostAPIChatInputApplicationCommandsJSONBody;

/**
 * @description Using metadata it allows for a Ted client instance to register the command.
 * @example ```ts
 * import { Command } from '@turel/ted';
 * 
 * export default class ExampleCommand
 * {
 *  @Command({ name: 'name' })
 *  public NameExecute(interaction: ChatInputCommandInteraction): any
 *  {
 *      // ...
 *  }
 * }
 * 
 * /// whereever ur client is
 * client.register(ExampleCommand);
 * ```
 * @param {CommandData} data - The information about the command! 
 * @returns {any}
 */
function Command(data: RESTPostAPIChatInputApplicationCommandsJSONBody): any
{
    return (target: unknown) => Reflect.defineMetadata(target, 'ted::command', data);
}

export { Command };
export type { CommandData };