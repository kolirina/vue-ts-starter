import dayjs from "dayjs";
import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {BackupPortfolioDialog} from "../../components/dialogs/backupPortfolioDialog";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {ClientInfo} from "../../services/clientService";
import {ExportService, ExportType} from "../../services/exportService";
import {PortfolioParams, PortfolioService} from "../../services/portfolioService";
import {Tariff} from "../../types/tariff";
import {Portfolio, PortfolioBackup, TableHeader} from "../../types/types";
import {DateUtils} from "../../utils/dateUtils";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="clientInfo && clientInfo.user" fluid>
            <v-layout row wrap>
                <v-flex>
                    <v-card flat class="header-first-card">
                        <v-card-title class="header-first-card__wrapper-title">
                            <div class="section-title header-first-card__title-text">Экспорт сделок</div>
                            <v-spacer></v-spacer>
                            <v-menu transition="slide-y-transition" nudge-bottom="37" left>
                                <v-btn class="primary" slot="activator">
                                    Экспорт
                                </v-btn>
                                <v-list dense>
                                    <v-list-tile @click="downloadFile" :disabled="isDownloadNotAllowed()">
                                        <v-list-tile-title>
                                            Экспорт сделок в csv
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile @click="exportPortfolio">
                                        <v-list-tile-title>
                                            Экспорт портфеля в xlsx
                                        </v-list-tile-title>
                                    </v-list-tile>
                                </v-list>
                            </v-menu>
                        </v-card-title>
                    </v-card>

                    <v-card class="export-page" flat>
                        <v-card-text class="export-page__content">
                            <div class="info-block">
                                Выгрузите сделки вашего текущего портфеля в csv или xlsx формате.
                                На триале если тариф истек экспортировать сделки нельзя.
                                <v-tooltip v-if="isDownloadNotAllowed()" content-class="custom-tooltip-wrap" bottom>
                                    <sup class="custom-tooltip" slot="activator">
                                        <v-icon>fas fa-info-circle</v-icon>
                                    </sup>
                                    <span>Экспорт сделок в csv-формат недоступен на TRIAL-плане.
                                Пожалуйства <a href="/#/settings/tariffs">обновите</a>
                                подписку чтобы иметь возможность экспортировать сделки в csv формат.
                                Или воспользуйтесь экспортом в xlsx.</span>
                                </v-tooltip><br>
                                <br>
                                Данный файл содержит полную информацию о всех сделках и является полностью совместимым для обратного импорта в сервис.
                            </div>
                            <div class="export-page__content-backup-wrapper margT20">
                                <div class="fs12-non-opacity margT20">
                                    Настройте автоматический бэкап портфеля
                                </div>
                                <div class="fs14 mw640 margT20">
                                    Настройте автоматический бэкап портфеля. Файлы выбранных портфелей (в csv формате) будут отравляться на вашу эл почту по заданному расписанию.
                                </div>
                                <v-layout align-center class="margT20">
                                    <v-btn color="#EBEFF7" @click.stop="openBackupDialog()" :disabled="!clientInfo.user.emailConfirmed || isDownloadNotAllowed()">
                                        Настроить
                                    </v-btn>
                                    <v-tooltip v-if="!clientInfo.user.emailConfirmed || isDownloadNotAllowed()" content-class="custom-tooltip-wrap" bottom>
                                        <sup class="custom-tooltip" slot="activator">
                                            <v-icon>fas fa-info-circle</v-icon>
                                        </sup>
                                        <span v-if="!clientInfo.user.emailConfirmed" class="fs13">
                                            Вам необходимо подтвердить адрес электронной почты чтобы воспользоваться данным функционалом.
                                        </span>
                                        <span v-if="isDownloadNotAllowed()" class="fs13">Экспорт сделок в csv-формат недоступен на TRIAL-плане.
                                            Пожалуйства <a href="/#/settings/tariffs">обновите</a>
                                            подписку чтобы иметь возможность экспортировать сделки в csv формат.
                                            Или воспользуйтесь экспортом в xlsx.
                                        </span>
                                    </v-tooltip>
                                </v-layout>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-flex>
            </v-layout>
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
    /** Список параметров всех портфелей */
    private selectedPortfolios: PortfolioParams[] = [];
    /** Портфели пользователя */
    private portfolios: PortfolioParams[] = null;
    /** Информация о бэкапе портфеля */
    private portfolioBackup: PortfolioBackup = null;
    /** Типы экспорта таблиц */
    private ExportType = ExportType;

    /**
     * Инициализация компонента, загрузка портфелей
     * @inheritDoc
     */
    @ShowProgress
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
    @ShowProgress
    private async downloadFile(): Promise<void> {
        await this.exportService.exportTrades(this.portfolio.id);
    }

    private async openBackupDialog(): Promise<void> {
        const result = await new BackupPortfolioDialog().show({portfolios: this.portfolios, days: this.days, selectedDaysInner: this.selectedDaysInner,
                                                               selectedPortfolios: this.selectedPortfolios});
        if (result && (result.selectedDaysInner !== this.selectedDays || result.selectedPortfolios !== this.selectedPortfolios)) {
            this.selectedDaysInner = result.selectedDaysInner;
            this.selectedPortfolios = result.selectedPortfolios;
            this.saveBackupSchedule();
        }
    }

    /**
     * Возвращает признак доступности для загрузки файла со сделками
     */
    private isDownloadNotAllowed(): boolean {
        const userTariff = this.clientInfo.user.tariff;
        return userTariff === Tariff.TRIAL || (dayjs().isAfter(DateUtils.parseDate(this.clientInfo.user.paidTill)) && userTariff !== Tariff.FREE);
    }

    /**
     * Сохраняет выбранные настройки расписания
     */
    @ShowProgress
    private async saveBackupSchedule(): Promise<void> {
        const days = this.selectedDaysInner.map(day => this.days.indexOf(day) + 2);
        const portfolioIds = this.selectedPortfolios.map(portfolio => portfolio.id);
        const pb: PortfolioBackup = {id: this.portfolioBackup.id, days, portfolioIds};
        await this.portfolioService.saveOrUpdatePortfolioBackup(this.clientInfo.user.id, pb);
        this.$snotify.info("Настройки бэкапа успешно обновлены");
    }

    @ShowProgress
    private async exportPortfolio(): Promise<void> {
        await this.exportService.exportReport(this.portfolio.id, ExportType.COMPLEX);
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
