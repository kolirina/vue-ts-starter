import moment from "moment";
import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {ExportService} from "../../services/exportService";
import {PortfolioService} from "../../services/portfolioService";
import {ClientInfo, Portfolio, PortfolioBackup, PortfolioParams, TableHeader} from "../../types/types";
import {DateUtils} from "../../utils/dateUtils";
import {StoreType} from "../../vuex/storeType";
import {Tariff} from "../../types/tariff";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            <v-card>
                <v-card-text>
                    <div class="trades-export-wrapper">
                        <h4 class="display-1">Экспорт сделок</h4>
                        <p>
                            Выгрузите сделки вашего текущего портфеля в csv или json формате.
                            Данный файл содержит полную информацию о всех сделках и является полностью совместимым для обратного импорта в сервис.
                        </p>
                        <v-btn slot="activator" color="primary" @click="downloadFile" :disabled="isDownloadNotAllowed()">
                            Экспорт сделок в csv
                            <v-icon right dark>fas fa-download</v-icon>
                        </v-btn>
                        <!-- На триале и если тариф истек экспортировать сделки нельзя -->
                        <v-tooltip v-if="!isDownloadNotAllowed" bottom>
                            <i slot="activator" class="fa fa-question-circle"/>
                            <span>Экспорт сделок в csv-формат недоступен на TRIAL-плане.
                                Пожалуйства <a href="/tariffs">обновите</a>
                                подписку чтобы иметь возможность экспортировать сделки в csv формат.
                                Или воспользуйтесь экспортом в xlsx.</span>
                        </v-tooltip>

                        <div class="EmptyBox20"></div>

                        <h1>Автоматический бэкап портфеля</h1>
                        <p>Настройте автоматический бэкап портфеля. Файлы выбранных портфелей (в csv формате) будут отравляться на вашу эл почту по заданному расписанию.</p>
                        <div class="EmptyBox20"></div>
                        <v-data-table v-if="portfolios"
                                      :headers="headers"
                                      :items="portfolios"
                                      :search="search"
                                      v-model="selectedPortfolios"
                                      item-key="id"
                                      select-all
                                      class="elevation-1" style="max-width: 1000px">
                            <template slot="headerCell" slot-scope="props">
                                <v-tooltip bottom>
                                    <span slot="activator">
                                      {{ props.header.text }}
                                    </span>
                                    <span>
                                      {{ props.header.text }}
                                    </span>
                                </v-tooltip>
                            </template>
                            <template slot="items" slot-scope="props">
                                <td style="width: 50px">
                                    <v-checkbox v-model="props.selected" primary hide-details></v-checkbox>
                                </td>
                                <td class="text-xs-left">{{ props.item.id }}</td>
                                <td class="text-xs-left">{{ props.item.name }}</td>
                                <td class="text-xs-center">{{ props.item.viewCurrency }}</td>
                            </template>
                        </v-data-table>

                        <v-btn-toggle v-model="selectedDays" multiple dark>
                            <v-btn v-for="day in days" :value="day" :key="day" color="info">
                                {{ day }}
                            </v-btn>
                        </v-btn-toggle>

                        <div class="EmptyBox20"></div>
                        <span>Отправка бэкапов осуществляется по выбранным дням в 9:30 минут.</span>
                        <div class="EmptyBox20"></div>
                        <v-btn color="primary" @click="saveBackupSchedule" :disabled="!clientInfo.user.emailConfirmed || isDownloadNotAllowed()">
                            Сохранить расписание
                            <v-icon right dark>fas fa-save</v-icon>
                        </v-btn>
                        <v-tooltip v-if="!clientInfo.user.emailConfirmed || isDownloadNotAllowed()" bottom>
                            <i slot="activator" class="fa fa-question-circle"/>
                            <span v-if="!clientInfo.user.emailConfirmed">
                                Вам необходимо подтвердить адрес электронной почты чтобы воспользоваться данным функционалом.
                            </span>
                            <span v-if="isDownloadNotAllowed()">Экспорт сделок в csv-формат недоступен на TRIAL-плане.
                                Пожалуйства <a href="/tariffs">обновите</a>
                                подписку чтобы иметь возможность экспортировать сделки в csv формат.
                                Или воспользуйтесь экспортом в xlsx.
                            </span>
                        </v-tooltip>
                    </div>
                </v-card-text>
            </v-card>
        </v-container>
    `
})
export class ExportPage extends UI {

    /** Инофрмация о пользователе */
    @MainStore.Getter
    private clientInfo: ClientInfo;
    /** Текущий портфель */
    @MainStore.Getter
    private portfolio: Portfolio;
    /** Сервис для экспорта портфеля */
    @Inject
    private exportService: ExportService;
    /** Сервис для экспорта портфеля */
    @Inject
    private portfolioService: PortfolioService;
    /** Дни для выбора расписания */
    private days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
    /** Выбранный день по умолчанию */
    private selectedDaysInner = ["Сб"];
    /** Поисковый запрос для поиска по портфелям */
    private search = "";
    /** Список заголовков таблицы */
    private headers: TableHeader[] = [
        {text: "ID", align: "left", value: "id", width: "100"},
        {text: "Название", align: "left", value: "name"},
        {text: "Валюта", align: "center", value: "viewCurrency"}
    ];
    /** Список параметров всех портфелей */
    private selectedPortfolios: PortfolioParams[] = [];
    /** Портфели пользователя */
    private portfolios: PortfolioParams[] = null;
    /** Информация о бэкапе портфеля */
    private portfolioBackup: PortfolioBackup = null;

    /**
     * Инициализация компонента, загрузка портфелей
     * @inheritDoc
     */
    async mounted(): Promise<void> {
        this.portfolios = this.clientInfo.user.portfolios;
        this.portfolioBackup = await this.portfolioService.getPortfolioBackup(this.clientInfo.user.id);
        if (!this.portfolioBackup) {
            this.portfolioBackup = {
                days: [],
                portfolioIds: []
            };
        }
        this.selectedPortfolios = this.portfolios.filter(portfolio => this.portfolioBackup.portfolioIds.includes(portfolio.id));
        this.selectedDaysInner = this.portfolioBackup.days.map(day => day - 2).map(day => this.days[day]);
    }

    /**
     * Отправляет запрос на скачивание файла со сделками в формате csv
     */
    private async downloadFile(): Promise<void> {
        await this.exportService.exportTrades(this.portfolio.id);
    }

    /**
     * Возвращает признак доступности для загрузки файла со сделками
     */
    private isDownloadNotAllowed(): boolean {
        return this.clientInfo.user.tariff === Tariff.TRIAL ||
            (moment().isAfter(DateUtils.parseDate(this.clientInfo.user.paidTill)) && this.clientInfo.user.tariff !== Tariff.FREE);
    }

    /**
     * Сохраняет выбранные настройки расписания
     */
    private async saveBackupSchedule(): Promise<void> {
        const days = this.selectedDaysInner.map(day => this.days.indexOf(day) + 2);
        const portfolioIds = this.selectedPortfolios.map(portfolio => portfolio.id);
        const pb: PortfolioBackup = {id: this.portfolioBackup.id, days, portfolioIds};
        await this.portfolioService.saveOrUpdatePortfolioBackup(this.clientInfo.user.id, pb);
        this.$snotify.success("Настройки бэкапа успешно обновлены");
    }

    private get selectedDays(): string[] {
        return this.selectedDaysInner;
    }

    private set selectedDays(newValue: string[]) {
        if (newValue.length === 0) {
            return;
        }
        this.selectedDaysInner = newValue;
    }
}
