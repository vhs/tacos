# Tool Access Control & Operations System

TACOS is a React/NodeJS based solution for managing tool access control in a hack-/makerspace environment.

TACOS provides a standardized solution to centralize registration and access control (lockout) for tools, appliances and others points of access control around a shared workshop.

TACOS allows users to easily activate and use tools, while administrators can easily register and manage access to those tools.

## Usage

TACOS can be run standalone or as a Docker container.

## Config

Start by adding a new config.json file, see config.sample.json for an example.

## OAuth Access

When setting up OAuth providers, the callback set in the provider should be https://<host>/oauth/(github|google|slack)/callback.

For google callbacks you cannot use internal IP addresses however you can use a host name with a valid domain name regardless if
the IP resolves to an internal or external address.

## Docker container

### Docker

`docker run --name tacos -d -v $(pwd)/config/config.json:/app/config/config.json -v $(pwd)/data:/app/data -p 3000:30000 vanhack/tacos`

### Docker Compose

Example docker-compose.yml file:
```
version: "3"

services:
  tacos:
    image: vanhack/tacos
    network_mode: bridge
    container_name: tacos
    environment:
      - LETSENCRYPT_HOST=tacos.example.com
      - VIRTUAL_HOST=tacos.example.com
    volumes:
      - ./config/config.json:/app/config/config.json
      - ./shared:/app/shared
```

## Path Conventions

| _Path_** | _Usage_**|
|---|---|
| backends | Backends (in separate directories) |
| config | Configuration files |
| data | Data files |
| lib | Libraries |
| middleware | Middleware (in separate directories, with _lib_ sub-directories) |

## Development

- Install node.js
- Install modules

For development:
	
    `npx yarn install`

### Testing

If dev dependencies are installed you can run all test cases with

    npm test

## Acknowledgements

Based on original work by garthomite on https://github.com/vhs/vhs-laser-access/

