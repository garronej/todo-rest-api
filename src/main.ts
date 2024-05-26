import { z, createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { serve } from "@hono/node-server"
import { createValidateAndDecodeAccessToken } from "./tools/validateAndDecodeAccessToken"
import { HTTPException } from "hono/http-exception";
import { getUserTodoStore } from "./todo";

const oidcIssuer = process.env.OIDC_ISSUER
const oidcClientId = process.env.OIDC_CLIENT_ID

if (oidcIssuer === undefined || oidcClientId === undefined) {
    throw new Error("OIDC_ISSUER and OIDC_CLIENT_ID must be defined in the environment variables")
}

const { validateAndDecodeAccessToken } = createValidateAndDecodeAccessToken({
    oidcIssuer,
    oidcClientId
});


const app = new OpenAPIHono();

{

    const zParam = z.object({
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
    });

    const route = createRoute({
        method: 'put',
        path: '/todo/{id}',
        request: {
            params: zParam,
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

        const { id, text } = c.req.valid("param");

        if (decodedAccessToken === undefined) {
            throw new HTTPException(401);
        }

        getUserTodoStore(decodedAccessToken.sub).addOrUpdate({
            id,
            text,
            isDone: false
        });

        return c.json({
            message: 'Todo item created or updated',
        });

    });


}

{


    const zTodo = z
        .object({
            id: z.string().openapi({
                example: '123',
            }),
            text: z.string().openapi({
                example: 'Clean my room',
            }),
            isDone: z.boolean()
        })
        .openapi('todo');

    const route = createRoute({
        method: 'get',
        path: '/todos',
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: z.array(zTodo),
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

    const zParam = z.object({
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
    });

    const route = createRoute({
        method: 'delete',
        path: '/todo/{id}',
        request: {
            params: zParam,
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
        version: "1.0.2",
        title: 'My API',
    },
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 443

serve({
    fetch: app.fetch,
    port
})

console.log(`\nServer running on port ${port}`)

