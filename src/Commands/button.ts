import { SlashCommandBuilder } from "@discordjs/builders";
import { Interaction } from "discordeno";

export const command = new SlashCommandBuilder()
	.setName("clicker")
	.setDescription("Clicker game i guess lol");

export default async function (interaction: Interaction) {
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