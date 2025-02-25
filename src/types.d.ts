import { ContextMenuCommandBuilder, SlashCommandBuilder } from "@discordjs/builders";
import { Bot, Interaction, InteractionCallbackData, Message } from "discordeno";

type ComponentResponse = string | InteractionCallbackData & { hidden?: boolean };

// Order does matter, that is determined at runtime, use whatever you want
type ComponentCallback<T1, T2, T3 = null> = (x?: (T1 | T2 | T3), y?: (T1 | T2 | T3), z?: (T1 | T2 | T3)) => ComponentResponse | Promise<ComponentResponse>;

type ComponentLocks = {
	/** Only the current server owner can use this command */
	owner: boolean;
}

// Buttons, select menus, modals
export interface ComponentFile {
	customID: string;
	filePath?: string; // set at runtime with the component loader
	locks?: Partial<ComponentLocks>;
	execute: ComponentCallback<Client, Interaction, string[]>;
}

// Slash commands, autocompletes, context menus
export interface CommandFile {
	customID?: string, // set at runtime with the component loader, it's just the command name
	filePath?: string;
	command: SlashCommandBuilder | ContextMenuCommandBuilder;
	locks?: Partial<ComponentLocks>;
	execute: ComponentCallback<Client, Interaction>;
}

export interface EventFile {
	name: string;
	execute: (...args: any[]) => void | Promise<void>;
}

export interface Client extends Bot {
	commands: Map<string, CommandFile>;
	buttons: Map<string, ComponentFile>;
	selects: Map<string, ComponentFile>;
	modals: Map<string, ComponentFile>;
}