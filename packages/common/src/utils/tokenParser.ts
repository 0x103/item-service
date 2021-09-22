import jwtDecode from "jwt-decode";
import { MsgHdrs } from "nats";

interface AirlockJWT {
    uid: string;
    cid: string;
    sub?: string;
    studio?: boolean;
}

export function parseJwtToNats(jwt: string): MsgHdrs {
    if (!jwt) {
        throw new Error("INVALID_JWT");
    }

    const cleanJwt = jwt.replace(/Bearer /g, "");
    const decoded = jwtDecode<AirlockJWT>(cleanJwt);
    const parsedJwt = Object.create(null);

    parsedJwt["studio_id"] = decoded?.cid || "";
    parsedJwt["user_id"] = decoded?.uid || "";
    parsedJwt["username"] = decoded?.sub || "";
    parsedJwt["is_studio"] = String(decoded?.studio) === "true";

    return parsedJwt;
}

export function isStudio(headers: Record<string, unknown>): boolean {
    return headers.is_studio === true;
}
