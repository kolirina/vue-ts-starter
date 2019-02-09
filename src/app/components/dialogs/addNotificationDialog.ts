import { Inject } from "typescript-ioc";
import Component from "vue-class-component";
import { Watch } from "vue-property-decorator";
import { CustomDialog } from "./customDialog";
import { AssetType } from "../../types/assetType";
import { MarketService } from "../../services/marketService";
import * as moment from "moment";
import { MarketHistoryService } from "../../services/marketHistoryService";
import {KeyWordsSearchType, NotificationMessages, NotificationParams, NotificationResponseType, NotificationsService} from "../../services/notificationsService";
import {MoneyResiduals} from "../../services/portfolioService";
import { BigMoney } from "../../types/bigMoney";
import { Operation } from "../../types/operation";
import {Bond, Share, Stock } from "../../types/types";
import { DateUtils } from "../../utils/dateUtils";

@Component({
  template: `
    <v-dialog v-model="showed" persistent max-width="480px">
      <v-card class="add-notification dialog-wrap">
        <v-icon class="closeDialog" @click.native="close">close</v-icon>
        <v-card-title class="headline add-notification-title"
          >Создание уведомления</v-card-title
        >

        <v-autocomplete
          :items="filteredShares"
          v-model="share"
          @change="onShareSelect"
          @click:clear="onShareClear"
          label="Введите тикер или название компании"
          :loading="shareSearch"
          :no-data-text="notFoundLabel"
          required
          autofocus
          name="share"
          :error-messages="errors.collect('share')"
          :hide-no-data="true"
          :no-filter="true"
          :search-input.sync="searchQuery"
        >
          <template slot="selection" slot-scope="data">
            {{ shareLabelSelected(data.item) }}
          </template>
          <template slot="item" slot-scope="data">
            {{ shareLabelListItem(data.item) }}
          </template>
        </v-autocomplete>

        <v-switch v-model="buyPriceChange">
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

        <v-expansion-panel :value="[buyPriceChange]" expand>
          <v-expansion-panel-content>
            <div class="add-notification-conditional">
              <div class="add-notification-conditional-block">
                <label for="buyPrice">Целевая цена покупки</label>
                <v-text-field v-model="buyPrice" id="buyPrice"></v-text-field>
              </div>
              <div class="add-notification-conditional-block">
                <label for="buyVariation">Допуск цены покупки</label>
                <v-text-field v-model="buyVariation" id="buyVariation"></v-text-field>
              </div>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-switch v-model="sellPriceChange">
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

        <v-expansion-panel :value="[sellPriceChange]" expand>
          <v-expansion-panel-content>
            <div class="add-notification-conditional">
              <div class="add-notification-conditional-block">
                <label for="sellPrice">Целевая цена покупки</label>
                <v-text-field v-model="sellPrice" id="sellPrice"></v-text-field>
              </div>
              <div class="add-notification-conditional-block">
                <label for="sellVariation">Допуск цены покупки</label>
                <v-text-field v-model="sellVariation" id="sellVariation"></v-text-field>
              </div>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-switch v-model="news">
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

        <v-expansion-panel :value="[news]" expand>
          <v-expansion-panel-content>
            <div class="add-notification-conditional">
              <div class="add-notification-conditional-block">
                <label for="newsKeyWords">Ключевые слова для поиска</label>
                <v-text-field v-model="newsKeyWords" id="newsKeyWords"></v-text-field>
              </div>
              <div class="add-notification-conditional-block">
                <label for="keyWordsSearchType">Тип поиска слов</label>
                <v-select v-model="keyWordsSearchType" id="keyWordsSearchType" :items="selectParams"></v-select>
              </div>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-card-actions class="btn-group-right">
          <v-btn @click.native="addNotification" class="btn-dialog btn-hover-black"
            >Добавить</v-btn
          >
          <v-btn class="btn-cancel" @click.native="close">Отмена</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  `
})
export class AddNotificationDialog extends CustomDialog<any, string> {
  @Inject
  private marketService: MarketService;
  @Inject
  private notificationsService: NotificationsService;
  
  private sellPriceChange: boolean = false;
  private sellPrice: string = null;
  private sellVariation: string = null;
  private buyPriceChange: boolean = false;
  private buyPrice: string = null;
  private buyVariation: string = null;
  private news: boolean = false;
  private selectParams: {text: string, value: string}[] = [
    {text: "Вхождение любого слова", value: KeyWordsSearchType.CONTAINS_ONE},
    {text: "Вхождение всех слов", value: KeyWordsSearchType.CONTAINS_ALL}
  ];
  private keyWordsSearchType: string = this.selectParams[0].value;
  private newsKeyWords: string = null;

  @Inject
  private marketHistoryService: MarketHistoryService;

  private notFoundLabel = "Ничего не найдено";

  private assetType = AssetType.STOCK;

  private operation = Operation.BUY;

  private share: Share = null;

  private filteredShares: Share[] = [];

  private date = DateUtils.currentDate();

  private time = DateUtils.currentTime();

  private price: string = null;

  private shareSearch = false;

  private currency = "RUB";

  private searchQuery: string = null;
  /** Текущий объект таймера */
  private currentTimer: number = null;

  private moneyResiduals: MoneyResiduals = null;

  private async addNotification(): Promise<void> {
    if(this.validateFields()) return;

    let stockId = this.share.id;
    let response: NotificationResponseType;
    let params: NotificationParams = {
      stockPriceNotification: {
        stockId,
      },
      stockNewsNotification: null
    };

    // Заполнение полей для запроса
    if (this.sellPriceChange) {
      params.stockPriceNotification.sellPrice = parseInt(this.sellPrice);
      params.stockPriceNotification.sellVariation = parseInt(this.sellVariation);
    }

    if (this.buyPriceChange) {
      params.stockPriceNotification.buyPrice = parseInt(this.buyPrice);
      params.stockPriceNotification.buyVariation = parseInt(this.buyVariation);
    }

    if (this.news) {
      params.stockNewsNotification = {
        stockId,
        keywords: this.newsKeyWords,
        keyWordsSearchType: this.keyWordsSearchType
      };
    }

    response = await this.notificationsService.addNotification(params);

    if(response) {
      this.$snotify.success(NotificationMessages.SUCCESS_ADD);
      this.close();
    }
  }

  private validateFields(): boolean {
    let isThereAnyError: boolean = false;

    // Валидация тикера
    if(!this.share || !this.share.id) {
      this.$snotify.error(NotificationMessages.NO_ID);
      isThereAnyError = true;
    }

    // Валидация активности одного из блоков(продажи или покупки)
    if( !this.sellPriceChange && !this.buyPriceChange ) {
      this.$snotify.error(NotificationMessages.NO_BLOCK_CHOOSEN);
      isThereAnyError = true;
    }

    // Валидация блока продажи
    if(this.sellPriceChange && !(this.sellPrice && this.sellVariation)) {
      this.$snotify.error(NotificationMessages.SELL_BLOCK_ERROR);
      isThereAnyError = true;
    }

    // Валидация блока покупки
    if(this.buyPriceChange && !(this.buyPrice && this.buyVariation)) {
      this.$snotify.error(NotificationMessages.BUY_BLOCK_ERROR);
      isThereAnyError = true;
    }

    // Валидация ключевых слов для новостей
    if(this.news && !(this.newsKeyWords)) {
      this.$snotify.error(NotificationMessages.NEWS_KEYWORDS_ERROR);
      isThereAnyError = true;
    }

    return isThereAnyError;
  }

  @Watch("searchQuery")
  private async onSearch(): Promise<void> {
    clearTimeout(this.currentTimer);
    if (!this.searchQuery || this.searchQuery.length <= 2) {
      this.shareSearch = false;
      return;
    }
    this.shareSearch = true;
    const delay = new Promise(
      (resolve, reject): void => {
        this.currentTimer = setTimeout(async (): Promise<void> => {
          try {
            if (this.assetType === AssetType.STOCK) {
              this.filteredShares = await this.marketService.searchStocks(
                this.searchQuery
              );
            } else if (this.assetType === AssetType.BOND) {
              this.filteredShares = await this.marketService.searchBonds(
                this.searchQuery
              );
            }
            this.shareSearch = false;
          } catch (error) {
            reject(error);
          }
        }, 1000);
      }
    );

    try {
      delay.then(() => {
        clearTimeout(this.currentTimer);
        this.shareSearch = false;
      });
    } catch (error) {
      clearTimeout(this.currentTimer);
      this.shareSearch = false;
      throw error;
    }
  }

  private async onTickerOrDateChange(): Promise<void> {
    if (
      !this.date ||
      !this.share ||
      ![Operation.BUY, Operation.SELL].includes(this.operation)
    ) {
      return;
    }
    const date = DateUtils.parseDate(this.date);
    if (DateUtils.isCurrentDate(date)) {
      this.fillFieldsFromStock(this.share as Stock);
    } else if (DateUtils.isBefore(date)) {
      const stock = (await this.marketHistoryService.getStockHistory(
        this.share.ticker,
        moment(this.date).format("DD.MM.YYYY")
      )).stock;
      this.fillFieldsFromStock(stock);
    }
  }

  private async onShareSelect(share: Share): Promise<void> {
    this.share = share;
    this.fillFieldsFromShare();
    await this.onTickerOrDateChange();
  }

  private fillFieldsFromShare(): void {
    // при очистке поля автокомплита
    if (!this.share) {
      return;
    }
    this.currency = this.share.currency;
    this.fillFieldsFromStock(this.share as Stock);
  }

  private onShareClear(): void {
    this.filteredShares = [];
  }

  private fillFieldsFromStock(stock: Stock): void {
    this.price = new BigMoney(stock.price).amount.toString();
  }

  private shareLabelSelected(share: Share): string {
    if(!share) return null;
    return `${share.ticker} (${share.shortname})`;
  }

  private shareLabelListItem(share: Share): string {
    if(!share) return null;
    if ((share as any) === this.notFoundLabel) {
      return this.notFoundLabel;
    }
    if (this.assetType === AssetType.STOCK) {
      const price = new BigMoney(share.price);
      return `${share.ticker} (${
        share.shortname
      }), ${price.amount.toString()} ${price.currency}`;
    } else if (this.assetType === AssetType.BOND) {
      return `${share.ticker} (${share.shortname}), ${
        (share as Bond).prevprice
      }%`;
    }
    return `${share.ticker} (${share.shortname})`;
  }
}