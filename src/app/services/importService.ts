import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Enum, EnumType, IStaticEnum} from "../platform/enum";
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
    async importReport(provider: string, portfolioId: number, files: File[], importRequest: ImportProviderFeatures): Promise<ImportResponse> {
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
@Enum("code")
export class DealsImportProvider extends (EnumType as IStaticEnum<DealsImportProvider>) {

    static readonly SBERBANK = new DealsImportProvider("SBERBANK", "Сбербанк");
    static readonly BCS = new DealsImportProvider("BCS", "БКС");
    static readonly TINKOFF = new DealsImportProvider("TINKOFF", "Тинькофф");
    static readonly PSBANK = new DealsImportProvider("PSBANK", "ПромСвязьБанк");
    static readonly VTB24 = new DealsImportProvider("VTB24", "ВТБ 24");
    static readonly OTKRYTIE = new DealsImportProvider("OTKRYTIE", "Открытие");
    static readonly QUIK = new DealsImportProvider("QUIK", "QUIK");
    static readonly FINAM = new DealsImportProvider("FINAM", "Финам");
    static readonly ALFADIRECT = new DealsImportProvider("ALFADIRECT", "Альфа-директ");
    static readonly URALSIB = new DealsImportProvider("URALSIB", "Уралсиб");
    static readonly KITFINANCE = new DealsImportProvider("KITFINANCE", "КИТфинанс");
    static readonly INTERACTIVE_BROKERS = new DealsImportProvider("INTERACTIVE_BROKERS", "Interactive brokers");
    static readonly ZERICH = new DealsImportProvider("ZERICH", "Церих");
    static readonly BCS_CYPRUS = new DealsImportProvider("BCS_CYPRUS", "BCScyprus");
    static readonly FREEDOM_FINANCE = new DealsImportProvider("FREEDOM_FINANCE", "Freedom Finance");
    static readonly NETTRADER = new DealsImportProvider("NETTRADER", "Nettrader");
    static readonly ITINVEST = new DealsImportProvider("ITINVEST", "ITIcapital");
    static readonly ATON = new DealsImportProvider("ATON", "Атон");
    static readonly INTELINVEST = new DealsImportProvider("INTELINVEST", "Intelinvest");

    private constructor(public code: string, public description: string) {
        super();
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