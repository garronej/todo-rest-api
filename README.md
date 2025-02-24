
# TODO Rest API

Very basic todo app REST API with oidc and Open API.  
It's published as a docker image: [inseefrlab/todo-rest-api](https://hub.docker.com/r/inseefrlab/todo-rest-api).  
It's purpose is to enable you to have an API to test your OIDC client integration.  
It was originally made for: https://github.com/InseeFrLab/vite-insee-starter  

The easier way to deploy it is to use [Railway](https://railway.app/).  
You need to set the following environment variables (example):  

```.env
OIDC_ISSUER_URI=https://auth.code.gouv.fr/auth/realms/playground
OIDC_AUDIENCE=vite-insee-starter
PORT=8080
```

This is a demo with our Keycloak instance, adapt for your own OIDC provider.  

# Development

```bash
git clone https://github.com/InseeFrLab/todo-rest-api
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