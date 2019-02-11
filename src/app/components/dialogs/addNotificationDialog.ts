import { Inject } from "typescript-ioc";
import Component from "vue-class-component";
import { NotificationBodyData, NotificationMessages, NotificationParams, NotificationResponseType, NotificationsService } from "../../services/notificationsService";
import { AssetType } from "../../types/assetType";
import { AddAndEditNotificationBody } from "../addAndEditNotificationBody";
import { ShareSearchComponent } from "../shareSearchComponent";
import { CustomDialog } from "./customDialog";

@Component({
  template: `
    <v-dialog v-model="showed" persistent max-width="480px">
      <v-card class="add-notification dialog-wrap">
        <v-icon class="closeDialog" @click.native="close">close</v-icon>
        <v-card-title class="headline add-notification-title">Создание уведомления</v-card-title>

        <add-and-edit-notification-body @mainAction="addNotification" @close="closeDialog" :data="defaultBodyParams">
        </add-and-edit-notification-body>
      </v-card>
    </v-dialog>
  `,
  components: {ShareSearchComponent, AddAndEditNotificationBody}
})
export class AddNotificationDialog extends CustomDialog<any, string> {
  @Inject
  private notificationsService: NotificationsService;

  private defaultBodyParams: NotificationBodyData = {
    assetType: AssetType.STOCK,
    sellPriceChange: false,
    sellPrice: null,
    sellVariation: null,
    buyPriceChange: false,
    buyPrice: null,
    buyVariation: null,
    news: false,
    share: null,
    keyWordsSearchType: null,
    newsKeyWords: null,
    mainBtnTitle: "Добавить"
  };

  private async addNotification(bodyParams: NotificationBodyData): Promise<void> {
    const stockId: string = bodyParams.share.id;
    const reqParams: NotificationParams = {
      stockId: stockId
    };
    let response: NotificationResponseType;

    // Заполнение полей для запроса
    if (bodyParams.sellPriceChange) {
      reqParams.sellPrice = parseInt(bodyParams.sellPrice, 10);
      reqParams.sellVariation = parseInt(bodyParams.sellVariation, 10);
    }

    if (bodyParams.buyPriceChange) {
      reqParams.buyPrice = parseInt(bodyParams.buyPrice, 10);
      reqParams.buyVariation = parseInt(bodyParams.buyVariation, 10);
    }

    if (bodyParams.news) {
      reqParams.keywords = bodyParams.newsKeyWords;
      reqParams.keyWordsSearchType = bodyParams.keyWordsSearchType;
    }

    response = await this.notificationsService.addNotification(reqParams);

    if (response) {
      this.$snotify.success(NotificationMessages.SUCCESS_ADD);
      this.close();
    }
  }

  /*** Для передачи в дочерние элементы. Метод close эммитит событие вверх, поэтому его нельзя передать напрямую. */
  private closeDialog(): void {
    this.close();
  }
}