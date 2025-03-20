
# TODO Rest API

Very basic todo app REST API with oidc and Open API.  
It's published as a docker image: [keycloakify/todo-rest-api](https://hub.docker.com/r/keycloakify/todo-rest-api).  
It's purpose is to enable you to have an API to test your OIDC client integration.  
It was originally made for: https://github.com/keycloakify/oidc-spa examples.  

Don't use this in production. 
It will just accept any issuerUri present in the iss claim of the JWT access token used as Authorization bearer header.  
If you want a secure example check: [keycloakify/todo-rest-api](https://github.com/InseeFrLab/todo-rest-api).  

The easier way to deploy it is to use [Railway](https://railway.app/).  
You need to set the following environment variables (example):  


```.env
PORT=8080
```

This is a demo with our Keycloak instance, adapt for your own OIDC provider.  

# Development

```bash
git clone https://github.com/keycloakify/todo-rest-api
cd todo-rest-api
cp .env.local.sample .env.local
yarn
yarn dev

```

## Stack

- TypeScript
- Node
- Hono
- Zod
- Docker