# Simplebot
Standalone discord bot I built over the last summer (2019) for a friend's discord channel. It has taken me hundreds of hours, so I hope it saves you a couple :)

Everything is open-sourced (except for the hardcoded bot token - you'll have to make your own bot).  Feel free to use this as a template for your projects.  Credit would be appreciated, but just follow the free-use guidlines.  


This runs using Discord.js's documentation for backend Javascript.  To use it, you need to install Node.js, download the dependencies needed for the project (discord.js, fs), and run the file typing node main.js in your terminal.

## Features and commands:
Server initialization: in order to use the bot's commands on a particular server, you will need to initialize it.  This is done by typing 'simplebot initialize ' followed by either a channel name or a channel id.  That channel will be set as the bot channel.  You then need to go there to change the bot's settings.

Bot settings:
The bot saves the following data on a per-server basis:
Admins, Welcomechannel (channel to send the welcome message if enabled), Botchannel (where you can change settings) 
Allowedchannels (an array storing the channel ids of allowed channels for the bot's non-setting commands)
In addition, each of the bot's commands can be individually turned on or off.  


Full list of commands the bot understands and what they do:
'simplebot initialize asdf/1234' - finds a channel named asdf or with the id 1234 and initializes the server with that channel as the botchannel
(in the bot channel only -- requires no permissions)
'simplebot display emotes' -- shows a list of all the emotes in all of the servers the bot is connected to (yes, this can be a ton.  I'd personally recommend moving this code to the admin only section and simply pinning the list)
(in the bot channel only - requires admin or superadmin permissions)
'simplebot admin add/remove asdf 1234 1567 fdsa' - adds or removes admins with the name asdf and fsda and ones with the ids 1234 and 1567
'simplebot channel add/remove asdf 1234 3939' - adds or removes channels from the allowedchannel list with the name asdf or ids 1234 or 3939
'simplebot toggle dadbot/nitrobot/welcomebot' -- turns that particular feature on or off
'simplebot change dadcd/botchannel/welcomechannel' -- changes the cooldown of dadcd (in ms), the botchannel, or the welcomechannel.
'simplebot show settings' -- displays the current list of settings
(in the bot channel only -- requires superadmin permissions)
'set status to watching/streaming/playing some text here' -- changes the bot's status to watching, streaming, or playing whatever the following text is.

Features:
Nitrobot -- when a user sends a message containing !emotename, it searches for that emote, recreates their message, sends it with the emote, and deletes theirs.  This allows users who don't have nitro to use animated emotes or emotes that are not on the server (hint: you can upload tons of emotes to a private server, add the bot, and use all of them on your main server as well).

Dadbot -- when a user sends a message that begins with some kind of 'i am', it will send the rest of their message back to them as "hi xxx, i'm simplebot' -- there are some built-in anti-spam tools as well. In addition, if a user deletes that message, the bot will call them out.

Welcomebot -- when a new user joins the server, it checks to see if it is a new account (created < 24 hrs).  If it is, the bot will send a message to the chat letting them know that the user may be a spambot.  

## Setup Instructions:
You will need to download the .js file and the .txt file from this repo and Node.js
Save them into a folder somewhere
Afterwards, use your terminal to change directory to that folder.  Type the following commands:
npm install fs
npm install discord.js

Go into the .js file (open it using nodepad++, sublime, VSCode, or whatever you use) and add your bot's token and your id.
Then go back to your terminal window and type 'node main.js' to run the bot.  you can press ctrl(or cmd) c in that terminal window to stop the bot from running.

## Some small notes/bugs: 
1. If the serverObject.txt file is completely empty, the bot crashes.  You can fix this by typing {} and saving the file.
2. Setting status to streaming is extremely finnecky and usually results in the bot crashing. Avoid it for now.
3. Yes, the code can probably be broken up into many different files.  If you would like to help me do this, feel free to pull the code and send it back to me.  
