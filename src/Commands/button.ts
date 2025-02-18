import { SlashCommandBuilder } from "@discordjs/builders";

export const command = new SlashCommandBuilder()
	.setName("clicker")
	.setDescription("Clicker game i guess lol");

export async function execute () {
	const button = {
		type: 1,
		components: [
			{
				type: 2,
				style: 1,
				custom_id: "clicker",
				label: 'Click me!'
			}
		]
	}

	return { components: [button] };
}