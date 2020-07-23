# Client

This part of the project serves two purposes:

1. It hosts the UI that shows the incoming messages. During CodeLand we embedded these into a widget using StreamElements but you could also use them directly as a browser source.
2. It hosts serveral [Twilio Functions](https://www.twilio.com/functions) that perform various tasks.

## Getting Started

```bash
npm install
cp .env.example .env
# fill in the .env file
npm run build
npm start

# To deploy
npm run deploy
```

## Exposed Endpoints:

### `/index.html`

Receives two query parameters. `team` for either `red` or `blue` team and then `passcode` for the specified passcode from your UI.

### `/ask-for-team` and `/incoming-commands`

Both of these are used to be triggered by Autopilot tasks. One will prompt users for their team color and DEV.to username. The other one will handle an incoming command. You can specify the specific command using the `?Command=` flag. For example:

```
/incoming-commands?Command=clockwise
/incoming-commands?Command=counter-clockwise
/incoming-commands?Command=vacuum
/incoming-commands?Command=forward
/incoming-commands?Command=backward
```

### `/avatar`

Looks up a profile picture based on a DEV username and redirects to it.
