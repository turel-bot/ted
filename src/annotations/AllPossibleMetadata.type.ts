import type { PermissionFlagsBits, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';

export type AllPossibleMetadata = { command: RESTPostAPIChatInputApplicationCommandsJSONBody, permissions?: { permission: keyof typeof PermissionFlagsBits | 'NONE', message: string; }; };
export default AllPossibleMetadata;