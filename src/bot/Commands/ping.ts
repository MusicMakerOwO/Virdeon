import { SlashCommandBuilder } from '@discordjs/builders';
import { Interaction } from 'discordeno';

export const command = new SlashCommandBuilder()
.setName('ping')
.setDescription('Replies with Pong!');

export async function execute(interaction: Interaction) {
	return 'Pong!';
}