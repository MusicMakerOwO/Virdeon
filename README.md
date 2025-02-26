# Virdeon
Built to scale, built to last, built to be the best.

- [About](#about)
- [Our Goals](#our-goals)
- [Installation](#installation)
- [Usage](#usage)
	- [Slash Commands](#slash-commands)
	- [Buttons](#buttons)
	- [Select Menus](#select-menus)
	- [Modals](#modals)
	- [Events](#events)
- [Features](#features)
	- [Hot Reloading](#hot-reloading)
	- [Interactions](#interactions)
- [Contributing](#contributing)
- [License](#license)

## About
Virdeon is the sister of [Micro Base](https://github.com/MusicMakerOwO/MicroBase), built to scale and be a proper framework to launch your bot off. We do the hard lifting so you don't have to. With a focus on performance and reliability, whether you're building a simple bot or a complex system, Virdeon provides the tools and flexibility you need to succeed.

## Out Goals
Our primary focus is on sharding at scale - Building bots is hard, building them for thousands of servers is harder. We aim to make this process as easy as possible, with a focus on performance and reliability. We aren't a cure-all but we get you started on the right path to make things easier.

## Installation
Virdeon is built directly on top of Typescript, we have no intentions of changing this anytime soon. To get started, you will need to have NodeJS installed (of course) and TSC. We will assume you have NodeJS already installed.

> NOTE \
> Discordeno requires Typescript 5.4.0 or later, you can check your version with `tsc -v` \

1) Installing Typescript - `npm install -g typescript`
2) Clone the repository - `git clone https://github.com/MusicMakerOwO/Virdeon`
3) Install the dependencies - `npm install`

<br>

After this we have some basic npm scripts for development.
- `npm run build` - Builds the project
- `npm run start:bot` - Starts the bot
- `npm run start:rest` - Starts the REST server
- `npm run start:gateway` - Starts the Gateway server
- `npm run linecount` - Counts the lines of code in the project (for fun lol)
- `npm run register` - Registers the bot commands with Discord

## Usage

### Slash Commands
Slash Commands are the primary entry point for any bot, it's hard to do anything meaningful without them. For that reason we make it a point to make commands as easy as possible to create and use. There are 2 main ways you can create a command, it comes down to personal preference in the end. Notice you don't have to use `interaction.reply()` as you are used to in other libraries.
---

**Indivial exports**
```typescript
export const command: Command = {
	name: "ping",
	description: "Pong!",
	options: []
}

export async function execute() {
	return 'Pong!';
}
```

<br>

**Object export**
```typescript
export default {
	command: {
		name: "ping",
		description: "Pong!",
		options: []
	},
	async execute() {
		return 'Pong!';
	}
}
```

---

### Buttons
Buttons are a great way to interact with your bot and create interactive user experiences. Internally they are grouped with Select Menus and Modals, called "Components". In terms of interactions they work largely the same with the exception of the `customID` field.

---
**Indivial exports**
```typescript
export const customID = "myButton";

export async function execute() {
	return 'Button Clicked!';
}
```

<br>

**Object export**
```typescript
export default {
	customID: "myButton",
	async execute() {
		return 'Button Clicked!';
	}
}
```
---


### Select Menus
Select menus are unfortunately among the more niche components, but they are still very useful. They allow for a more complex interaction with the bot, and can be used in a variety of ways. They are grouped with Buttons and Modals as "Components". In terms of interactions they work largely the same with the exception of the `customID` field.

---
**Indivial exports**
```typescript
export const customID = "mySelect";

export async function execute(interaction: Interaction) {
	const selection = interaction.data.values[0];
	return `Selected: ${selection}`;
}
```

<br>

**Object export**
```typescript
export default {
	customID: "mySelect",
	async execute(interaction: Interaction) {
		const selection = interaction.data.values[0];
		return `Selected: ${selection}`;
	}
}
```
---


### Modals
Modals are the most complex of the components, that doesn't make them any less useful. They allow for a more complex interaction with the bot, and can be used in a variety of ways. They are grouped with Buttons and Select Menus as "Components". In terms of interactions they work largely the same with the exception of the `customID` field.

---
**Indivial exports**
```typescript
export const customID = "myModal";

export async function execute() {
	return 'Modal submitted!';
}
```

<br>

**Object export**
```typescript
export default {
	customID: "myModal",
	async execute() {
		return 'Modal submitted!';
	}
}
```
---

### Events
Events are the backbone of any bot, they are what make the bot tick. Usuaully these are pretty simple but here in Virdeon we took the time to make them as easy as possible to use. There are 2 main ways you can create an event as with all the other components, scroll up if you need to see an example. Virdeon events difer in the fact that the paramters are not order dependent, you can pass them in any order you like. This is a little counter intuitive to most people but it makes the code a lot more friendly to work with as it adapts to you unlike traditional methods where you have to bend to the library.

> Notice the 2 execute functions below and where the client is. The only thing that matters is the name of the paramter, the order is irrelevant. If you want to use the client first, go ahead. If you want to use the message first, great! **If a paramter is spelled wrong or missing, it will be `null`**.

---
**Guild Member Add**
```typescript
export const name = "guildMemberAdd";

export async function execute(member: GuildMember, client: Client) {
	console.log(`${member.username} joined the server!`);
}
```

<br>

**Message Create**
```typescript
export const name = "messageCreate";

export async function execute(client: Client, message: Message) {
	if (message.content === 'ping') {
		message.reply('pong');
	}
}
```

## Features

### Hot Reloading
> This feature originally came from [Micro Base](https://github.com/MusicMakerOwO/MicroBase), you can read more about the original implementation there but we will cover it here nonethless.

Hot Reload in essense is the ability to see your changes in real time without having to restart the bot. This is a huge time saver and makes development a lot easier. In regular JavaScript this is fairly easy as you only have to listen for file changes, however TypeScript makes things more interesting. TypeScript has to be compiled to JavaScript before it can be run, so we have to run 2 different listeners - One for the TypeScript files to be compiled, the other is for the runtime JavaScript files.

Due to limitations in the TypeScript compiler, we can't use the `--watch` flag, we need to be able to both run and compile files at the same time. You could do this with 2 separate terminals but that's a pain, so we made it easier. During runtime we will use [esbuild](https://esbuild.github.io/) to compile the TypeScript files on the fly, this is a lot faster than the TypeScript compiler and allows us to keep up with the changes in real time. There are some descrepencies in how TSC and esbuild compile files but in testing they work fine together.

After compiling then we must delete the file from the `require()` cache and re-require it. This is a little hacky and generally frowned upon in runtime enviorments. This is the only way to get the changes to show up in the bot, otherwise JS likes to cache the required files - which is great for normal work - but it works against us in this case.

### Interactions
Interactions are difficult, no one can deny that. It's especially frustrating when you have to deal with network delays and other issues. For this we added an automatic defer to interactions if you don't respond within 2 seconds (2,000 ms). If you like you can also defer yourself with `interaction.defer()` and `deferEdit()` and this will override the automatic defer. This is great if you take a little longer than alloted or just forget to defer in advance! The code behind this isn't nesecarily complex but you can take a look at it [here](https://github.com/MusicMakerOwO/Virdeon/blob/main/src/bot/Events/InteractionHandler.ts#L7) if you are interested.

## Contributing
Contributions are always welcome! If you have an idea for a new feature or a bug fix, feel free to open a pull request - We want this to be the best it can possibly be! On that note however, we do have some guidelines to follow for commits. This is only to make maintaining the project easier for us, and to make sure we can understand what you are trying to do.

1) Keep your commits short and to the point, don't commit 300 lines across 6 different files.
2) Make sure your commit message is clear. We use a standard format inspired by Angular - `type: message`
The type is a general idea of what it is, refer to the table below for a list of types and how they are used.
3) Make sure your code is clean and readable, we don't want to spend hours deciphering why or how it works.
4) Make sure your code works, if it doesn't compile and run then don't commit. We will reject it.
5) Try to only commit full features, make sure you are content with what you have before submitting.

| Type | Description |
| ---  | --- |
| feat | A new feature |
| fix  | A bug fix |
| docs | Documentation changes |
| style | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc) |
| refactor | A code change that neither fixes a bug nor adds a feature |
| perf | A code change that improves performance |

## License
Virdeon falls under the Apache 2.0 License. You can view the full license [here](LICENSE). \
This project is not affiliated with [Discord](https://discord.com/) or [Discordeno](https://discordeno.js.org/) in any way. Discord and Discordeno are registered trademarks of their respective owners. We do not claim ownership of any of the trademarks, logos, names, or any other intellectual property related to Discord or Discordeno.