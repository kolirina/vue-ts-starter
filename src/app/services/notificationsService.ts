import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Http} from "../platform/services/http";
import {Share, ShareType} from "../types/types";

@Service("NotificationsService")
@Singleton
export class NotificationsService {

    readonly DIVIDEND_WORDS = "дивиденд, дивиденда, дивиденду, дивидендом, дивиденде, дивиденды, дивидендов, дивидендам, дивидендами, дивидендах";

    readonly PATH = "/notifications";

    @Inject
    private http: Http;

    async getNotifications(notificationType: NotificationType = null): Promise<Notification[]> {
        const result = await this.http.get<Notification[]>(`${this.PATH}${notificationType ? `/${notificationType}` : ``}`);
        result.forEach(notification => {
            notification.type = notificationType || (notification.share.shareType === ShareType.STOCK ? NotificationType.stock : NotificationType.bond);
        });
        return result;
    }

    async addNotification(notification: Notification, notificationType: NotificationType): Promise<Notification> {
        return this.http.post<Notification>(`${this.PATH}/${notificationType}`, notification);
    }

    async editNotification(notification: Notification, notificationType: NotificationType): Promise<void> {
        await this.http.put<void>(`${this.PATH}/${notificationType}`, notification);
    }

    async removeNotification(id: number, notificationType: NotificationType): Promise<void> {
        await this.http.delete<void>(`${this.PATH}/${notificationType}/${id}`);
    }
}

export interface Notification {
    id?: number;
    shareId?: number;
    share?: Share;
    sellPrice?: number;
    buyPrice?: number;
    buyVariation?: number;
    sellVariation?: number;
    keywords?: string;
    keyWordsSearchType?: KeyWordsSearchType;
    type?: NotificationType;
}

export enum KeyWordsSearchType {
    CONTAINS_ONE = "CONTAINS_ONE",
    CONTAINS_ALL = "CONTAINS_ALL"
}

export enum NotificationType {
    stock = "stock",
    bond = "bond"
}