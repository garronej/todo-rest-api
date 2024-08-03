import { createOidcBackend } from "oidc-spa/backend";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";

export async function createDecodeAccessToken() {

    const oidcIssuerUri = process.env.OIDC_ISSUER

    console.log(`OIDC_ISSUER: ${oidcIssuerUri}`);

    if (oidcIssuerUri === undefined) {
        throw new Error("OIDC_ISSUER must be defined in the environment variables")
    }

    const { verifyAndDecodeAccessToken } = await createOidcBackend({ 
        issuerUri: oidcIssuerUri,
        decodedAccessTokenSchema: z.object({
            sub: z.string(),
        })
    });

    function decodeAccessToken(params: { authorizationHeaderValue: string | undefined; }) {

        const { authorizationHeaderValue } = params;

        if( authorizationHeaderValue === undefined ){
            throw new HTTPException(401);
        }

        const result = verifyAndDecodeAccessToken({ 
            accessToken: authorizationHeaderValue.replace(/^Bearer /, "") 
        });

        if( !result.isValid ){
            switch( result.errorCase ){
                case "does not respect schema":
                    throw new Error(`The access token does not respect the schema ${result.errorMessage}`);
                case "invalid signature":
                case "expired":
                    throw new HTTPException(401);
            }
        }

        return result.decodedAccessToken;

    }

    return { decodeAccessToken };

}