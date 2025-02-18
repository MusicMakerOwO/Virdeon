import { SlashCommandBuilder } from '@discordjs/builders';
import { Interaction } from 'discordeno';
import { Client } from '../types';

export const command = new SlashCommandBuilder()
.setName('ping')
.setDescription('Replies with Pong!');

export const locks = {
	// microbase restrictions as normal
}

export async function execute(client: Client, interaction: Interaction, args: string[]) {
	await new Promise(resolve => setTimeout(resolve, 5000));
	await interaction.defer().catch( () => {} );
	return 'Pong!';
}