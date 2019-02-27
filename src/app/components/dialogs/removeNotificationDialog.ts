import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Notification, NotificationsService} from "../../services/notificationsService";
import {BtnReturn, CustomDialog} from "./customDialog";

@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" persistent max-width="480px">
            <v-card class="remove-notification dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>
                <v-card-title class="headline add-notification-title">Удаление уведомления</v-card-title>

                <div class="notifications-card-header-title">{{data.stock.ticker + " " + data.stock.shortname}}</div>
                <div class="remove-notification-price">
                    Цена
                    <span>{{data.stock.price | amount}}
              <i :class="data.stock.currency.toLowerCase()"></i>
          </span>
                </div>
                <div class="remove-notification-text">
                    <img src="img/notification/blueRemove.png" alt="Remove">
                    <span>Удалить уведомления по этой акции?</span>
                </div>
                <v-card-actions class="btn-group-right">
                    <v-btn @click.native="removeNotification" color="info lighten-2" flat>Удалить</v-btn>
                    <v-btn @click.native="close">Отмена</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `
})
export class RemoveNotificationDialog extends CustomDialog<Notification, BtnReturn> {

    @Inject
    private notificationsService: NotificationsService;

    private async removeNotification(): Promise<void> {
        await this.notificationsService.removeNotification(this.data.id);
        this.$snotify.info("Уведомление успешно удалено");
        this.close(BtnReturn.YES);
    }
}