import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {BackupPortfolioDialog} from "../../components/dialogs/backupPortfolioDialog";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {ClientInfo} from "../../services/clientService";
import {ExportService, ExportType} from "../../services/exportService";
import {PortfolioParams, PortfolioService} from "../../services/portfolioService";
import {EventType} from "../../types/eventType";
import {CombinedPortfolioParams, Portfolio, PortfolioBackup} from "../../types/types";
import {ExportUtils} from "../../utils/exportUtils";
import {MutationType} from "../../vuex/mutationType";
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
                            <div class="export-page__info-block">
                                Выгрузите сделки вашего текущего портфеля в csv или xlsx формате.
                                <v-tooltip v-if="isDownloadNotAllowed()" content-class="custom-tooltip-wrap" bottom>
                                    <sup class="custom-tooltip" slot="activator">
                                        <v-icon>fas fa-info-circle</v-icon>
                                    </sup>
                                    <span>
                                        Экспорт сделок в csv-формат недоступен на TRIAL-плане.
                                        Пожалуйства <a href="/#/settings/tariffs">обновите</a>
                                        подписку чтобы иметь возможность экспортировать сделки в csv формат.
                                        Или воспользуйтесь экспортом в xlsx.
                                    </span>
                                </v-tooltip>
                                <br>
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
                                    <v-btn color="primary" @click.stop="openBackupDialog" :disabled="!clientInfo.user.emailConfirmed || isDownloadNotAllowed()">
                                        Настроить
                                    </v-btn>
                                    <v-menu v-if="!clientInfo.user.emailConfirmed || isDownloadNotAllowed()" open-on-hover bottom nudge-bottom="12"
                                            content-class="pa-3 bg-white" max-width="400">
                                        <span slot="activator">
                                            <sup class="custom-tooltip"></sup>
                                        </span>
                                        <span v-if="!clientInfo.user.emailConfirmed" class="fs13">
                                            Вам необходимо подтвердить адрес электронной почты чтобы воспользоваться данной функциональностью.
                                        </span>
                                        <span v-if="isDownloadNotAllowed()" class="fs13">Экспорт сделок в csv-формат недоступен на TRIAL-плане.
                                            Пожалуйства <a @click="goToTariffs">обновите</a>
                                            подписку чтобы иметь возможность экспортировать сделки в csv формат.
                                            Или воспользуйтесь экспортом в xlsx.
                                        </span>
                                    </v-menu>
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
    @MainStore.Action(MutationType.RELOAD_CURRENT_PORTFOLIO)
    private reloadPortfolio: () => Promise<void>;
    /** Сервис для экспорта портфеля */
    @Inject
    private exportService: ExportService;
    /** Сервис по работе с портфелями */
    @Inject
    private portfolioService: PortfolioService;
    /** Портфели пользователя */
    private portfolios: PortfolioParams[] = null;
    /** Информация о бэкапе портфеля */
    private portfolioBackup: PortfolioBackup = null;
    /** Типы экспорта таблиц */
    private ExportType = ExportType;

    @ShowProgress
    async created(): Promise<void> {
        this.portfolios = this.clientInfo.user.portfolios;
        await this.loadPortfolioBackup();
        UI.on(EventType.TRADE_CREATED, async () => await this.reloadPortfolio());
    }

    beforeDestroy(): void {
        UI.off(EventType.TRADE_CREATED);
    }

    private goToTariffs(): void {
        this.$router.push("tariffs");
    }

    private async loadPortfolioBackup(): Promise<void> {
        this.portfolioBackup = await this.portfolioService.getPortfolioBackup(this.clientInfo.user.id);
        if (!this.portfolioBackup) {
            this.portfolioBackup = {
                days: [],
                portfolioIds: []
            };
        }
    }

    /**
     * Отправляет запрос на скачивание файла со сделками в формате csv
     */
    @ShowProgress
    private async downloadFile(): Promise<void> {
        if (this.portfolio.id) {
            await this.exportService.exportTrades(this.portfolio.id);
        } else {
            await this.exportService.exportTradesCombined(this.portfolio.portfolioParams.viewCurrency, this.portfolio.portfolioParams.combinedIds);
        }
    }

    private async openBackupDialog(): Promise<void> {
        const portfolioBackup: PortfolioBackup = await new BackupPortfolioDialog().show({portfolios: this.portfolios, portfolioBackup: this.portfolioBackup});
        if (portfolioBackup) {
            await this.saveBackupSchedule(portfolioBackup);
        }
    }

    /**
     * Возвращает признак доступности для загрузки файла со сделками
     */
    private isDownloadNotAllowed(): boolean {
        return ExportUtils.isDownloadNotAllowed(this.clientInfo);
    }

    /**
     * Сохраняет выбранные настройки расписания
     */
    @ShowProgress
    private async saveBackupSchedule(portfolioBackup: PortfolioBackup): Promise<void> {
        await this.portfolioService.saveOrUpdatePortfolioBackup(this.clientInfo.user.id, portfolioBackup);
        await this.loadPortfolioBackup();
        this.$snotify.info("Настройки бэкапа успешно обновлены");
    }

    @ShowProgress
    private async exportPortfolio(): Promise<void> {
        if (this.portfolio.id) {
            await this.exportService.exportReport(this.portfolio.id, ExportType.COMPLEX);
        } else {
            await this.exportService.exportCombinedReport({ids: this.portfolio.portfolioParams.combinedIds, viewCurrency: this.portfolio.portfolioParams.viewCurrency});
        }
    }
}
