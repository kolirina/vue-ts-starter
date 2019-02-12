import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Http} from "../platform/services/http";

@Service("NotificationsService")
@Singleton
export class NotificationsService {

    readonly DIVIDEND_WORDS = "дивиденд, дивиденда, дивиденду, дивидендом, дивиденде, дивиденды, дивидендов, дивидендам, дивидендами, дивидендах";

    readonly PATH = "/notifications";

    @Inject
    private http: Http;

    async getNotifications(): Promise<Notification[]> {
        return this.http.get<Notification[]>(this.PATH);
    }

    async addNotification(notification: Notification): Promise<Notification> {
        return this.http.post<Notification>(this.PATH, notification);
    }

    async editNotification(notification: Notification): Promise<void> {
        await this.http.put<void>(this.PATH, notification);
    }

    async removeNotification(id: number): Promise<void> {
        await this.http.delete<void>(`${this.PATH}/${id}`);
    }
}

export interface Notification {
    id?: number;
    stockId?: number;
    sellPrice?: number;
    buyPrice?: number;
    buyVariation?: number;
    sellVariation?: number;
    keywords?: string;
    keyWordsSearchType?: KeyWordsSearchType;
}

export enum KeyWordsSearchType {
    CONTAINS_ONE = "CONTAINS_ONE",
    CONTAINS_ALL = "CONTAINS_ALL"
}