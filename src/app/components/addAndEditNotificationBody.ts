import Component from "vue-class-component";
import {Prop, UI, Watch} from "../app/ui";
import {KeyWordsSearchType, NotificationBodyData, NotificationMessages} from "../services/notificationsService";
import {Share} from "../types/types";
import {ShareSearchComponent} from "./shareSearchComponent";

@Component({
  template: `
    <div>
      <share-search-component :defaultShare="data.share" :assetType="bodyParams.assetType" @change="onShareSearchChange"></share-search-component>

      <v-switch v-model="bodyParams.buyPriceChange">
        <template slot="label">
          <span>Получать уведомления об изменении цены покупки</span>
          <v-tooltip content-class="add-notification-tooltip-wrap" bottom>
            <sup class="add-notification-tooltip" slot="activator">
              <v-icon>fas fa-info-circle</v-icon>
            </sup>
            <span>
              Для получения уведомлений задайте целевые цены
              и допуск. Например, вы хотите получить уведомление
              для покупки акций SBER про цене 80 рублей. Для этого 
              укажите в “Целевая цена покупки:” 80.
              <br />
              <br />
              Задайте так же допуск цены, например 3, чтобы получать
              уведомления для цен от 80-3=77 рублей. Для покупки акции
              это значение будет просуммированно с целевой ценой.
              Допуск может быть нулевым.

            </span>
          </v-tooltip>
        </template>
      </v-switch>

      <v-expansion-panel :value="[bodyParams.buyPriceChange]" expand>
        <v-expansion-panel-content>
          <div class="add-notification-conditional">
            <div class="add-notification-conditional-block">
              <label for="buyPrice">Целевая цена покупки</label>
              <v-text-field v-model="bodyParams.buyPrice" id="buyPrice"></v-text-field>
            </div>
            <div class="add-notification-conditional-block">
              <label for="buyVariation">Допуск цены покупки</label>
              <v-text-field v-model="bodyParams.buyVariation" id="buyVariation"></v-text-field>
            </div>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-switch v-model="bodyParams.sellPriceChange">
        <template slot="label">
          <span>Получать уведомления об изменении цены продажи</span>
          <v-tooltip content-class="add-notification-tooltip-wrap" bottom>
            <sup class="add-notification-tooltip" slot="activator">
              <v-icon>fas fa-info-circle</v-icon>
            </sup>
            <span>
              Для получения уведомлений задайте целевые цены
              и допуск. Например, вы хотите получить уведомление
              для покупки акций SBER про цене 80 рублей. Для этого 
              укажите в “Целевая цена покупки:” 80.
              <br />
              <br />
              Задайте так же допуск цены, например 3, чтобы получать
              уведомления для цен от 80-3=77 рублей. Для покупки акции
              это значение будет просуммированно с целевой ценой.
              Допуск может быть нулевым.
            </span>
          </v-tooltip>
        </template>
      </v-switch>

      <v-expansion-panel :value="[bodyParams.sellPriceChange]" expand>
        <v-expansion-panel-content>
          <div class="add-notification-conditional">
            <div class="add-notification-conditional-block">
              <label for="sellPrice">Целевая цена покупки</label>
              <v-text-field v-model="bodyParams.sellPrice" id="sellPrice"></v-text-field>
            </div>
            <div class="add-notification-conditional-block">
              <label for="sellVariation">Допуск цены покупки</label>
              <v-text-field v-model="bodyParams.sellVariation" id="sellVariation"></v-text-field>
            </div>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-switch v-model="bodyParams.news">
        <template slot="label">
          <span>Получать уведомления о новостях</span>
          <v-tooltip content-class="add-notification-tooltip-wrap" bottom>
            <sup class="add-notification-tooltip" slot="activator">
              <v-icon>fas fa-info-circle</v-icon>
            </sup>
            <span>
              Вы будет получать письма обо всех корпоративных событиях (сюда относятся новости о публикации отчетности, проведении собраний, о решении собраний, решения о выплате дивидендов, заключение значимых сделок), о которых эмитент должен отчитываться на сайтах раскрытия информации. Вы всегда будете в курсе всех значимых событий.
              <br /><br />
              Новость будет отправлена вам на почту, как только появится новая публикация.
              <br /><br />
              Также вы можете дополнительно настроить ключевые слова, которые должны встречаться в тексте новости. Ключевые слова разделить запятой. Можно задать как слово целиком, так и часть слова.
              <br /><br />
              Доступно два режима поиска слов: будет искаться вхождение всех слов в тексте новости или вхождение любого из ключевых слов. Задавать список ключевых слов не обязательно.
            </span>
          </v-tooltip>
        </template>
      </v-switch>

      <v-expansion-panel :value="[bodyParams.news]" expand>
        <v-expansion-panel-content>
          <div class="add-notification-conditional">
            <div class="add-notification-conditional-block">
              <label for="newsKeyWords">Ключевые слова для поиска</label>
              <v-text-field v-model="bodyParams.newsKeyWords" id="newsKeyWords"></v-text-field>
            </div>
            <div class="add-notification-conditional-block">
              <label for="keyWordsSearchType">Тип поиска слов</label>
              <v-select v-model="bodyParams.keyWordsSearchType" id="keyWordsSearchType" :items="selectParams"></v-select>
            </div>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-card-actions class="btn-group-right">
        <v-btn @click.native="mainAction" class="btn-dialog btn-hover-black">{{bodyParams.mainBtnTitle}}</v-btn>
        <v-btn class="btn-cancel" @click.native="close">Отмена</v-btn>
      </v-card-actions>
    </div>
  `,
  components: {ShareSearchComponent}
})
export class AddAndEditNotificationBody extends UI {
  
  private selectParams: {text: string, value: string}[] = [
    {text: "Вхождение любого слова", value: KeyWordsSearchType.CONTAINS_ONE},
    {text: "Вхождение всех слов", value: KeyWordsSearchType.CONTAINS_ALL}
  ];

  @Prop()
  private data: NotificationBodyData;

  private bodyParams: NotificationBodyData = {...this.data};

  @Watch("data")
  private onDataChange(): void {
    this.bodyParams = this.data;
  }

  private validateFields(): boolean {
    let isThereAnyError: boolean = false;

    // Валидация тикера
    if(!this.bodyParams.share || !this.bodyParams.share.id) {
      this.$snotify.error(NotificationMessages.NO_ID);
      isThereAnyError = true;
    }

    // Валидация активности одного из блоков(продажи или покупки)
    if( !this.bodyParams.sellPriceChange && !this.bodyParams.buyPriceChange ) {
      this.$snotify.error(NotificationMessages.NO_BLOCK_CHOOSEN);
      isThereAnyError = true;
    }

    // Валидация блока продажи
    if(this.bodyParams.sellPriceChange && !(this.bodyParams.sellPrice && this.bodyParams.sellVariation)) {
      this.$snotify.error(NotificationMessages.SELL_BLOCK_ERROR);
      isThereAnyError = true;
    }

    // Валидация блока покупки
    if(this.bodyParams.buyPriceChange && !(this.bodyParams.buyPrice && this.bodyParams.buyVariation)) {
      this.$snotify.error(NotificationMessages.BUY_BLOCK_ERROR);
      isThereAnyError = true;
    }

    // Валидация ключевых слов для новостей
    if(this.bodyParams.news && !(this.bodyParams.newsKeyWords)) {
      this.$snotify.error(NotificationMessages.NEWS_KEYWORDS_ERROR);
      isThereAnyError = true;
    }

    return isThereAnyError;
  }

  private onShareSearchChange(share: Share): void {
    this.bodyParams.share = share;
  }

  private mainAction(): void {
    if(!this.validateFields()) {
      this.$emit("mainAction", this.bodyParams)
    }
  }

  private close(): void {
    this.$emit("close");
  }
}