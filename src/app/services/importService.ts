import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Enum, EnumType, IStaticEnum} from "../platform/enum";
import {Http} from "../platform/services/http";
import {Status} from "../types/types";

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

    /**
     * Сохраняет алиасы бумаг
     */
    private async saveShareAliases(shareAliases: SaveShareAliasesRequest[]): Promise<void> {
        return await this.http.post("/import/share-aliases", shareAliases);
    }
}

/** Форматы поддерживаемых брокеров и отчетов */
@Enum("code")
export class DealsImportProvider extends (EnumType as IStaticEnum<DealsImportProvider>) {

    static readonly SBERBANK = new DealsImportProvider("SBERBANK", "Сбербанк", 400);
    static readonly BCS = new DealsImportProvider("BCS", "БКС", 193);
    static readonly TINKOFF = new DealsImportProvider("TINKOFF", "Тинькофф", 585);
    static readonly PSBANK = new DealsImportProvider("PSBANK", "ПромСвязьБанк", 337);
    static readonly VTB24 = new DealsImportProvider("VTB24", "ВТБ 24", 103);
    static readonly OTKRYTIE = new DealsImportProvider("OTKRYTIE", "Открытие", 304);
    static readonly QUIK = new DealsImportProvider("QUIK", "QUIK", -2);
    static readonly FINAM = new DealsImportProvider("FINAM", "Финам", 487);
    static readonly ALFADIRECT = new DealsImportProvider("ALFADIRECT", "Альфа-директ", 34);
    static readonly URALSIB = new DealsImportProvider("URALSIB", "Уралсиб", 480);
    static readonly KITFINANCE = new DealsImportProvider("KITFINANCE", "КИТфинанс", 189);
    static readonly INTERACTIVE_BROKERS = new DealsImportProvider("INTERACTIVE_BROKERS", "Interactive brokers", 544);
    static readonly ZERICH = new DealsImportProvider("ZERICH", "Церих", 513);
    static readonly BCS_CYPRUS = new DealsImportProvider("BCS_CYPRUS", "BCScyprus", 193);
    static readonly FREEDOM_FINANCE = new DealsImportProvider("FREEDOM_FINANCE", "Freedom Finance", 501);
    static readonly ITINVEST = new DealsImportProvider("ITINVEST", "ITIcapital", 15);
    static readonly ATON = new DealsImportProvider("ATON", "Атон", 45);
    static readonly ALFACAPITAL = new DealsImportProvider("ALFACAPITAL", "Альфа-Капитал", 474);
    static readonly INTELINVEST = new DealsImportProvider("INTELINVEST", "Intelinvest", -1);

    private constructor(public code: string, public description: string, public id: number) {
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
    /** Признак не найденного тикера, только если указан тикер */
    shareNotFound: boolean;
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

/** Информация об алиасе бумаги */
export interface SaveShareAliasesRequest {
    /** Идентификатор алиаса */
    id: string;
    /** Алиас */
    alias: string;
    /** Тикер или исин код бумаги в системе */
    ticker: string;
    /** Валюта бумаги в системе */
    currency: string;
    /** Тип бумаги в системе */
    type: string;
    /** Идентификаторы пользователей утвердивших алиас */
    userIds: string[];
}