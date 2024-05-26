import { createValidateKeycloakSignature } from "./validateKeycloakSignature";
import { assert } from "tsafe/assert";
import * as jwtSimple from "jwt-simple";


export type Context = {
    decodedAccessToken: { 
        sub: string; 
        [key: string]: unknown;
    }  | undefined;
};

export function createValidateAndDecodeAccessToken(params: {
    oidcIssuer: string;
}) {
    const { oidcIssuer } = params;

    const match = oidcIssuer.match(/realms\/([^/]+)+\/?$/);

    assert(match !== null, "Only Keycloak supported for the moment");

    const keycloakRealm = match[1];

    const keycloakUrl = oidcIssuer.split("realms/")[0];

    const { validateKeycloakSignature } = createValidateKeycloakSignature({
        url: keycloakUrl,
        realm: keycloakRealm,
    })

    async function validateAndDecodeAccessToken(
        params: {
            authorizationReqHeaderValue: string | undefined
        }
    ): Promise<Context> {

        const { authorizationReqHeaderValue } = params;

        if (!authorizationReqHeaderValue) {
            return {
                decodedAccessToken: undefined
            };
        }

        const accessToken = authorizationReqHeaderValue.split(" ")[1];

        await validateKeycloakSignature?.({ accessToken });

        const decodedAccessToken = jwtSimple.decode(accessToken, "", true)

        assert("sub" in decodedAccessToken, "sub must be present in the access token");

        return { decodedAccessToken };
    }

    return { validateAndDecodeAccessToken };
}
