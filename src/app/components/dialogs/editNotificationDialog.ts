import { Inject } from "typescript-ioc";
import Component from "vue-class-component";
import { CustomDialog } from "./customDialog";
import {KeyWordsSearchType, NotificationMessages, NotificationParams, NotificationResponseType, NotificationsService} from "../../services/notificationsService";

@Component({
  template: `
    <v-dialog v-model="showed" persistent max-width="480px">
      <v-card class="add-notification dialog-wrap">
        <v-icon class="closeDialog" @click.native="close">close</v-icon>
        <v-card-title class="headline add-notification-title">Редактирование уведомления</v-card-title>
      </v-card>
    </v-dialog>
  `
})
export class EditNotificationDialog extends CustomDialog<NotificationParams, string> {
  @Inject
  private notificationsService: NotificationsService;

}