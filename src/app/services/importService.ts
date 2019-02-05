import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Http} from "../platform/services/http";
import {Status} from "../types/types";
import {ImportProviderFeaturesByProvider} from "./importService";

@Service("ImportService")
@Singleton
export class ImportService {

    @Inject
    private http: Http;

    private importProviderFeatures: ImportProviderFeaturesByProvider = null;

    async getImportProviderFeatures(): Promise<ImportProviderFeaturesByProvider> {
        if (!this.importProviderFeatures) {
            this.importProviderFeatures = await this.loadImportProviderFeatures();
        }
        return this.importProviderFeatures;
    }

    /**
     * Отправляет файлы на сервер
     * @param provider
     * @param portfolioId
     * @param report
     * @param importRequest
     */
    async importReport(provider: string, portfolioId: string, report: FormData, importRequest: ImportProviderFeatures): Promise<ImportResponse> {
        return this.http.post<ImportResponse>(`/import/${provider}/to/${portfolioId}`, report, importRequest as any, {headers: this.http.importHeaders});
    }

    /**
     * Загружает настройки провайдеров импорта
     */
    private async loadImportProviderFeatures(): Promise<ImportProviderFeaturesByProvider> {
        return await this.http.get<ImportProviderFeaturesByProvider>("/import/providers");
    }
}

/** Форматы поддерживаемых брокеров и отчетов */
export enum DealsImportProvider {
    ALFADIRECT = "ALFADIRECT",
    ITINVEST = "ITINVEST",
    OTKRYTIE = "OTKRYTIE",
    ZERICH = "ZERICH",
    PSBANK = "PSBANK",
    BCS = "BCS",
    BCS_CYPRUS = "BCS_CYPRUS",
    FINAM = "FINAM",
    FREEDOM_FINANCE = "FREEDOM_FINANCE",
    KITFINANCE = "KITFINANCE",
    URALSIB = "URALSIB",
    SBERBANK = "SBERBANK",
    VTB24 = "VTB24",
    INTERACTIVE_BROKERS = "INTERACTIVE_BROKERS",
    TINKOFF = "TINKOFF",
    NETTRADER = "NETTRADER",
    INTELINVEST = "INTELINVEST",
    ATON = "ATON",
    QUIK = "QUIK"
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
export interface ImportProviderFeaturesByProvider {
    [key: string]: ImportProviderFeatures;
}

/** Параметры для импорта отчетов */
export interface ImportProviderFeatures {
    /** Признак создания связанных сделок */
    createLinkedTrade: boolean;
    /** Признак автоматического рассчета комиссии по сделкам */
    autoCommission: boolean;
    /** Призак автоисполнения Событий по сделкам из отчета */
    autoEvents: boolean;
    /** Признак отображения диалога для ввода баланса портфеля после импорта */
    confirmMoneyBalance: boolean;
    /** Признак импорта сделок по денежным средствам */
    importMoneyTrades: boolean;
}