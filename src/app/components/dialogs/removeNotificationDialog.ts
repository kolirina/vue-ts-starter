import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {DisableConcurrentExecution} from "../../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {BtnReturn, CustomDialog} from "../../platform/dialogs/customDialog";
import {Filters} from "../../platform/filters/Filters";
import {Notification, NotificationsService, NotificationType} from "../../services/notificationsService";
import {Bond} from "../../types/types";

@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px">
            <v-card class="remove-notification dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>
                <v-card-title class="headline add-notification-title">Удаление уведомления</v-card-title>

                <div class="notifications-card-header-title">{{data.share.ticker}} {{data.share.shortname}}</div>
                <div class="remove-notification-price">
                    Цена
                    <span>{{ sharePrice }}
              <i :class="data.type === NotificationType.stock ? data.share.currency.toLowerCase() : 'percent'"></i>
          </span>
                </div>
                <div class="remove-notification-text">
                    <img src="img/notification/blueRemove.png" alt="Remove">
                    <span>Удалить уведомления по этой бумаге?</span>
                </div>
                <v-card-actions class="btn-group-right">
                    <v-btn @click.native="removeNotification" color="primary" light>Удалить</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `
})
export class RemoveNotificationDialog extends CustomDialog<Notification, BtnReturn> {

    @Inject
    private notificationsService: NotificationsService;
    /** Тип уведомления */
    private NotificationType = NotificationType;

    @ShowProgress
    @DisableConcurrentExecution
    private async removeNotification(): Promise<void> {
        await this.notificationsService.removeNotification(this.data.id, this.data.type);
        this.$snotify.info("Уведомление успешно удалено");
        this.close(BtnReturn.YES);
    }

    private get sharePrice(): string {
        return this.data.type === NotificationType.stock ? Filters.formatMoneyAmount(this.data.share.price) : Filters.formatNumber((this.data.share as Bond).prevprice);
    }
}