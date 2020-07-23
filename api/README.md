# API

This server exposes an API that takes a command, batches it up with previous commands and then sends them to the Roomba using Twilio Super SIM.

## Getting Started

```bash
npm install
cp .env.example .env
# fill in .env file
npm start
```

## Exposed Endpoints

### GET `/api?command=`

This endpoint takes single letter commands as query parameters:

- `v`: vacuum
- `f`: forward
- `b`: backward
- `l`: counter-clockwise
- `r`: clockwise

It will take those and either batch them up to commands of 16 or send whatever is batched up after 2 seconds of idle time. They are sent via Twilio's Super SIM commands to the microcontroller.
