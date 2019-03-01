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
            <v-card class="notifications-card notifications-card-main">
                <h1 class="notifications-title">
                    Уведомления
                    <img src="img/notification/notifications_icon.png"/>
                </h1>

                <div @click="addNotificationDialog" class="notifications-open-dialog-btn">
                    <v-icon>add</v-icon>
                </div>
            </v-card>

            <v-card v-if="notifications.length === 0" class="notifications-card notifications-card-empty">
            <span>Здесь можно настроить уведомления о дивидендах, о достижении целевых цен на акции,
            а также подписаться на новости интересующих эмитентов. Добавьте первое уведомление, нажав на кнопку “+“ в правом верхнем углу.</span>
            </v-card>

            <v-card v-else class="notifications-card" v-for="notification in notifications" :key="notification.id">
                <div class="notifications-card-header">
                    <div class="notifications-card-header-title">{{notification.share.shortname}}</div>
                    <div class="notifications-card-header-price">
                        Цена
                        <span>{{ getNotificationPrice(notification) }}
                        <i :class="notification.share.currency.toLowerCase()"></i>
                    </span>
                    </div>
                    <div class="notifications-card-header-actions">
                        <img src="img/notification/edit.png" @click="editNotificationDialog(notification)" alt="Edit">
                        <img src="img/notification/remove.png" @click="removeNotificationDialog(notification)" alt="Remove">
                    </div>
                </div>
                <v-layout class="notifications-card-body" row>
                    <v-flex v-if="notification.buyPrice || notification.sellPrice" class="notifications-card-body-prices with-padding">
                        <div v-if="notification.buyPrice">
                            Целевая цена покупки
                            <span class="notifications-card-body-prices-price">{{notification.buyPrice}}</span>
                            <span v-if="notification.buyVariation" class="notifications-card-body-prices-sign">±</span>
                            <span v-if="notification.buyVariation" class="notifications-card-body-prices-variation">{{ notification.buyVariation }}</span>
                            <i class="notifications-card-body-prices-currency" :class="notification.share.currency.toLowerCase()"></i>
                        </div>
                        <div v-if="notification.sellPrice">
                            Целевая цена продажи
                            <span class="notifications-card-body-prices-price">{{notification.sellPrice}}</span>
                            <span v-if="notification.sellVariation" class="notifications-card-body-prices-sign">±</span>
                            <span v-if="notification.sellVariation" class="notifications-card-body-prices-variation">{{ notification.sellVariation }}</span>
                            <i class="notifications-card-body-prices-currency" :class="notification.share.currency.toLowerCase()"></i>
                        </div>
                    </v-flex>
                    <div v-if="hasPriceAndNews(notification)" class="notifications-card-body-line"></div>
                    <v-flex v-if="isNewsNotification(notification)"
                            :class="['notifications-card-body-news', hasPriceAndNews(notification) ? 'with-padding' : '']">
                        <div v-if="notification.keywords">
                            Ключевые слова: <span>{{ notification.keywords }}</span>
                        </div>
                        <div v-if="notification.keywords">
                            Тип слов: <span>{{ searchTypesTitle[notification.keyWordsSearchType] }}</span>
                        </div>
                        <div v-if="!notification.keywords">
                            Вы будете получать уведомления о всех новостях
                        </div>
                    </v-flex>
                    <v-flex v-if="isDividendNotification(notification)" :class="['notifications-card-body-news', hasPriceAndNews(notification) ? 'with-padding' : '']">
                        <div>
                            Уведомление о предстоящих дивидендах
                        </div>
                    </v-flex>
                    <v-flex v-if="isBondEventNotification(notification)" :class="['notifications-card-body-news', hasPriceAndNews(notification) ? 'with-padding' : '']">
                        <div>
                            Уведомление о событиях (Купонные выплаты, амортизация, погашение)
                        </div>
                    </v-flex>
                </v-layout>
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

    async addNotificationDialog(): Promise<void> {
        const result = await new CreateOrEditNotificationDialog().show();
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