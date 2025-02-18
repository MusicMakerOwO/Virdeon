import { InteractionTypes, MessageComponentTypes, type Interaction } from "discordeno";
import { Client, CommandFile, ComponentFile, EventFile } from "../types";
import Log from "../Utils/Logs";
import RunNamedParams from "../Utils/RunNamedParams";

async function RunComponent(component: CommandFile | ComponentFile, namedArgs: Record<string, any>) {
	const autoDefer = setTimeout(async () => {
		if (!namedArgs.interaction.acknowledged) await namedArgs.interaction.defer();
	}, 2_000);

	const response = await RunNamedParams(component.execute, namedArgs);
	if (response) {
		clearTimeout(autoDefer);
		if (!namedArgs.interaction.acknowledged) {
			await namedArgs.interaction.respond(response);
		} else {
			await namedArgs.interaction.edit(response);
		}
	}
}

export default {
	name: 'interactionCreate',
	execute: async function (interaction: Interaction, client: Client) {

		let cache: Map<string, CommandFile> | Map<string, ComponentFile> | undefined;

		switch (interaction.type) {
			case InteractionTypes.Ping:
				console.log('Ping!');
				break;
			case InteractionTypes.ApplicationCommand: // Slash Command
			case InteractionTypes.ApplicationCommandAutocomplete: // Autocomplete
				Log('INFO', `${interaction.user.username} : /${interaction.data!.name}`);
				cache = client.commands;
				break;
			case InteractionTypes.MessageComponent: // Button or Select Menu
				if (interaction.data!.componentType === MessageComponentTypes.Button) {
					Log('INFO', `${interaction.user.username} : [${interaction.data!.customId}]`);
					cache = client.buttons;
				} else if (interaction.data!.componentType === MessageComponentTypes.SelectMenu) {
					Log('INFO', `${interaction.user.username} : <${interaction.data!.customId}>`);
					cache = client.selects;
				}
				break;
			case InteractionTypes.ModalSubmit:
				Log('INFO', `${interaction.user.username} : {${interaction.data!.values}}`);
				cache = client.modals;
				break
		}
		if (!cache) return;

		const args = interaction.data!.customId?.split('_') ?? [];
		const name = args.shift() ?? interaction.data!.name;

		const namedArgs = {
			'args': args,
			'interaction': interaction,
			'client': client
		}

		const component = cache.get(name);
		if (!component) return;

		try {
			await RunComponent(component, namedArgs);
		} catch (error) {
			Log('ERROR', error);
			await interaction.defer().catch(() => { });
			await interaction.edit('An error occurred while executing this command.').catch(() => {});
		}

	}
} as EventFile;