// generally frowned upon to use a util that's not global but I don't care here lol
import ComponentLoader from "./bot/Utils/ComponentLoader";
import RegisterCommands from "./bot/Utils/RegisterCommands";
import Log from "./GlobalUtils/Logs";
import type { CommandFile } from "./types";

const CommandCache = new Map<string, CommandFile>();

ComponentLoader('Commands', './Commands', CommandCache, true);

Log('INFO', `Registering ${CommandCache.size} global commands...`);

RegisterCommands(CommandCache, true);

Log('INFO', 'Global commands registered - Please restart your discord');