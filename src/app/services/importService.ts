import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Enum, EnumType, IStaticEnum} from "../platform/enum";
import {Http} from "../platform/services/http";
import {Share, Status} from "../types/types";

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
     * Сохраняет алиасы бумаг
     */
    async saveShareAliases(shareAliases: ShareAliasItem[]): Promise<void> {
        const request: SaveShareAliasesRequest[] = shareAliases.map(shareAlias => {
            return {
                alias: shareAlias.alias,
                currency: shareAlias.share.currency,
                ticker: shareAlias.share.ticker,
                type: shareAlias.share.shareType
            } as SaveShareAliasesRequest;
        });
        return this.http.post("/import/share-aliases", request);
    }

    /**
     * Загружает историю импорта
     */
    async importHistory(): Promise<UserImport[]> {
        const result = await this.http.get<UserImportDto[]>("/import/history");
        return result.map(userImport => {
            return {
                ...userImport,
                provider: DealsImportProvider.valueByName(userImport.provider)
            } as UserImport;
        });
    }

    async revertImport(userImportId: number, portfolioId: number): Promise<void> {
        return this.http.post(`/import/revert/${userImportId}/${portfolioId}`);
    }

    /**
     * Загружает настройки провайдеров импорта
     */
    private async loadImportProviderFeatures(): Promise<ImportProviderFeaturesByProvider> {
        return this.http.get<ImportProviderFeaturesByProvider>("/import/providers");
    }
}

const XLS = "xls";
const XLSX = "xlsx";
const XML = "xml";
const CSV = "csv";
const HTML = "html";
const HTM = "htm";

/** Форматы поддерживаемых брокеров и отчетов */
@Enum("code")
export class DealsImportProvider extends (EnumType as IStaticEnum<DealsImportProvider>) {

    static readonly SBERBANK = new DealsImportProvider("SBERBANK", "Сбербанк", 400, [XLS, XLSX, HTML, HTM]);
    static readonly TINKOFF = new DealsImportProvider("TINKOFF", "Тинькофф", 458, [XLS, XLSX]);
    static readonly VTB24 = new DealsImportProvider("VTB24", "ВТБ 24", 103, [XLS, XLSX]);
    static readonly PSBANK = new DealsImportProvider("PSBANK", "ПромСвязьБанк", 337, [XLS, XLSX]);
    static readonly OTKRYTIE = new DealsImportProvider("OTKRYTIE", "Открытие", 304, [XML]);
    static readonly BCS = new DealsImportProvider("BCS", "БКС", 193, [XLS, XLSX]);
    static readonly FINAM = new DealsImportProvider("FINAM", "Финам", 487, [XML]);
    static readonly ALFADIRECT = new DealsImportProvider("ALFADIRECT", "Альфа-директ", 34, [XLS, XLSX, XML]);
    static readonly INTERACTIVE_BROKERS = new DealsImportProvider("INTERACTIVE_BROKERS", "Interactive brokers", 544, [CSV]);
    static readonly URALSIB = new DealsImportProvider("URALSIB", "Уралсиб", 480, [XLS, XLSX]);
    static readonly KITFINANCE = new DealsImportProvider("KITFINANCE", "КИТфинанс", 189, [XLS, XLSX]);
    static readonly ZERICH = new DealsImportProvider("ZERICH", "Церих", 513, [XML]);
    static readonly FREEDOM_FINANCE = new DealsImportProvider("FREEDOM_FINANCE", "Freedom Finance", 501, [XLS, XLSX]);
    static readonly ALFACAPITAL = new DealsImportProvider("ALFACAPITAL", "Альфа-Капитал", 474, [XLS, XLSX]);
    static readonly ATON = new DealsImportProvider("ATON", "Атон", 45, [XML]);
    static readonly ITINVEST = new DealsImportProvider("ITINVEST", "ITIcapital", 15, [CSV]);
    static readonly QUIK = new DealsImportProvider("QUIK", "QUIK", -2, [XLS, XLSX, HTML, HTM]);
    static readonly BCS_CYPRUS = new DealsImportProvider("BCS_CYPRUS", "BCScyprus", 193, [XLS, XLSX]);
    static readonly INTELINVEST = new DealsImportProvider("INTELINVEST", "Intelinvest", -1, [CSV]);

    private constructor(public code: string, public description: string, public id: number, public allowedExtensions: string[]) {
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
    dealDate?: string;
    /** Тикер бумаги сделки */
    dealTicker: string;
    /** Валюта бумаги сделки */
    currency?: string;
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
interface SaveShareAliasesRequest {
    /** Алиас */
    alias: string;
    /** Тикер или исин код бумаги в системе */
    ticker: string;
    /** Валюта бумаги в системе */
    currency: string;
    /** Тип бумаги в системе */
    type: string;
}

export interface ShareAliasItem {
    alias: string;
    currency?: string;
    share: Share;
}

/**  Модель истории пользовательского импорта */
export type UserImportBase = {
    /** Идентификатор истории импорта */
    id: string;
    /** Идентификатор пользователя */
    userId: number;
    /** Статус импорта */
    status: UserLogStatus;
    /** Дата импорта */
    date: string;
    /** Успешно записанное количество сделок */
    savedTradesCount: number;
    /** Признак наличия ошибок при импорте */
    hasErrors: boolean;
    /** Текст критичной ошибки */
    generalError: string;
    /** Имя файла импорта */
    fileName: string;
    /** Состояние истории импорта */
    state: UserImportState;
};

/**  Модель истории пользовательского импорта */
export type UserImportDto = UserImportBase & {
    /** Провайдер импорта */
    provider: string;
};

/**  Модель истории пользовательского импорта */
export type UserImport = UserImportBase & {
    /** Провайдер импорта */
    provider: DealsImportProvider;
};

/**
 * Описание статусов для логгирования пользовательских действий
 * @author nedelko
 * Date 16.10.2018
 */
export enum UserLogStatus {

    SUCCESS = "SUCCESS",
    ERROR = "ERROR",
    WARN = "WARN"
}

export enum UserImportState {
    REVERTED = "REVERTED"
}
