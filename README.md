# Holly

**Holly** is a Discord bot created for the **Dublin University Science Fiction & Fantasy Society** Discord server.

## Features
### Member Verification
When a user joins the server, Holly will create a private chat where the user can enter their email address. Holly can compare this email address to a provided Google Sheets spreadsheet, and its own stored list of used emails, to determine if the user should be granted access. Holly will also make sure that the user has selected their pronouns in a roles channel, and has posted an introduction in the welcome channel.

### Games
Holly can play Rock Paper Scissors, role a D20, or flip a coin using slash commands.

### Quotes
Holly can provide quotes from myriad figures in science fiction, including Douglas Adams and Jean-Luc Picard.

## How to Use for Your Server

### Technology
Holly is written in **TypeScript** and runs on the **Node.js** runtime. I run it off a free Oracle VPS with 1GB of RAM, and it works fine.

### Set-Up Steps
1. Clone the repository to your machine and run `npm install` to download this project's dependencies. If you don't have Node.js installed, you should install version `20` or later.
2. Create a bot at the [Discord developer portal](https://discord.com/developers/applications). Grant this bot all three intents. Add this bot to your server (use a testing server until you know it works) with Administrator permissions.
3. Create a directory called `secrets` in the project's root directory, and a place a `.env` file inside it containing:
    - `TOKEN`, for your bot's Bot Token. You can get this in your bot's settings.
    - `CLIENT_ID`, for your bot's Application ID. You can also get this in your bot's settings.
    - `GUILD_ID`, for your Server ID. You can get this by right-clicking your server name in Discord and selecting 'Copy Server ID'.
    - `MEMBER_ROLE_ID`, for the ID of the role you want to give verified users. You can get this by right-clicking the role in the role menu and selecting 'Copy Role ID'.
    - `COMMITEE_ROLE_ID`, for the ID of the role you want pinged when issues arise. You can get this the same way as the Member role ID.
    - `WELCOME_CHANNEL_ID`, for the ID of your welcome channel (the channel everyone sees when they join). You can get this by right-clicking the channel name in Discord and selecting 'Copy Channel ID'.
    - `SIGNUP_SHEET_ID`, for the ID of the spreadsheet that member validation will be pulling data from. You can find this in the URL of your spreadsheet. In the URL "https://docs.google.com/spreadsheets/d/**1_QM_XPH2yG8926grT2-pQdV3-cGSGA3bgMaiR7RC5QZ**/edit", the spreadsheet ID is in bold.
    - `SIGNUP_SHEET_RANGE`, for the cells in your signup sheet that you want data pulled from. For example, **ExampleSheet!A:A** will pull all cells in row A of the sheet "ExampleSheet".
4. Follow [this guide](https://developers.google.com/sheets/api/quickstart/nodejs) until you have a downloaded file called `credentials.json`. Rename this file `google-credentials.json` and store it in the `secrets` directory.
5. Create another file in the `secrets` directory called `pronouns-roles.json`. Place inside it an array of the IDs of pronouns roles in your server (he/him, she/her, etc.). Holly will ensure each member has chosen at least one of these roles before granting them access. How these members get these roles is up to you.
6. Modify `verify-user.ts` to better suit the verification process of your server. At the very least, you should change the text descriptions to suit your server.
7. That's it! Run `npm run dev` to start Holly! The bot has started when you see "Ready! Logged in as `x`", where `x` is your bot's Discord account. If you want the bot to run constantly in the background, follow [this guide](https://linuxhandbook.com/create-systemd-services/) to create a Systemd service.

### Project Directory
- `dist`, short for **distribution**, contains `JavaScript` files that have been compiled from our `TypeScript` files. These are the files that actually execute when we run Holly.
- `node_modules` contains all of our project's dependencies.
- `secrets` contains the tokens and IDs that allow Holly to authenticate, and should be kept private. If you share the contents of this directory, your instance of Holly could be compromised.
- The `src` directory contains source files.
    - `src/commands` contains all slash commands.
    - `src/features` contains the service functions that implement Holly's functionality.
    - `src/startup` contains scripts that run only once, when Holly starts.
    - `src/index.ts` is the entry point for Holly. The `start()` function is contains is the first function that runs.
    - `src/types.d.ts` specifies definitions for custom types used throughout the project.
- `.gitignore` specifies files and folders that will not be managed by git.
- `biome.json` specifies the configuration for Biome.js, the project's linter and formatter.
- `package-lock.json` is used internally by Node.js. Don't modify this.
- `package.json` specifies our project's settings. It is a violation of AGPL to change the license.
- `tsconfig.json` specifies a simple set of settings for the TypeScript compiler.