import type { PermissionFlagsBits } from 'discord.js';

/**
 * @description Allows for you to add a required permission to a command.
 * @warning There is currently only one allowed %s value, which is the permission; for messages.
 * @example ```ts
 * import { Command, CommandPermission } from '@turel-bot/ted';
 * 
 * export default class ExampleCommandWithPermission
 * {
 *  @Command({ name: 'name' })
 *  // uses default message & requires them to have Administrator in the server.
 *  @CommandPermission({ permission: 'Administrator' })
 *  public NameExecute(interaction: ChatInputCommandInteraction): any
 *  {
 *      // ...
 *  }
 * }
 * 
 * /// whereever ur client is
 * client.register(ExampleCommand);
 * ```
 * @param {keyof typeof PermissionFlags} permission - The name of the permission required to execute that command. 
 * @returns {any}
 */

function CommandPermission(data: { permission: keyof typeof PermissionFlagsBits | 'NONE'; }): any;
function CommandPermission(data: { permission: keyof typeof PermissionFlagsBits | 'NONE', message: string; }): any;
function CommandPermission(data: { permission: keyof typeof PermissionFlagsBits | 'NONE', message?: string; }): any
{
    return (target: unknown) => Reflect.defineMetadata(target, 'ted::command:permission', { permission: data.permission ? data.permission : 'NONE', message: data.message ? data.message : ':x: You are missing required permission %s!' });
}

export { CommandPermission };