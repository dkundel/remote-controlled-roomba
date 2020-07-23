const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const simName = process.env.TWILIO_SIM_NAME;
const client = require('twilio')(accountSid, authToken);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const TIMEOUT = 2 * 1000;
const QUEUE_SIZE = 16;

let timerId;
let commandsQueue = [];

const validCommands = new Set(['l', 'r', 'f', 'b', 'v']);

function debug(...args) {
  if (true) {
    console.log(...args);
  }
}

async function sendCommands() {
  const commands = commandsQueue.join('');
  commandsQueue = [];
  debug('🚮 Reset queue');

  debug('🚢 Sending "%s"', commands);
  const cmd = await client.supersim.commands.create({
    sim: simName,
    command: commands,
  });

  console.log('Sent command with ID ' + cmd.sid);
}

async function resetTimerAndSend() {
  if (timerId) {
    debug('|  |  Clearing timer');
    clearTimeout(timerId);
  }

  if (commandsQueue.length === QUEUE_SIZE) {
    debug('|  |  Sending full queue');
    await sendCommands();
    return;
  }

  timerId = setTimeout(async () => {
    debug('====> Clearing scheduled queue');
    await sendCommands();
    timerId = undefined;
  }, TIMEOUT);
  debug('|  |  Timer set');
}

async function addCommand(command) {
  const splitSanitizedCommands = command
    .split()
    .filter((c) => validCommands.has(c));

  if (splitSanitizedCommands.length === 0) {
    return;
  }

  debug('Adding [%s]', splitSanitizedCommands.join(','));
  commandsQueue.push(...splitSanitizedCommands);
  debug('| Queue Size: %d', commandsQueue.length);
  await resetTimerAndSend();
}

module.exports = { addCommand };
