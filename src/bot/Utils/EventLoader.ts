import { Bot } from "discordeno";
import ReadFolder from "../../GlobalUtils/ReadFolder";
import { EventFile } from "../../types";
import RunNamedParams from "./RunNamedParams";

const EventArgs: Record<string, string[]> = {
	debug: ['text', 'args'],
	applicationCommandPermissionsUpdate: ['command'],
	guildAuditLogEntryCreate: ['log', 'guildId'],
	automodRuleCreate: ['rule'],
	automodRuleUpdate: ['rule'],
	automodRuleDelete: ['rule'],
	automodActionExecution: ['payload'],
	threadCreate: ['thread'],
	threadDelete: ['thread'],
	threadListSync: ['payload'],
	threadMemberUpdate: ['payload'],
	threadMembersUpdate: ['payload'],
	threadUpdate: ['thread'],
	scheduledEventCreate: ['event'],
	scheduledEventUpdate: ['event'],
	scheduledEventDelete: ['event'],
	scheduledEventUserAdd: ['payload'],
	scheduledEventUserRemove: ['payload'],
	ready: ['payload', 'rawPayload'],
	interactionCreate: ['interaction'],
	integrationCreate: ['integration'],
	integrationDelete: ['payload'],
	integrationUpdate: ['payload'],
	inviteCreate: ['invite'],
	inviteDelete: ['payload'],
	guildMemberAdd: ['member', 'user'],
	guildMemberRemove: ['user', 'guildId'],
	guildMemberUpdate: ['member', 'user'],
	guildStickersUpdate: ['payload'],
	messageCreate: ['message'],
	messageDelete: ['payload', 'message'],
	messageDeleteBulk: ['payload'],
	messageUpdate: ['message'],
	reactionAdd: ['payload'],
	reactionRemove: ['payload'],
	reactionRemoveEmoji: ['payload'],
	reactionRemoveAll: ['payload'],
	presenceUpdate: ['presence'],
	voiceChannelEffectSend: ['payload'],
	voiceServerUpdate: ['payload'],
	voiceStateUpdate: ['voiceState'],
	channelCreate: ['channel'],
	dispatchRequirements: ['data', 'shardId'],
	channelDelete: ['channel'],
	channelPinsUpdate: ['data'],
	channelUpdate: ['channel'],
	stageInstanceCreate: ['data'],
	stageInstanceDelete: ['data'],
	stageInstanceUpdate: ['data'],
	guildEmojisUpdate: ['payload'],
	guildBanAdd: ['user', 'guildId'],
	guildBanRemove: ['user', 'guildId'],
	guildCreate: ['guild'],
	guildDelete: ['id', 'shardId'],
	guildUnavailable: ['id', 'shardId'],
	guildUpdate: ['guild'],
	raw: ['data', 'shardId'],
	roleCreate: ['role'],
	roleDelete: ['payload'],
	roleUpdate: ['role'],
	webhooksUpdate: ['payload'],
	botUpdate: ['user'],
	typingStart: ['payload'],
	entitlementCreate: ['entitlement'],
	entitlementUpdate: ['entitlement'],
	entitlementDelete: ['entitlement'],
	subscriptionCreate: ['subscription'],
	subscriptionUpdate: ['subscription'],
	subscriptionDelete: ['subscription'],
	messagePollVoteAdd: ['payload'],
	messagePollVoteRemove: ['payload'],
	soundboardSoundCreate: ['payload'],
	soundboardSoundUpdate: ['payload'],
	soundboardSoundDelete: ['payload'],
	soundboardSoundsUpdate: ['payload'],
	soundboardSounds: ['payload']
};

const Events: Record<string, Function> = {}

function EventHandler(client: Bot, event: string, ...args: any[]) {
	if (!Events[event]) return;
	const argsObj = Object.fromEntries(EventArgs[event].map((key, i) => [key, args[i]]));
	argsObj.client ??= client;
	RunNamedParams(Events[event], argsObj);
}

export default function (folder: string, client: Bot) {

	const EventCallback = EventHandler.bind(null, client);

	const EventFiles = ReadFolder(`${__dirname}/../${folder}`);
	for (let i = 0; i < EventFiles.length; i++) {
		const file = EventFiles[i];
		if (!file.endsWith('.js')) continue;

		let event = require(file) as Function | EventFile | { default: Function | EventFile };
		if ('default' in event) {
			event = event.default;
		}

		if (typeof event === 'function') {
			const eventName = file.split('/').pop()!.split('.').shift()!;
			Events[eventName] = event;
		} else if (typeof event === 'object') {
			Events[event.name] = event.execute;
		}
	}

	for (const eventName of Object.keys(Events as Bot['events'])) {
		Object.defineProperty(client.events, eventName, { value: EventCallback.bind(null, eventName) });
	}
}