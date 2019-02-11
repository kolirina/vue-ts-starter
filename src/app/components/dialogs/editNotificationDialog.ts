import { Inject } from "typescript-ioc";
import Component from "vue-class-component";
import { NotificationBodyData, NotificationMessages, NotificationParams, NotificationResponseType, NotificationsService} from "../../services/notificationsService";
import { AssetType } from "../../types/assetType";
import { AddAndEditNotificationBody } from "../addAndEditNotificationBody";
import { ShareSearchComponent } from "../shareSearchComponent";
import { CustomDialog } from "./customDialog";

@Component({
  template: `
    <v-dialog v-model="showed" persistent max-width="480px">
      <v-card class="add-notification dialog-wrap">
        <v-icon class="closeDialog" @click.native="close">close</v-icon>
        <v-card-title class="headline add-notification-title">Редактирование уведомления</v-card-title>

        <add-and-edit-notification-body @mainAction="editNotification" @close="closeDialog" :data="defaultBodyParams">
        </add-and-edit-notification-body>
      </v-card>
    </v-dialog>
  `,
  components: {ShareSearchComponent, AddAndEditNotificationBody}
})
export class EditNotificationDialog extends CustomDialog<any, string> {
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
    mainBtnTitle: "Редактировать"
  };

  /** beforeMount т.к. необходимо получение data из метода show, которым был открыт диалог */
  async beforeMount(): Promise<void> {
    const sellPriceChange = this.data.sellPrice ? true : false;
    const sellPrice = this.data.sellPrice || null;
    const sellVariation = this.data.sellVariation || null;
    const buyPriceChange = this.data.buyPrice ? true : false;
    const buyPrice = this.data.buyPrice || null;
    const buyVariation = this.data.buyVariation || null;
    const news = this.data ? true : false;
    const keyWordsSearchType = news ? this.data.keyWordsSearchType : null;
    const newsKeyWords = news ? this.data.keywords : null;
    const share = await this.notificationsService.getShareById(this.data.stockId);

    this.defaultBodyParams = {
      ...this.defaultBodyParams,
      share, sellPriceChange, sellPrice, sellVariation, buyVariation, buyPrice, buyPriceChange, news, keyWordsSearchType, newsKeyWords
    };
  }

  private async editNotification(bodyParams: NotificationBodyData): Promise<void> {
    const stockId: string = bodyParams.share.id;
    const reqParams: NotificationParams = {
      id: this.data.id,
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

    response = await this.notificationsService.editNotification(reqParams);

    if (response) {
      this.$snotify.success(NotificationMessages.SUCCESS_EDIT);
      this.close();
    }
  }

  /*** Для передачи в дочерние элементы. Метод close эммитит событие вверх, поэтому его нельзя передать напрямую. */
  private closeDialog(): void {
    this.close();
  }
}