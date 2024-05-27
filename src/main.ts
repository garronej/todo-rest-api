import { z, createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { serve } from "@hono/node-server"
import { createValidateAndDecodeAccessToken } from "./tools/validateAndDecodeAccessToken"
import { HTTPException } from "hono/http-exception";
import { getUserTodoStore } from "./todo";

const oidcIssuer = process.env.OIDC_ISSUER

console.log(`OIDC_ISSUER: ${oidcIssuer}`);

if (oidcIssuer === undefined ) {
    throw new Error("OIDC_ISSUER must be defined in the environment variables")
}

const { validateAndDecodeAccessToken } = createValidateAndDecodeAccessToken({
    oidcIssuer
});


const app = new OpenAPIHono();

app.use("*", (c, next) => {
    c.header("Access-Control-Allow-Origin", "*"); 
    c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    c.header("Access-Control-Allow-Headers", "Content-Type, Accept");
    return next();
});

{

    const route = createRoute({
        method: 'put',
        path: '/todo/{id}',
        request: {
            params: z.object({
                id: z
                    .string()
                    .min(1)
                    .openapi({
                        param: {
                            name: 'id',
                            in: 'path',
                        },
                        example: '1212121',
                    })
            }),
            query: z.object({
                text: z
                    .string()
                    .min(1)
                    .openapi({
                        param: {
                            name: "text",
                            in: "query",
                        },
                        example: "Clean my room",
                    }),
                isDone: z
                    .boolean()
                    .openapi({
                        param: {
                            name: "isDone",
                            in: "query",
                        },
                        example: false,
                    }),
            })

        },
        responses: {
            200: {
                description: 'Create or update a todo item',
            },
        },
    });

    app.openapi(route, async c => {

        const { decodedAccessToken } = await validateAndDecodeAccessToken({
            authorizationReqHeaderValue: c.req.header("Authorization")
        });

        if (decodedAccessToken === undefined) {
            throw new HTTPException(401);
        }

        const { id } = c.req.valid("param");
        const { text, isDone } = c.req.valid("query");

        getUserTodoStore(decodedAccessToken.sub).addOrUpdate({
            id,
            text,
            isDone
        });

        return c.json({
            message: 'Todo item created or updated',
        });

    });


}

{

    const route = createRoute({
        method: 'get',
        path: '/todos',
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.array(
                            z
                                .object({
                                    id: z.string().openapi({
                                        example: '123',
                                    }),
                                    text: z.string().openapi({
                                        example: 'Clean my room',
                                    }),
                                    isDone: z.boolean().openapi({
                                        example: false,
                                    })
                                })
                                .openapi("Todo")
                        )
                    },
                },
                description: "Get all user's todo",
            },
        },
    });

    app.openapi(route, async c => {

        const { decodedAccessToken } = await validateAndDecodeAccessToken({
            authorizationReqHeaderValue: c.req.header("Authorization")
        });

        if (decodedAccessToken === undefined) {
            throw new HTTPException(401);
        }

        const todos = getUserTodoStore(decodedAccessToken.sub).getAll();

        return c.json(todos);

    });

}

{


    const route = createRoute({
        method: 'delete',
        path: '/todo/{id}',
        request: {
            params: z.object({
                id: z
                    .string()
                    .min(1)
                    .openapi({
                        param: {
                            name: 'id',
                            in: 'path',
                        },
                        example: '1212121',
                    }),
            })
        },
        responses: {
            200: {
                description: 'Deleted a todo item'
            },
        },
    });

    app.openapi(route, async c => {

        const { decodedAccessToken } = await validateAndDecodeAccessToken({
            authorizationReqHeaderValue: c.req.header("Authorization")
        });

        const { id } = c.req.valid("param");

        if (decodedAccessToken === undefined) {
            throw new HTTPException(401);
        }

        getUserTodoStore(decodedAccessToken.sub).remove(id);

        return c.json({
            message: 'Todo item deleted',
        });

    });

}

// The OpenAPI documentation will be available at /doc
app.doc('/doc', {
    openapi: '3.0.0',
    info: {
        version: "1.0.7",
        title: 'My API',
    },
});

if( process.env.PORT === undefined ) {
    throw new Error("PORT must be defined in the environment variables")
}

const port = parseInt(process.env.PORT);

serve({
    fetch: app.fetch,
    port
})

console.log(`\nServer running. OpenAPI documentation available at http://localhost:${port}/doc`)

