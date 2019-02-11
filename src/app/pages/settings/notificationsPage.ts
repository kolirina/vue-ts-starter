import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {ClientInfo} from "../../services/clientService";
import {StoreType} from "../../vuex/storeType";
import {AddNotificationDialog} from "../../components/dialogs/addNotificationDialog";
import {KeyWordsSearchTypeTitle, NotificationParams, NotificationsService} from "../../services/notificationsService";
import {EditNotificationDialog} from "../../components/dialogs/editNotificationDialog";
import {RemoveNotificationDialog} from "../../components/dialogs/removeNotificationDialog";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
    <div class="notifications">
        <v-card class="notifications-card notifications-card-main">
            <h1 class="notifications-title">
                Уведомления
                <img src="img/notification/notifications_icon.png" />
            </h1>

            <div @click="addNotificationDialog" class="notifications-open-dialog-btn">
                <v-icon>add</v-icon>
            </div>
        </v-card>

        <v-card v-if="!notificationsService.notifications" class="notifications-card notifications-card-empty">
            <span>Здесь можно настроить уведомления о дивидендах, о достижении целевых цен на акции, а также подписаться на новости интересующих эмитентов. Добавьте первое уведомление, нажав на кнопку “+“ в правом верхнем углу.</span>
        </v-card>

        <v-card v-else class="notifications-card" v-for="notification in notificationsService.notifications" :key="notification.id">
            <div class="notifications-card-header">
                <div class="notifications-card-header-title">{{notification.stock.shortname}}</div>
                <div class="notifications-card-header-price">
                    Цена 
                    <span>{{notification.stock.price | amount}} 
                        <i :class="notification.stock.currency.toLowerCase()"></i>
                    </span>
                </div>
                <div class="notifications-card-header-actions">
                    <img src="img/notification/edit.png" @click="editNotificationDialog(notification)" alt="Edit">
                    <img src="img/notification/remove.png" @click="removeNotificationDialog(notification)" alt="Remove">
                </div>
            </div>
            <v-layout class="notifications-card-body" row>
                <v-flex class="notifications-card-body-prices with-padding">
                    <div v-if="notification.buyPrice">
                        Целевая цена покупки
                        <span class="notifications-card-body-prices-price">{{notification.buyPrice}}</span>
                        <span class="notifications-card-body-prices-sign">±</span>
                        <span class="notifications-card-body-prices-variation">{{notification.buyVariation}}</span>
                        <i class="notifications-card-body-prices-currency" :class="notification.stock.currency.toLowerCase()"></i>
                    </div>
                    <div v-if="notification.sellPrice">
                        Целевая цена продажи
                        <span class="notifications-card-body-prices-price">{{notification.sellPrice}}</span>
                        <span class="notifications-card-body-prices-sign">±</span>
                        <span class="notifications-card-body-prices-variation">{{notification.sellVariation}}</span>
                        <i class="notifications-card-body-prices-currency" :class="notification.stock.currency.toLowerCase()"></i>
                    </div>
                </v-flex>
                <div v-if="notification.keywords" class="notifications-card-body-line"></div>
                <v-flex v-if="notification.keywords" class="notifications-card-body-news with-padding">
                    <div>
                        Ключевые слова: <span>{{notification.keywords}}</span>
                    </div>
                    <div>
                        Тип слов: <span>{{searchTypesTitle[notification.keyWordsSearchType]}}</span>
                    </div>
                </v-flex>
            </v-layout>
            <div class="notifications-card-last-notification">
                <span>Дата последнего уведомления {{notification.lastNotification}}</span>
            </div>
        </v-card>
    </div>
    `
})
export class NotificationsPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;

    @Inject
    notificationsService: NotificationsService;

    private searchTypesTitle = KeyWordsSearchTypeTitle;
    
    /** Создан для того, чтобы свойство notificationsService.notifications стало реактивным. */
    notifications: NotificationParams[] = this.notificationsService.notifications;

    async mounted() {
        await this.notificationsService.receiveNotifications();
    }

    async addNotificationDialog(): Promise<void> {
        await new AddNotificationDialog().show();
    }

    private async editNotificationDialog(notification: NotificationParams) {
        await new EditNotificationDialog().show(notification);
    }
    
    private async removeNotificationDialog(notification: NotificationParams) {
        await new RemoveNotificationDialog().show(notification);
    }

}