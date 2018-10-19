import {Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {HTTP} from "../platform/services/http";
import {Status} from "../types/types";

@Service("ImportService")
@Singleton
export class ImportService {

    /**
     * Отправляет файлы на сервер
     * @param provider
     * @param portfolioId
     * @param report
     */
    async importReport(provider: string, portfolioId: string, report: FormData): Promise<ImportResponse> {
        return (await HTTP.INSTANCE.post(`/import/${provider}/to/${portfolioId}`, report)).data as ImportResponse;
    }
}

export interface ImportResponse {
    /** Сообщение */
    message: string;
    /** Список ошибок валидации сделок */
    errors: DealImportError[];
    /** Описание ошибки, если произошла общая ошибка импорта */
    generalError: string;
    /** Количество успешно импортированных сделок */
    validatedTradesCount: number;
    /** Статус импорта */
    status: Status;
}

export interface DealImportError {
    /** Сообщение валидатора */
    message: string;
    /** Дата сделки */
    dealDate: string;
    /** Тикер бумаги сделки */
    dealTicker: string;
}