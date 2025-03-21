
# TODO Rest API

Very basic todo app REST API with oidc and Open API.  
It's published as a docker image: [garronej/todo-rest-api](https://hub.docker.com/r/garronej/todo-rest-api).  
It's purpose is to enable you to have an API to test your OIDC client integration.  

It's up here: https://todo-rest-api.oidc-spa.dev/doc/

Don't use this in production. 
It will just accept any issuerUri present in the iss claim of the JWT access token used as Authorization bearer header.  
If you want a secure example check: [garronej/todo-rest-api](https://github.com/InseeFrLab/todo-rest-api).  

The easier way to deploy it is to use [Railway](https://railway.app/).  
You need to set the following environment variables (example):  

**The port is 8080**

This is a demo with our Keycloak instance, adapt for your own OIDC provider.  

# Development

```bash
git clone https://github.com/garronej/todo-rest-api
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