import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Http} from "../platform/services/http";
import {CatchErrors} from "../platform/decorators/catchErrors";
import {ShowProgress} from "../platform/decorators/showProgress";

@Service("NotificationsService")
@Singleton
export class NotificationsService {

    @Inject
    private http: Http;

    notifications: NotificationParams[] = null;

    async receiveNotifications(): Promise<void> {
        this.notifications = await this.http.get("/notifications");
    }

    @CatchErrors
    @ShowProgress
    async addNotification(params: NotificationParams): Promise<any> {
        let answer: NotificationResponseType = await this.http.post("/notifications", params);
        this.receiveNotifications();
        return answer;
    }
}

export interface NotificationParams {
    stockPriceNotification: NotificationPriceParams,
    stockNewsNotification?: NotificationNewsParams,
};

export interface NotificationPriceParams {
    stockId: string;
    sellPrice?: number;
    buyPrice?: number;
    buyVariation?: number;
    sellVariation?: number;
}

export interface NotificationNewsParams {
    stockId: string;
    keywords: string;
    keyWordsSearchType: string;
}

export enum KeyWordsSearchType {
    CONTAINS_ONE = "CONTAINS_ONE",
    CONTAINS_ALL = "CONTAINS_ALL"
};

export enum KeyWordsSearchTypeTitle {
    CONTAINS_ONE = "вхождение любого слова",
    CONTAINS_ALL = "вхождение всех слов"
};

export enum NotificationMessages {
    NO_ID = "Тикер или название компании не выбран!",
    SELL_BLOCK_ERROR = "Заполните цены продажи!",
    BUY_BLOCK_ERROR = "Заполните цены покупки!",
    NEWS_KEYWORDS_ERROR = "Ключевые слова для поиска не заданы!",
    NO_BLOCK_CHOOSEN = "Заполните целевые цены Покупки или Продажи!",
    SUCCESS_ADD = "Уведомление успешно добавлено!"
}

export type NotificationResponseType = {
    errorCode?: string,
    message?: string
    fields?: []
}