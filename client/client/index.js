import 'regenerator-runtime/runtime';
import SyncClient from 'twilio-sync';
import icons from './icons';

let shouldClear = true;
const NODE_STAY_DURATION = 10000;

const urlParams = new URLSearchParams(window.location.search);
const TEAM = urlParams.has('team') ? urlParams.get('team') : 'blue';
const PASSCODE = urlParams.get('passcode');

const messagesNode = document.querySelector('.messages');
const templateNode = document.querySelector('#messageTemplate');

let syncList;

function scheduleNodeForRemoval(node) {
  if (!shouldClear) {
    return;
  }
  console.log('Scheduling removal');
  const timeoutId = setTimeout(async () => {
    const id = node.dataset.id;
    if (syncList && id) {
      try {
        await syncList.remove(id);
      } catch (err) {
        console.error('Failed to delete node');
      }
    }
    console.log('Removing node');
    console.log(node);
    node.remove();
  }, NODE_STAY_DURATION);
  return timeoutId;
}

function createMessageNode(id, command, username) {
  let iconUrl = icons[command];
  const newNode = templateNode.content.cloneNode(true);

  newNode.querySelector('.message-icon').src = iconUrl;
  newNode.querySelector('.message-body').textContent = command;

  const messageNode = newNode.querySelector('.message');
  messageNode.dataset.id = id;

  const avatarNode = newNode.querySelector('.avatar');
  avatarNode.onload = () => {
    console.log('image loaded');
    avatarNode.onload = undefined;
    avatarNode.onerror = undefined;
    messageNode.classList.remove('hidden');
  };
  avatarNode.onerror = (err) => {
    console.error(err);
    avatarNode.onload = undefined;
    avatarNode.onerror = undefined;
    avatarNode.src = 'https://placehold.it/40';
  };
  avatarNode.src = `/avatar?username=${username}`;

  return messageNode;
}

async function addNewMessage(id, command, username) {
  const newNode = await createMessageNode(id, command, username);
  const appendedNode = messagesNode.appendChild(newNode);
  scheduleNodeForRemoval(appendedNode);
}

function configureTeamView(team) {
  document.getElementById('teamName').textContent = `Team ${
    team === 'red' ? 'Red' : 'Blue'
  }`;
  document.querySelector('main').classList.add(`team-${team}`);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getSyncInfo(team) {
  const resp = await fetch(`/sync-token?passcode=${PASSCODE}`);
  const data = await resp.json();
  return { ...data, list: `${data.list}-${team}` };
}

async function getAllItems(syncList) {
  let page = await syncList.getItems({ from: 0 });
  let items = [...page.items];

  while (page.hasNextPage) {
    page = await page.nextPage();
    items = [...items, ...page.items];
  }

  return items;
}

async function run(team) {
  console.log('Getting token');
  const { token, list, shouldRemoveMessages } = await getSyncInfo(team);
  shouldClear = shouldRemoveMessages;

  const syncClient = new SyncClient(token);

  syncList = await syncClient.list(list);
  syncList.on('itemAdded', async ({ item }) => {
    const { Command, Username } = item.value;
    const id = item.index;
    await addNewMessage(id, Command, Username);
  });

  const existingItems = await getAllItems(syncList);
  for (const item of existingItems) {
    const { Command, Username } = item.value;
    const id = item.index;
    await addNewMessage(id, Command, Username);
  }
}

configureTeamView(TEAM);
run(TEAM).catch(console.error);
