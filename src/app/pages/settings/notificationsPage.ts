import {Inject} from "typescript-ioc";
import {namespace} from "vuex-class/lib/bindings";
import {Component, UI} from "../../app/ui";
import {CreateOrEditNotificationDialog} from "../../components/dialogs/createOrEditNotificationDialog";
import {BtnReturn} from "../../components/dialogs/customDialog";
import {RemoveNotificationDialog} from "../../components/dialogs/removeNotificationDialog";
import {CatchErrors} from "../../platform/decorators/catchErrors";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {Filters} from "../../platform/filters/Filters";
import {Notification, NotificationsService, NotificationType} from "../../services/notificationsService";
import {Bond} from "../../types/types";
import {CommonUtils} from "../../utils/commonUtils";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <div class="notifications">
            <div class="section-title">Уведомления</div>
            <v-card :class="{'notifications-card notifications-card-main': true, 'notifications-card-full': notifications.length !== 0}">
                <div>
                    Здесь будут Ваши настройки уведомлений о дивидендах,<br>
                    достижении целевых цен на акции и облигации, а также<br>
                    о новостях интересующих эмитентов.
                </div>
                <div>Добавьте первое уведомление</div>

                <v-menu transition="slide-y-transition" nudge-bottom="50" nudge-left="10">
                    <v-btn class="big_btn primary" slot="activator">
                        Добавить
                    </v-btn>
                    <v-list dense>
                        <v-list-tile @click="addNotificationDialog(NotificationType.stock)">
                            <v-list-tile-title>
                                По акции
                            </v-list-tile-title>
                        </v-list-tile>
                        <v-list-tile @click="addNotificationDialog(NotificationType.bond)">
                            <v-list-tile-title>
                                По облигации
                            </v-list-tile-title>
                        </v-list-tile>
                    </v-list>
                </v-menu>
            </v-card>


            <v-card v-if="notifications.length !== 0" class="notifications-card" v-for="notification in notifications" :key="notification.id">
                <div class="notifications-card-header">
                    <div class="notifications-card-header-title">{{notification.share.shortname}}</div>
                    <div class="notifications-card-header-price">
                        Цена {{ getNotificationPrice(notification) }}
                        <i :class="notification.share.currency.toLowerCase()"></i>
                    </div>
                    <div class="notifications-card-header-actions">
                        <v-menu transition="slide-y-transition" nudge-bottom="30" nudge-left="10">
                            <div class="notifications-card__menu" slot="activator"></div>
                            <v-list dense>
                                <v-list-tile @click="editNotificationDialog(notification)">
                                    <v-list-tile-title>
                                        Редактировать
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click="removeNotificationDialog(notification)">
                                    <v-list-tile-title>
                                        Удалить
                                    </v-list-tile-title>
                                </v-list-tile>
                            </v-list>
                        </v-menu>
                    </div>
                </div>
                <div class="notifications-card-body">
                    <v-flex v-if="notification.buyPrice || notification.sellPrice" class="notifications-card-body-prices">
                        <div v-if="notification.buyPrice">
                            <div class="notifications-card-body-title w180">Целевая цена покупки</div>
                            <span class="notifications-card-body-prices-price">{{notification.buyPrice}}</span>
                            <span v-if="notification.buyVariation" class="notifications-card-body-prices-sign">±</span>
                            <span v-if="notification.buyVariation" class="notifications-card-body-prices-variation">{{ notification.buyVariation }}</span>
                            <i class="notifications-card-body-prices-currency" :class="notification.share.currency.toLowerCase()"></i>
                        </div>
                        <div v-if="notification.sellPrice">
                            <div class="notifications-card-body-title w180">Целевая цена продажи</div>
                            <span class="notifications-card-body-prices-price">{{notification.sellPrice}}</span>
                            <span v-if="notification.sellVariation" class="notifications-card-body-prices-sign">±</span>
                            <span v-if="notification.sellVariation" class="notifications-card-body-prices-variation">{{ notification.sellVariation }}</span>
                            <i class="notifications-card-body-prices-currency" :class="notification.share.currency.toLowerCase()"></i>
                        </div>
                    </v-flex>
                    <div v-if="hasPriceAndNews(notification)" class="notifications-card-body-line"></div>
                    <v-flex v-if="!isNewsNotification(notification)" class="notifications-card-body-news">
                        <div class="notifications-card-body-title" v-if="notification.keywords">
                            Ключевые слова: <span>{{ notification.keywords }}</span>
                        </div>
                        <div class="notifications-card-body-title" v-if="notification.keywords">
                            Тип слов: <span>{{ searchTypesTitle[notification.keyWordsSearchType] }}</span>
                        </div>
                        <div class="notifications-card-body-title" v-if="!notification.keywords">
                            Вы будете получать уведомления о всех новостях
                        </div>
                    </v-flex>
                    <v-flex v-if="isDividendNotification(notification)" class="notifications-card-body-news">
                        <div>
                            Уведомление о предстоящих дивидендах
                        </div>
                    </v-flex>
                    <v-flex v-if="isBondEventNotification(notification)" :class="['notifications-card-body-news', hasPriceAndNews(notification) ? 'with-padding' : '']">
                        <div>
                            Уведомление о событиях (Купонные выплаты, амортизация, погашение)
                        </div>
                    </v-flex>
                </div>
                <div class="notifications-card-last-notification">
                    <span>Дата последнего уведомления {{ notification.lastNotification }}</span>
                </div>
            </v-card>
        </div>
    `
})
export class NotificationsPage extends UI {

    @Inject
    notificationsService: NotificationsService;

    notifications: Notification[] = [];

    private searchTypesTitle = KeyWordsSearchTypeTitle;

    private NotificationType = NotificationType;

    async created(): Promise<void> {
        await this.loadNotifications();
    }

    async addNotificationDialog(notificationType: NotificationType): Promise<void> {
        const result = await new CreateOrEditNotificationDialog().show({type: notificationType});
        if (result) {
            await this.loadNotifications();
        }
    }

    private async editNotificationDialog(notification: Notification): Promise<void> {
        const result = await new CreateOrEditNotificationDialog().show(notification);
        if (result) {
            await this.loadNotifications();
        }
    }

    private async removeNotificationDialog(notification: Notification): Promise<void> {
        const result = await new RemoveNotificationDialog().show(notification);
        if (result === BtnReturn.YES) {
            await this.loadNotifications();
        }
    }

    @CatchErrors
    @ShowProgress
    private async loadNotifications(): Promise<void> {
        this.notifications = await this.notificationsService.getNotifications();
    }

    private hasPriceAndNews(notification: Notification): boolean {
        return CommonUtils.exists(notification.keywords) && (CommonUtils.exists(notification.buyPrice) || CommonUtils.exists(notification.sellPrice));
    }

    private isDividendNotification(notification: Notification): boolean {
        return CommonUtils.exists(notification.keywords) && notification.keywords === this.notificationsService.DIVIDEND_WORDS;
    }

    private isNewsNotification(notification: Notification): boolean {
        return CommonUtils.exists(notification.keyWordsSearchType) && notification.keywords !== this.notificationsService.DIVIDEND_WORDS;
    }

    private isBondEventNotification(notification: Notification): boolean {
        return notification.type === NotificationType.bond;
    }

    private getNotificationPrice(notification: Notification): string {
        return notification.type === NotificationType.stock ? Filters.formatMoneyAmount(notification.share.price) : Filters.formatNumber((notification.share as Bond).prevprice);
    }
}

export enum KeyWordsSearchTypeTitle {
    CONTAINS_ONE = "вхождение любого слова",
    CONTAINS_ALL = "вхождение всех слов"
}
