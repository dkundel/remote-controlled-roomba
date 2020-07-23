# Autopilot

In order to determine which command is being triggered, we are using [Twilio Autopilot](https://www.twilio.com/autopilot).

We'll soon put the training material here but in the meantime checkout the Autopilot docs on how to get started.

## Tasks

In our execution we had the following tasks:

### `reset`

Handles phrases like "reset" or "restart".

```json
{
  "actions": [
    {
      "say": "Your session is reset. Text 'join' to start again"
    }
  ]
}
```

### `ask-for-team`

Handles phrases like "join" or "start"

```json
{
  "actions": [
    {
      "redirect": "<your-deployed-client-url>/ask-for-team"
    }
  ]
}
```

### `commannd-vacuum`

Handles phrases like "vacuum" or "clean"

```json
{
  "actions": [
    {
      "redirect": "<your-deployed-client-url>/incoming-commands?Command=vacuum"
    }
  ]
}
```

### `commannd-clockwise`

Handles phrases like "clockwise" or "right"

```json
{
  "actions": [
    {
      "redirect": "<your-deployed-client-url>/incoming-commands?Command=clockwise"
    }
  ]
}
```

### `commannd-counter-clockwise`

Handles phrases like "counter-clockwise" or "left"

```json
{
  "actions": [
    {
      "redirect": "<your-deployed-client-url>/incoming-commands?Command=counter-clockwise"
    }
  ]
}
```

### `commannd-forward`

Handles phrases like "forward" or "up"

```json
{
  "actions": [
    {
      "redirect": "<your-deployed-client-url>/incoming-commands?Command=forward"
    }
  ]
}
```

### `commannd-backward`

Handles phrases like "backward" or "down"

```json
{
  "actions": [
    {
      "redirect": "<your-deployed-client-url>/incoming-commands?Command=backward"
    }
  ]
}
```

### `welcome`

Triggered automatically by `ask-for-team`

```json
{
  "actions": [
    {
      "say": "Welcome! You can tell the roombot to go 'clockwise', 'counter-clockwise', 'forward' or 'backward'. Send 'vacuum' to toggle the vacuum functionality. Have fun and enjoy CodeLand!"
    },
    {
      "listen": true
    }
  ]
}
```

## Setup

Once you configured and trained your bot, setup the channel webhook URLs for your Twilio phone number or WhatsApp number.
