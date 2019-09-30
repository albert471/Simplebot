//=====================================================================================    
//=====================================================================================
//                                  Smolbot.js
// * Basic discord bot written in Javascript (Discord.js)
// * @author: Albert471
// * @version: 1.2.11
//=====================================================================================
//=====================================================================================

//things to do 
//all console logs need to go into an output like a bot channel (sorta done)
//allow an onEdit for nitro --> make it delete the message and have a --asdf at the end
//list of commands bot should be able to respond to
//help command exmplaining everything

//=====================================================================================
//                             discord.js stuff
//=====================================================================================
// Extract the required classes from the discord.js module
const { Client, RichEmbed } = require('discord.js');

// Create an instance of a Discord client
const client = new Client();
const fs = require(`fs`);
//=====================================================================================
//                         Imports from helper files
//
// * no ES6 support in nodeJS yet, so I have to use require
// * empty for now because I'm too lazy to move this stuff around into new files
// * all functions can be found at the bottom
//=====================================================================================

//=====================================================================================
//                             Global Variables        
//=====================================================================================

// Discord token    
const myToken;  // bot's token goes here
superAdmins = [] // add your id(s) here as strings

//string containing message the bot will reply with
let globalReplyMessage = ``;

//variables for a timestamp
let today = new Date();

//cut off string of dadJoke at the earliest index of any of these.
const stopChars = [`.`,`!`,`?`,`/`,`:`,`;`,`,`,`<`];

serverObject = {};

//emojis instantiated here
const xmark = `❌`;
const checkmark = `✅`;


//boot everyting up
client.login(myToken);

//=====================================================================================
//                              Client.on event listeners  
//=====================================================================================               

//                           Client ready listener
// performs these commands when bot is turned on   
client.on(`ready`, () => 
{
  onReady.consoleLog();
});
  
//                    Client on.message event listener
// iterates through these statements when the bot receives a message.
client.on(`message`, (receivedMessage) => 
{
  //ignore dms and bots
  if (receivedMessage.guild == null) return;
  if (receivedMessage.author.bot) return;

  // server initialization 
  if (!Object.getOwnPropertyNames(serverObject).includes(receivedMessage.guild.id))
  {
    if (receivedMessage.author.id != receivedMessage.guild.ownerID && receivedMessage.author.id != `195767603476692992`&& receivedMessage.author.id != `520425039108243477`) return;
    if (receivedMessage.content.search(/^smolbot initialize/i) > -1)
    {
      onMessage.initializeSmolbot(receivedMessage);
    }
    //early return to ignore all other messages
    return;
  }

  // functions only in bot channel (outputchannel) of allowed servers... (smolbot ____)
  if (receivedMessage.channel.id == serverObject[receivedMessage.guild.id].outputChannelId)
  {
    //display emotes (anyone)
    if (receivedMessage.content.search(/^smolbot display emotes/i) > -1 )
    {
      onMessage.displayEmotes(receivedMessage);
      return;
    }
    //edit bot settings (ADMINS ONLY)
    if (serverObject[receivedMessage.guild.id].admins.includes(receivedMessage.author.id))
    {
      if (receivedMessage.content.search(/^smolbot/i) > -1 )
      {
        onMessage.updateSettings(receivedMessage);
        return;
      }
    }
    //edit bot settings for superadmins
    if (serverObject[receivedMessage.guild.id].superadmins.includes(receivedMessage.author.id))
    {
      if (receivedMessage.content.search(/^smolbot/i) > -1 )
      {
        onMessage.updateSettings(receivedMessage);
        return;
      }
      //change bot status (only superadmins)
      if (receivedMessage.content.toLowerCase().startsWith(`set status to`))
      {
        onMessage.setPresence(receivedMessage);
        return;
      }
    }
  }
  // fun stuff (in allowedchannels)
  if(serverObject[receivedMessage.guild.id].allowedChannels.includes(receivedMessage.channel.id))
  {
    if (serverObject[receivedMessage.guild.id].dadtoggle)
    {
      onMessage.dadJoke(receivedMessage);
    }
    if (serverObject[receivedMessage.guild.id].nitrotoggle)
    {
      let subStringContent = onMessage.nitroEmotes(receivedMessage);
      
      if(subStringContent)
      {
        receivedMessage.channel.send(subStringContent);
        receivedMessage.delete().catch(console.error);
      }
    }
  }
});

//                  Client on.ServerJoin event listener
// iterates through these statements when the bot receives a message.
client.on(`guildMemberAdd`, (member) => 
{
	//ignore un-initialized servers
  if (!Object.getOwnPropertyNames(serverObject).includes(member.guild.id)) return;
  if (serverObject[member.guild.id].welcometoggle)
  {
    onServerJoin.checkForBot(member);
  }
});

//                 Client on.messagedelete event listener
// does something when a message is deleted
client.on(`messageDelete`, (messageDelete) => 
{	//ignore un-initialized servers
  if (!Object.getOwnPropertyNames(serverObject).includes(messageDelete.guild.id)) return;
  if (serverObject[messageDelete.guild.id].markedArray.includes(messageDelete.id))
  {
    onMessageDelete.markedDelete(messageDelete);
  }
});

//=====================================================================================
//                              Server class 
//=====================================================================================

class Server 
{
  constructor(input) 
  {   
    //normal server
    if(Array.isArray(input))
    {
      this.outputChannelId = input[1];
      this.superadmins = superAdmins;
      this.markedArray = [];
      this.lastTriggerUser;
      this.name = input[0].name;
      this.id = input[0].id;
      this.admins = [input[0].ownerID];
      this.dadtoggle = false;
      this.dadcd = 60000;
      this.lasttriggertime = 0;
      this.nitrotoggle = false;
      this.welcometoggle = false;
      this.allowedChannels = [input[1]];
      this.welcomeChannelId;
    } else
    {
      //normal server from save data
      this.outputChannelId = input[`outputChannelId`];
      this.superadmins = superAdmins;
      this.markedArray = [];
      this.lastTriggerUser;
      this.name = input[`name`]
      this.id = input[`id`];
      this.lasttriggertime = 0;
      this.dadcd = input[`dadcd`]
      this.admins = input[`admins`]
      this.dadtoggle = input[`dadtoggle`];
      this.nitrotoggle = input[`nitrotoggle`];
      this.welcometoggle = input[`welcometoggle`];
      this.allowedChannels = input[`allowedChannels`];
      this.welcomeChannelId;
      if (input[`welcomeChannelId`]) this.welcomeChannelId = input[`welcomeChannelId`];
    }  
  }
  //logic before this needs to parse out just the function it is toggling
  //helper function uses these, then reacts based on return boolean
  toggle(string)
  {
    let toggle  = ``;
    let service = ``;
    if (string === `dadbot`)
    {
      service = `dadbot`;
      this.dadtoggle = !this.dadtoggle;
      if (this.dadtoggle == true) toggle = `on`;
      if (this.dadtoggle == false) toggle = `off`;
      save();
      globalReplyMessage += (`${service} turned ${toggle}`);
      return true;
    }
    if (string === `nitrobot`)
    {
      service = `nitrobot`;
      this.nitrotoggle = !this.nitrotoggle;
      if (this.nitrotoggle == true) toggle = `on`;
      if (this.nitrotoggle == false) toggle = `off`;
      save();
      globalReplyMessage += (`${service} turned ${toggle}`);
      return true;
    }
    if (string === `welcomebot`)
    {
      service = `welcomebot`;   
      {
        if (this.welcomeChannelId == undefined || this.welcomeChannelId == null)
        {
          globalReplyMessage += `Welcomechannel has not be set yet!`;
          return false;
        }
        toggle = `off`;
      }
      this.welcometoggle = !this.welcometoggle;
      if (this.welcometoggle == true) toggle = `on`;
      if (this.welcometoggle == false)
      save();
      globalReplyMessage += (`${service} turned ${toggle}`);
      return true;
	}

    //if it didn't find anything...
    globalReplyMessage += (`Could not find anything to toggle.`);
    return false;
  }
  addChannels(id,receivedMessage)
  {
    if(this.allowedChannels.includes(id))
    {
      globalReplyMessage += `${receivedMessage.guild.channels.get(id).name} is already added!`;
      return false;
    }
    if (receivedMessage.guild.channels.get(id) == undefined)
    {
      globalReplyMessage += `I could not find a channel: ${id}`;
      return false;
    }
    this.allowedChannels.push(id) 
    save();
    globalReplyMessage += `Successfully added channel: ${receivedMessage.guild.channels.get(id).name}`;
    return true;
  }
  removeChannels(id,receivedMessage)
  {
    if (receivedMessage.guild.channels.get(id) == undefined)
    {
      globalReplyMessage += `I could not find a channel: ${id}`;
      return false;
    }
    if(!this.allowedChannels.includes(id))
    {
      globalReplyMessage += `${receivedMessage.guild.channels.get(id).name} wasn't an allowedchannel`;
      return false;
    }
    if(id == this.outputChannelId)
    {
      globalReplyMessage += `${receivedMessage.guild.channels.get(id).name}: You cannot remove the bot channel!`;
      return false;
    }
    if(id == this.welcomeChannelId)
    {
      globalReplyMessage += `${receivedMessage.guild.channels.get(id).name}: You cannot remove the welcome channel!`;
      return false;
    }
    this.allowedChannels.splice(this.allowedChannels.indexOf(id),1);
    save();
    globalReplyMessage += `Successfully removed channel: ${receivedMessage.guild.channels.get(id).name}`;
    return true; 
  }
  addAdmins(id,receivedMessage)
  {
    if(this.admins.includes(id))
    {
      globalReplyMessage += `${receivedMessage.guild.members.get(id).displayName} was already an admin!`;
      return false;
    }
    if(receivedMessage.guild.members.get(id) == null || receivedMessage.guild.members.get(id) == undefined)
    {
      globalReplyMessage += `No user with id ${id} could be found on the server!`;
      return false;
    }
    this.admins.push(id);
    save();
    globalReplyMessage += `Successfully added ${receivedMessage.guild.members.get(id).displayName} to admin list`;
    return true;
  }
  removeAdmins(id,receivedMessage)
  {
    if(receivedMessage.guild.members.get(id) == null || receivedMessage.guild.members.get(id) == undefined)
    {
      globalReplyMessage += `No user with id ${id} could be found on the server!`;
      return false;
    }
    if(!this.admins.includes(id))
    {
      globalReplyMessage += `${receivedMessage.guild.members.get(id).displayName} was not an admin!`;
      return false;
    }
    this.admins.splice(this.admins.indexOf(id),1);
    save();
    globalReplyMessage += `Successfully removed ${receivedMessage.guild.members.get(id).displayName} from admin list`;
    return true;
  }
  changeOutputChannel(id,receivedMessage)
  {
    //change bot channel by id
    if (id == this.outputChannelId)
    {
      globalReplyMessage = `This already was the bot channel!`;
      receivedMessage.channel.send(globalReplyMessage);
      return false;
    }
    if (receivedMessage.guild.channels.get(id) == undefined)
    {
      globalReplyMessage = `I could not find this channel`;
      receivedMessage.channel.send(globalReplyMessage);
      return false;
    }
    this.outputChannelId = id;
    save();
    const channelName = receivedMessage.guild.channels.get(id)
    globalReplyMessage = `Successfully changed bot channel to ${channelName}`;
    receivedMessage.channel.send(globalReplyMessage);
    return true;
  }
  changeWelcomeChannel(id,receivedMessage)
  {
    //change bot channel by id
    if (id == this.welcomeChannelId)
    {
      globalReplyMessage = `This already was the welcome channel!`;
      receivedMessage.channel.send(globalReplyMessage);
      return false;
    }
    if (receivedMessage.guild.channels.get(id) == undefined)
    {
      globalReplyMessage = `I could not find this channel`;
      receivedMessage.channel.send(globalReplyMessage);
      return false;
    }
    this.welcomeChannelId = id;
    save();
    const channelName = receivedMessage.guild.channels.get(id)
    globalReplyMessage = `Successfully changed welcome channel to ${channelName}`;
    receivedMessage.channel.send(globalReplyMessage);
    return true;
  }
}

//=====================================================================================
//                              on____ functions 
//=====================================================================================
const onReady = 
{
	//runs these when the bot is booted up
  restOfObjectSetup()
  {
    const servers = Object.getOwnPropertyNames(serverObjectRecipe)
    servers.forEach(id => {
      serverObject[id] = new Server(serverObjectRecipe[id])
    })

  },
  //console.Log() logs the user's name to the console after login
  consoleLog()
  {
    let serverObjectRecipe = {};
    //update serverObject with existing data
    let data = fs.readFileSync(`serverObject.txt`);
    if (data.toString(`utf8`) == ``)
    {
      serverObjectRecipe = {};
    } else
    {
      serverObjectRecipe = JSON.parse(data.toString(`utf8`));
    }
    Object.keys(serverObjectRecipe).forEach(function (server) 
    {
      serverObject[server] = new Server(serverObjectRecipe[server]);
    });

    //stuff that makes the console look nice (might xport this to a log file later)
    console.log(`\n\n=-----------------------------------------------------------=`);
    console.log(`\n                  Smolbot!`);
    console.log(`\n\n=-----------------------------------------------------------=`);
    console.log(`\nInformation will appear here when bot actions are triggered.`);
    console.log(`\n${getTimeStamp()}| Bot loaded successfully`);
    console.log(`\n${getTimeStamp()}| Logged in as ${client.user.tag}!`);
  }
}

const onMessage = 
{
  //initializes the bot with smolbot initialize  _____, where the blanks are ids or names
  initializeSmolbot(receivedMessage)
  {
    // first try with channel ids
    if (receivedMessage.content.search(/[\d]+/g) > -1)
    {
      let initializationServerArray = receivedMessage.content.match(/[\d]+/)//not global 
      let outputChannel = initializationServerArray[0];
      if (receivedMessage.guild.channels.get(outputChannel) == undefined)
      {
        globalReplyMessage = `I could not find a channel with this id`;
        receivedMessage.channel.send(globalReplyMessage);
        receivedMessage.react(xmark);
        return false;
      }
      //create the new server object
      serverObject[receivedMessage.guild.id] = new Server([receivedMessage.guild,outputChannel]);
      save();
      receivedMessage.react(checkmark);
      globalReplyMessage = `Successfully initialized server! Modify settings in the bot channel.`;
      receivedMessage.channel.send(globalReplyMessage);
      return true;
    }
    // then try with channel names
    if (receivedMessage.content.substring(19).search(/^[-A-Za-z]+(=?\b$)/) > -1)
    {
      const initializationServerArray = receivedMessage.content.substring(19).match(/[-A-Za-z]+/gi);
      const outputChannel = initializationServerArray[0];
      const foundOutputChannel = receivedMessage.guild.channels.find(channel => channel.name == outputChannel);
      if (foundOutputChannel == undefined)
      {
        receivedMessage.react(xmark);
        globalReplyMessage = `I could not find a channel with this name`;
        receivedMessage.channel.send(globalReplyMessage);
        return false;
      }
      serverObject[receivedMessage.guild.id] = new Server([receivedMessage.guild,foundOutputChannel.id]);
      save();
      receivedMessage.react(checkmark);
      globalReplyMessage = `Successfully initialized server! Modify settings in the bot channel.`;
      receivedMessage.channel.send(globalReplyMessage);
      return true;
    }
  },
  updateAdmins(receivedMessage, updateSubstring, addorRemoveBoolean)
  {
  //pull out the user ids
      let newServerIds = [];
      globalReplyMessage = `Log:`;
      //regex to find user ids
      if (updateSubstring.search(/^[\d]+/i) > -1)
      {
        newServerIds = updateSubstring.match(/[\d]+/gi);
      } else
      {
        globalReplyMessage = `I could not find any valid user ids in your input!`;
        receivedMessage.channel.send(globalReplyMessage);
        return;
      } 
      //now branch off into yesses and nos
     if(addorRemoveBoolean)
     {
        newServerIds.forEach(serverId => 
        {
          globalReplyMessage += `\n`;
          serverObject[receivedMessage.guild.id].addAdmins(serverId,receivedMessage);
        });
        receivedMessage.channel.send(globalReplyMessage);
        return;
      }  else
      {
        newServerIds.forEach(serverId => 
        {
          globalReplyMessage += `\n`;
          serverObject[receivedMessage.guild.id].removeAdmins(serverId,receivedMessage);
        });
        receivedMessage.channel.send(globalReplyMessage);
          return;
      }
  },
  updateChannels(receivedMessage,updateSubstring,addorRemoveBoolean)
  {
  let newServerIds = [];
      globalReplyMessage = `Log:`;
      // if it's a name, convert it to the id
      if (updateSubstring.search(/^[-a-zA-Z]+/i) > -1)
      {
        const newServerArray = updateSubstring.match(/[-a-zA-Z]+/gi);
        
        newServerArray.forEach(server => 
        {
          let newserver = receivedMessage.guild.channels.find(channel => 
          {
            return channel.name == server;
          });
          if (newserver == null || newserver == undefined)
          {
            globalReplyMessage += `\nI could not find channel by name: ${server}`;
            return;
          }
          newServerIds.push(newserver.id);
        });
      }
      else if (updateSubstring.search(/^[\d]+/i) > -1)
      {
        newServerIds = updateSubstring.match(/[\d]+/gi);
      } else
      {
        globalReplyMessage = `I could not find any valid server ids in your input!`;
        receivedMessage.channel.send(globalReplyMessage);
        return;
      }
      //now branch off into yesses and nos
     if(addorRemoveBoolean)
     {
        newServerIds.forEach(serverId => 
        {
          globalReplyMessage += `\n`;
          serverObject[receivedMessage.guild.id].addChannels(serverId,receivedMessage);
        });
        receivedMessage.channel.send(globalReplyMessage);
        return;
      }  else
      {
        newServerIds.forEach(serverId => 
        {
          globalReplyMessage += `\n`;
          serverObject[receivedMessage.guild.id].removeChannels(serverId,receivedMessage);
          
        });
        receivedMessage.channel.send(globalReplyMessage);
          return;
      }
  },
  //receives message `smolbot ____ ______`etc
  updateSettings(receivedMessage)
  {
    if (receivedMessage.content.search(/^smolbot initialize/i) > -1)
    {
      globalReplyMessage = `Server has already been initialized!`;
      receivedMessage.channel.send(globalReplyMessage);
      return false;
    }
    if (receivedMessage.content.search(/^smolbot toggle/i) > -1)
    {
      let updateSubstring = receivedMessage.content.substring(15);
      globalReplyMessage = ``;
      serverObject[receivedMessage.guild.id].toggle(updateSubstring);
      receivedMessage.channel.send(globalReplyMessage)
      return;
    }
    // add or remove admins
    if (receivedMessage.content.search(/^smolbot admin/i) > -1)
    {
      let updateSubstring = receivedMessage.content.substring(14);
      let addorRemoveBoolean = false;
      if (updateSubstring.search(/^add/i) > -1)
      {
        addorRemoveBoolean = true;
        updateSubstring = updateSubstring.substring(4);
      } else if (updateSubstring.search(/^remove/i) > -1)
      {
        updateSubstring = updateSubstring.substring(7);
      } else 
      {
        globalReplyMessage = `I'm not sure what to do!`;
        receivedMessage.channel.send(globalReplyMessage);
        return;
      }
      onMessage.updateAdmins(receivedMessage, updateSubstring, addorRemoveBoolean);
    }
    if (receivedMessage.content.search(/^smolbot channel/i) > -1)
    {
      // true = add, false = remove
      let addorRemoveBoolean = false;
      let updateSubstring = receivedMessage.content.substring(16);
      //extract add or remove 
      if (updateSubstring.search(/^add/i) > -1)
      {
        addorRemoveBoolean = true;
        updateSubstring = updateSubstring.substring(4);
      } else if (updateSubstring.search(/^remove/i) > -1)
      {
        updateSubstring = updateSubstring.substring(7);
      } else 
      {
        globalReplyMessage = `I'm not sure what to do!`;
        receivedMessage.channel.send(globalReplyMessage);
        return;
      }
      onMessage.updateChannels(receivedMessage, updateSubstring, addorRemoveBoolean);
    }
    if (receivedMessage.content.search(/^smolbot change/i) > -1)
    {
      onMessage.changeStuff(receivedMessage);
    }
    if (receivedMessage.content.search(/^smolbot current info/i) > -1)
    {
      this.showSettings(receivedMessage);
      return true;
    }
    //if it doesn't find anything...
    receivedMessage.react(xmark);
    return false;
  },
  changeStuff(receivedMessage)
  {
  	//change dad cd, botchannel, or welcomechannel
  let messageSubstring = receivedMessage.content.substring(15);
      //change dad cooldown
      if(messageSubstring.search(/^dadcd/i) > -1)
      {
        messageSubstring = messageSubstring.substring(6);
        if(messageSubstring.search(/^[\d]+/) > -1)
        {
          let newcd = [];
          newcd = messageSubstring.match(/^[\d]+/);
          newcd[0] = 1000 * Number(newcd[0]);
          serverObject[receivedMessage.guild.id].dadcd = newcd[0];
          globalReplyMessage = `Dad cooldown changed to ${newcd[0]/1000} seconds`
          receivedMessage.channel.send(globalReplyMessage);
        } else {
          globalReplyMessage = `Invalid change to dad cooldown`;
          receivedMessage.channel.send(globalReplyMessage);
        }
        return;
      }
      //change the botchannel
      if(messageSubstring.search(/^botchannel/i) > -1)
      {
        messageSubstring = messageSubstring.substring(11);
        let foundid;
        //if it's a name, convert to id
        if (messageSubstring.search(/^[-a-zA-Z]/i) > -1)
        {
          let channelName = messageSubstring.match(/^[-a-zA-Z]+/i);
          foundid = receivedMessage.guild.channels.find(channel => channel.name == channelName[0]);
          if (foundid == null || foundid == undefined)
          {
            globalReplyMessage = `I could not find a channel with this name!`;
            receivedMessage.channel.send(globalReplyMessage);
            return;
          }
          foundid = foundid.id;
        } else if (messageSubstring.search(/^[\d]+/i) > -1)
        {
          foundid = messageSubstring.match(/^[\d]+/i);
        } else
        {
          globalReplyMessage = `I could not find a channel with this id!`;
          receivedMessage.channel.send(globalReplyMessage);
          return;
        }
          serverObject[receivedMessage.guild.id].changeOutputChannel(foundid,receivedMessage);
          return;
      }
      //change welcomechannel
      else if(messageSubstring.search(/^welcomechannel/i) > -1)
      {
        let foundid;
        messageSubstring = messageSubstring.substring(15);
        //if it's a name, convert to id
        if (messageSubstring.search(/^[-a-zA-Z]+/i) > -1)
        {
          let channelName = messageSubstring.match(/^[-a-zA-Z]+/i);
          foundid = receivedMessage.guild.channels.find(channel => channel.name ==  channelName[0]);
          if (foundid == null || foundid == undefined)
          {
            globalReplyMessage = `I could not find a channel with this name!`;
            receivedMessage.channel.send(globalReplyMessage);
            return;
          }
          foundid = foundid.id;
        } else if (messageSubstring.search(/^[\d]+/i) > -1)
        {
          foundid = messageSubstring.match(/^[\d]+/i);
        } else
        {
          globalReplyMessage = `I could not find a channel with this id!`;
          receivedMessage.channel.send(globalReplyMessage);
          return;
        }
          serverObject[receivedMessage.guild.id].changeWelcomeChannel(foundid,receivedMessage);
          return;
      } else
      {
        globalReplyMessage = `I'm not sure what you want me to change!`;
        receivedMessage.channel.send(globalReplyMessage);
        return;
      }
  },
  showSettings(receivedMessage)
  { 
    const theServer = serverObject[receivedMessage.guild.id];
    const adminArray = [];
    theServer.admins.forEach(element => 
    {
      adminArray.push(receivedMessage.guild.members.get(element).displayName);
    });
    const channelArray = [];
    theServer.allowedChannels.forEach(element => 
    {
      channelArray.push(receivedMessage.guild.channels.get(element).name);
    });
    const currentBot = receivedMessage.guild.channels.get(theServer.outputChannelId).name;
    let currentWelcome = receivedMessage.guild.channels.get(theServer.welcomeChannelId);
    let currentWelcomeName = `None initialized`;
    if (currentWelcome) currentWelcomeName = currentWelcome.name;
    
    globalReplyMessage = `            ---Current settings---`;
    globalReplyMessage += `\n Nitrobot on: ${theServer.nitrotoggle}`;
    globalReplyMessage += `\n Welcomebot on: ${theServer.welcometoggle}`;
    globalReplyMessage += `\n Dadbot on: ${theServer.dadtoggle}`;
    globalReplyMessage += `\n Dadbot cooldown in ms: ${theServer.dadcd}`;
    globalReplyMessage += `\n\n Current admins: ${adminArray.toString()}`;
    globalReplyMessage += `\n\n Current allowed channels: ${channelArray.toString()}`;
    globalReplyMessage += `\n Current bot channel: ${currentBot}`;
    globalReplyMessage += `\n Current welcome channel: ${currentWelcomeName}`;
    receivedMessage.channel.send(globalReplyMessage);
    return true;
  },
  //nitroemotes repeats a user's message if they don't have nitro and 
  //they used a server animated emote in their message
  nitroEmotes(receivedMessage)
  {
    if(receivedMessage.content.search(`!`) == -1) return;
    let sendmessage = false;
    let substringContent = receivedMessage.content;

    for (let [key, value] of client.emojis) 
    {
      let regexstring = `!${value.name}(?=\\b)`;
      let regexEmoji = new RegExp(regexstring,`gi`);
      if(regexstring.includes('`'))
      {
        console.log(`Warning: Fishy stuff with the regex`);
        return false;
      }     
      if(substringContent.search(regexEmoji) > -1)
      {
        sendmessage = true;
        substringContent = substringContent.replace(regexEmoji,value.toString());
      }
    }
    //and send it
    if(sendmessage)
    {
      substringContent += ` - ${receivedMessage.member.displayName}`;
      return substringContent;
    }
    return false;
  },
  dadJoke(receivedMessage)
  { 
    //internal cd
    if (receivedMessage.createdTimestamp < (serverObject[receivedMessage.guild.id].dadcd + serverObject[receivedMessage.guild.id].lasttriggertime)) return;
    globalReplyMessage = ``;
    const checkThisForDadJoke = receivedMessage.content.toLowerCase();

    //update replyMessage with correct string
    this.dadJokeHelper(receivedMessage,checkThisForDadJoke);

    //ignore blank messages
    if (globalReplyMessage.replace(/\s/g,``) == ``||globalReplyMessage.replace(/\s/g,``) == `Hi`)  return;

    //  prevent this bot/other people from spamming
    if (receivedMessage.author.id == serverObject[receivedMessage.guild.id].lastTriggerUser) return;

    // record the user
    serverObject[receivedMessage.guild.id].lastTriggerUser = receivedMessage.author.id;
    serverObject[receivedMessage.guild.id].lasttriggertime = receivedMessage.createdTimestamp;

    //add the id to the marked messages array
    serverObject[receivedMessage.guild.id].markedArray.push(receivedMessage.id);

    //finally send the messages
    globalReplyMessage += `\nI'm Smolbot`;
    receivedMessage.channel.send(globalReplyMessage);
  },

  //function dadJokeHelper runs through all the tests and updates
  //the replyMessage string for the main function
  dadJokeHelper(receivedMessage,checkThisForDadJoke)
  {
    //local variables
    let runner = false;
    let checkCounter = -1;
    let checks = [`i'm `,`im `,`i’m `,'i`m ',`i is `,`i am `];
    for(let j = 0; j < checks.length; j++)
    {
      if (checkThisForDadJoke.indexOf(checks[j]) == 0)
      {
        runner = true;
        checkCounter = checks[j].length;
      }
    }
    if (runner)
    {
      for(let i = 0; i < checks.length; i++)
      {
        //if there is another `i'm_` OR the last characters are `_im`
        //recut the string at the last instance or return, respectively.
        const lastIndex = checkThisForDadJoke.lastIndexOf(checks[i]);
        const newIMBoolean = (lastIndex > checkCounter);
        if (newIMBoolean)
        {
          checkCounter = checkThisForDadJoke.lastIndexOf(` ${checks[i]}`);
          checkCounter += checks[i].length + 1;
        }

        const lastSubstring = checks[i].substring(0,checks[i].length-1);
        const lastIndexChange = checkThisForDadJoke.lastIndexOf(` ${lastSubstring}`);
        const finalIMVariable = lastIndexChange + checks[i].length
        const finalIMBoolean = (finalIMVariable == checkThisForDadJoke.length);
        if (finalIMBoolean) checkCounter = -1;
      }
    }
    //if received message starts with I'm...
    if (checkCounter > -1)
    {
      //truncate it from the last i'm
      globalReplyMessage = `\nHi ${receivedMessage.content.substring(checkCounter)},`;

      //and cut off the string at the first of the stop characters
      for(let i = 0; i < stopChars.length; i++)
      {
        let stopIndex = globalReplyMessage.indexOf(stopChars[i]);
        if (stopIndex > -1) globalReplyMessage = globalReplyMessage.substring(0,stopIndex);
      }
    }
  },
  setPresence(receivedMessage)
  {
    //set status by saying `set status to ${type} ${message}`
    {
      let statusChange = receivedMessage.content.substring(14);
      let variables = this.setPresenceHelper(statusChange);
      if (variables[3])
      {
        receivedMessage.react(checkmark);
      }
      if (!variables[3]) 
      {
        receivedMessage.react(xmark);
      }
    }
  },
  //setpresencehelper performs the logic behind changing status
  setPresenceHelper(statusChange){
    let successful = false;
    let type = ``;
    let game = ``;
    let url = ``;
    checker = statusChange.toLowerCase();
    if(checker.startsWith(`playing`))
    {
      type = `playing`;
      game = statusChange.substring(8);
      client.user.setActivity(game, { type: `PLAYING`});
      successful = true;
    }
    if(checker.startsWith(`streaming`))
    {
      type = `streaming`;
      let twitchLinkLocation = statusChange.indexOf(`http`);
      if(twitchLinkLocation > 0)
      {
        let twitchLink = statusChange.substring(twitchLinkLocation);
        game = statusChange.substring(10,twitchLinkLocation);
        url = ` ${twitchLink}`;
        client.user.setActivity(game, {
          type: `STREAMING`,
          url: twitchLink
        });
        successful = true;
      }
    }
    if(checker.startsWith(`watching`))
    {
      type = `watching`;
      game = statusChange.substring(9);
      client.user.setActivity(game, { type: `WATCHING` });
      successful = true;
    }
    return [type,game,url,successful];
  },
  //formula: (channel id) + message
  //TO DO: change channel ids when make new server
  // works with nitroemotes
  controlPanel(receivedMessage)
  {
    if (receivedMessage.channel.id == 562860679862812682)
    {
      let sendMessage = ``;
      let sendToHereChannel = receivedMessage.content.substring(0,18);
      let sendToHere;
      sendToHere = client.guilds.find(guild => guild.channels.find(channel => channel.id == sendToHereChannel));
      if(!sendToHere)
      {
        globalReplyMessage = `Could not find this channel!`;
        receivedMessage.channel.send(globalReplyMessage);
        return;
      }
      sendMessage = this.nitroEmotes(receivedMessage);
      if(sendMessage) globalReplyMessage = sendMessage.substring(19);
      else globalReplyMessage = receivedMessage.content.substring(19);
      let sendToHere2 = sendToHere.channels.find(channel => channel.id == sendToHereChannel);
      sendToHere2.send(globalReplyMessage);
    }

  },
  displayEmotes(receivedMessage)
  {
    if (receivedMessage.content.search(/^smolbot display emotes/i) > -1)
    {
      globalReplyMessage = `Available Emotes:\n`;
      for (let [key, value] of client.emojis) 
      {
        globalReplyMessage += value.toString();
        if (globalReplyMessage.length > 1950)
        {
          receivedMessage.channel.send(globalReplyMessage);
          globalReplyMessage = ``;
        }
      }
      receivedMessage.channel.send(globalReplyMessage);
      return true;
    }
    return false;
  }
}
let onServerJoin = 
{
  //function checkForBot issues a notification when a new user
  //joined in the last xxx hours
  checkForBot(member)
  {
      let joinDateTimestamp =  member.user.createdTimestamp;
      let currentTimestamp = today.getTime();
      //total number of ms user has been in discord
      let existTime = currentTimestamp-joinDateTimestamp;
      //now convert that to days
      existTime = existTime/3600000;
      existTime = existTime/24;
      if(existTime < 1)
      {
        globalReplyMessage = `Potential bot warning: This user's account`;
        globalReplyMessage += ` was created in the last 24 hours.`;
        let theChannel = serverObject[member.guild.id].welcomeChannelId;
        let sendToHere = member.guild.channels.find(channel => channel.id === theChannel);
        setTimeout(function(){sendToHere.send(globalReplyMessage)},100);
      }
  },
}
let onMessageDelete = 
{
  //sends a message when a user deletes a marked message
  markedDelete(messageDelete)
  {
    if (serverObject[messageDelete.guild.id].markedArray.includes(messageDelete.id))
    {
      globalReplyMessage =  `Deleting your message because I got you, eh?`;
      messageDelete.channel.send(globalReplyMessage);
    }
  }
}

//=====================================================================================
//                              Other functions 
//=====================================================================================

// function getTimeStamp() returns a string with the current time in PST
// at least it's PST for me (but I am PST so idk)
function getTimeStamp()
{
  today = new Date();
  let date = `${(today.getMonth() + 1)}-${today.getDate()}`;
  //make it proper military time
  let theHour = today.getHours();
  if (theHour < 10) theHour = `0${theHour.toString()}`;
  let theMinute = today.getMinutes();
  if (theMinute < 10) theMinute = `0${theMinute.toString()}`;
  let theSecond = today.getSeconds();
  if (theSecond < 10) theSecond = `0${theSecond.toString()}`;
  let time = `${theHour}:${theMinute}:${theSecond}`;
  let dateTime = `${date} ${time}`;
  return dateTime;
}

// saves the data just in case
function save()
{
  const serverObjecttoString = JSON.stringify(serverObject);
  fs.writeFile(`serverObject.txt`, serverObjecttoString, (err) => 
  {
    if (err) throw err;
    console.log(`Successfully Saved.`);
  });
}