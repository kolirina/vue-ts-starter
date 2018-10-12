import {Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {HTTP} from "../platform/services/http";

@Service("ImportService")
@Singleton
export class ImportService {

    /**
     * Отправляет файлы на сервер
     * @param {string} username
     * @param {string} validTill
     * @returns {Promise<void>}
     */
    async importReport(provider: string, portfolioId: string, report: FormData): Promise<any> {
        return HTTP.INSTANCE.post(`/import/${provider}/to/${portfolioId}`, report);
    }
}