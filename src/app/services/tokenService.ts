import {Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {HTTP} from "../platform/services/http";

@Service("TokenService")
@Singleton
export class TokenService {

    /**
     * Отправляет запрос на генерацию токена доступа к портфелю
     * @param {string} username
     * @param {string} validTill
     * @returns {Promise<void>}
     */
    async generateToken(username: string, validTill: string): Promise<string> {
        return (await HTTP.INSTANCE.post("/token/share-portfolio", {username, validTill})).data.token;
    }
}

/** Запрос не генерацию токена доступа к портфелю */
export type GenerateTokenRequest = {
    /** username пользователя в системе */
    username: string,
    /** Срок действия токено, до. */
    validTill: string
};
