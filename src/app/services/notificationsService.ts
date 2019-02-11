import { Inject, Singleton } from "typescript-ioc";
import { CatchErrors } from "../platform/decorators/catchErrors";
import { Service } from "../platform/decorators/service";
import { ShowProgress } from "../platform/decorators/showProgress";
import { Http } from "../platform/services/http";
import { AssetType } from "../types/assetType";
import { Share } from "../types/types";

@Service("NotificationsService")
@Singleton
export class NotificationsService {
    notifications: NotificationParams[] = null;

    @Inject
    private http: Http;

    async receiveNotifications(): Promise<void> {
        this.notifications = await this.http.get("/notifications");
    }

    @CatchErrors
    @ShowProgress
    async addNotification(params: NotificationParams): Promise<any> {
        const answer: NotificationResponseType = await this.http.post("/notifications", params);
        this.receiveNotifications();
        return answer;
    }

    @CatchErrors
    @ShowProgress
    async editNotification(params: NotificationParams): Promise<any> {
        const answer: NotificationResponseType = await this.http.put("/notifications", params);
        this.receiveNotifications();
        return true;
    }

    @CatchErrors
    @ShowProgress
    async removeNotification(id: number): Promise<any> {
        const answer: NotificationResponseType = await this.http.delete(`/notifications/${id}`);
        this.receiveNotifications();
        return true;
    }

    async getShareById(id: number): Promise<Share> {
        const res: {stock: Share} = await this.http.get(`/market/stock/${id}/info-by-id`);
        return res.stock;
    }
}

export interface NotificationParams {
    id?: number;
    stockId: string;
    sellPrice?: number;
    buyPrice?: number;
    buyVariation?: number;
    sellVariation?: number;
    keywords?: string;
    keyWordsSearchType?: string;
}

export interface NotificationBodyData {
    assetType: AssetType;
    sellPriceChange: boolean;
    sellPrice: string;
    sellVariation: string;
    buyPriceChange: boolean;
    buyPrice: string;
    buyVariation: string;
    news: boolean;
    share: Share;
    keyWordsSearchType: string;
    newsKeyWords: string;
    mainBtnTitle: string;
}

export enum KeyWordsSearchType {
    CONTAINS_ONE = "CONTAINS_ONE",
    CONTAINS_ALL = "CONTAINS_ALL"
}

export enum KeyWordsSearchTypeTitle {
    CONTAINS_ONE = "вхождение любого слова",
    CONTAINS_ALL = "вхождение всех слов"
}

export enum NotificationMessages {
    NO_ID = "Тикер или название компании не выбран!",
    SELL_BLOCK_ERROR = "Заполните цены продажи!",
    BUY_BLOCK_ERROR = "Заполните цены покупки!",
    NEWS_KEYWORDS_ERROR = "Ключевые слова для поиска не заданы!",
    NO_BLOCK_CHOOSEN = "Заполните целевые цены Покупки или Продажи!",
    SUCCESS_ADD = "Уведомление успешно добавлено!",
    SUCCESS_EDIT = "Уведомление успешно изменено!",
    SUCCESS_REMOVE = "Уведомление успешно удалено!",
}

export type NotificationResponseType = {
    errorCode?: string,
    message?: string
    fields?: []
};