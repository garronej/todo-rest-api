import { createOidcBackend, type ResultOfAccessTokenVerify } from "oidc-spa/backend";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { decodeJwt } from "oidc-spa/tools/decodeJwt";
import { assert, is } from "tsafe/assert";

const zDecodedAccessToken = z.object({
    iss: z.string(),
    sub: z.string()
});

export type DecodedAccessToken = z.infer<typeof zDecodedAccessToken>;

export async function createDecodeAccessToken() {

    const verifyAndDecodeAccessTokenByIssuerUri = new Map<
        string,
        (params: {
            accessToken: string;
        }) => ResultOfAccessTokenVerify<DecodedAccessToken>
    >();

    async function decodeAccessToken(params: {
        authorizationHeaderValue: string | undefined;
    }): Promise<DecodedAccessToken> {
        const { authorizationHeaderValue } = params;

        if (authorizationHeaderValue === undefined) {
            throw new HTTPException(401);
        }

        const accessToken = authorizationHeaderValue.replace(/^Bearer /, "");

        const issuerUri = (() => {
            let decodedAccessToken: unknown;

            try {
                decodedAccessToken = decodeJwt(accessToken);
            } catch {
                throw new HTTPException(401);
            }

            try {
                zDecodedAccessToken.parse(decodedAccessToken);
            } catch {
                throw new HTTPException(401);
            }

            assert(is<DecodedAccessToken>(decodedAccessToken));

            return decodedAccessToken.iss;
        })();

        let verifyAndDecodeAccessToken = verifyAndDecodeAccessTokenByIssuerUri.get(issuerUri);

        if (verifyAndDecodeAccessToken === undefined) {
            try {
                verifyAndDecodeAccessToken = (
                    await createOidcBackend({
                        issuerUri,
                        decodedAccessTokenSchema: zDecodedAccessToken
                    })
                ).verifyAndDecodeAccessToken;
            } catch {
                throw new HTTPException(401);
            }

            verifyAndDecodeAccessTokenByIssuerUri.set(issuerUri, verifyAndDecodeAccessToken);
        }

        const result = verifyAndDecodeAccessToken({
            accessToken
        });

        if (!result.isValid) {
            switch (result.errorCase) {
                case "does not respect schema":
                    assert(false);
                case "invalid signature":
                case "expired":
                    throw new HTTPException(401);
            }
        }

        const { decodedAccessToken } = result;


        return decodedAccessToken;
    }

    return { decodeAccessToken };
}
