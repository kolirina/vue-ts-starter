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
    async importReport(provider: string, portfolioId: string, report: FormData, importRequest: ImportRequest): Promise<ImportResponse> {
        return (await HTTP.INSTANCE.post(`/import/${provider}/to/${portfolioId}`, report, {
            params: importRequest
        })).data as ImportResponse;
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

/** Параметры для импорта отчетов */
export interface ImportRequest {
    /** Признак создания связанных сделок */
    linkTrades: boolean;
    /** Признак автоматического рассчета комиссии по сделкам */
    autoCommission: boolean;
    /** Призак автоисполнения Событий по сделкам из отчета */
    autoEvents: boolean;
    /** Признак отображения диалога для ввода баланса портфеля после импорта */
    confirmMoneyBalance: boolean;
}