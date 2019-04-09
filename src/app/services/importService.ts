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
     * @param files файлы для загрузки
     * @param importRequest
     */
    async importReport(provider: string, portfolioId: string, files: File[], importRequest: ImportProviderFeatures): Promise<ImportResponse> {
        const report = new FormData();
        files.forEach(file => report.append("files", file, file.name));
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
export let DealsImportProvider = [
    {
        id: "SBERBANK",
        name: "Сбербанк"
    },
    {
        id: "BCS",
        name: "БКС"
    },
    {
        id: "TINKOFF",
        name: "Тинькофф"
    },
    {
        id: "PSBANK",
        name: "ПромСвязьБанк"
    },
    {
        id: "VTB24",
        name: "ВТВ24"
    },
    {
        id: "OTKRYTIE",
        name: "Открытие"
    },
    {
        id: "QUIK",
        name: "QUIK"},
    {
        id: "FINAM",
        name: "Финам"
    },
    {
        id: "ALFADIRECT",
        name: "Альфа-директ"
    },
    {
        id: "URALSIB",
        name: "Уралсиб"
    },
    {
        id: "KITFINANCE",
        name: "КИТфинанс"
    },
    {
        id: "INTERACTIVE_BROKERS",
        name: "Interactive brokers"
    },
    {
        id: "ZERICH",
        name: "Церих"
    },
    {
        id: "BCS_CYPRUS",
        name: "BCScyprus"
    },
    {
        id: "FREEDOM_FINANCE",
        name: "Freedom Finance"
    },
    {
        id: "NETTRADER",
        name: "Nettrader"
    },
    {
        id: "ITINVEST",
        name: "ITIcapital"
    },
    {
        id: "ATON",
        name: "Атон"
    },
    {
        id: "INTELINVEST",
        name: "Intelinvest"
    }
];

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