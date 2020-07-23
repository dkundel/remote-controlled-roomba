const fetch = require('node-fetch');

async function addMessageToSync(context, Username, Command, Team) {
  const syncServiceSid = context.SYNC_SERVICE_SID;
  const syncListName = `incomingMessages-${Team}`;

  const client = context.getTwilioClient();
  const syncService = client.sync.services(syncServiceSid);
  const syncList = syncService.syncLists(syncListName);

  try {
    await syncList.fetch();
  } catch (err) {
    await syncService.syncLists.create({
      uniqueName: syncListName,
    });
  }

  return syncList.syncListItems.create({ data: { Username, Command } });
}

async function sendCommandToRoomBot(RoomBotApi, Command) {
  if (!RoomBotApi) {
    return;
  }

  const translatedCommands = {
    forward: 'f',
    backward: 'b',
    clockwise: 'r',
    'counter-clockwise': 'l',
    vacuum: 'v',
  };

  const commandKey = translatedCommands[Command];

  const resp = await fetch(`${RoomBotApi}${commandKey}`);
  console.log(await resp.text());
  return resp;
}

function getInfoFromMemory(Memory) {
  if (!Memory) {
    return;
  }

  Memory = JSON.parse(Memory).twilio;

  if (
    typeof Memory.collected_data === 'undefined' ||
    typeof Memory.collected_data.collect_team_info === 'undefined'
  ) {
    return {};
  }

  const { answers } = Memory.collected_data.collect_team_info;

  console.log(answers);
  let Username = undefined;
  if (answers.Username) {
    Username = answers.Username.answer;
  }

  let Team = undefined;
  if (answers.Team) {
    Team = answers.Team.answer;
    Team = Team.toLowerCase();
  }

  return { Username, Team };
}

function sanitizeUsername(username) {
  if (username) {
    username = username.toLowerCase();
  }

  if (username === 'skip') {
    return '<anon>';
  }

  if (username && username.startsWith('@')) {
    username = username.substr(1);
  }

  return username;
}

exports.handler = async function (context, event, callback) {
  const RoomBotApi = context.ROOMBOT_API;

  let { Command, Memory } = event;

  if (!Memory) {
    return callback(null, {
      actions: [{ redirect: 'task://ask-for-team' }],
    });
  }

  let { Team, Username } = getInfoFromMemory(Memory);
  Username = sanitizeUsername(Username);

  console.log({ Team, Username, Command });
  if (!Command || !Team || !Username) {
    return callback(null, {
      actions: [{ redirect: 'task://ask-for-team' }],
    });
  }

  await Promise.all([
    sendCommandToRoomBot(RoomBotApi, Command),
    addMessageToSync(context, Username, Command, Team),
  ]);

  callback(null, { actions: [{ listen: true }] });
};
