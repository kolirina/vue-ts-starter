/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2020
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2020
 */

import dayjs from "dayjs";
import {Inject} from "typescript-ioc";
import {RawLocation, Route} from "vue-router";
import {Vue} from "vue/types/vue";
import {namespace} from "vuex-class/lib/bindings";
import {Component, UI} from "../../../app/ui";
import {DisableConcurrentExecution} from "../../../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../../../platform/decorators/showProgress";
import {ClientInfo} from "../../../services/clientService";
import {ExportService, ExportType} from "../../../services/exportService";
import {DealsImportProvider} from "../../../services/importService";
import {IisType, PortfolioAccountType, PortfolioParams, PortfolioService} from "../../../services/portfolioService";
import {Currency} from "../../../types/currency";
import {EventType} from "../../../types/eventType";
import {CommonUtils} from "../../../utils/commonUtils";
import {DateFormat, DateUtils} from "../../../utils/dateUtils";
import {ExportUtils} from "../../../utils/exportUtils";
import {MutationType} from "../../../vuex/mutationType";
import {StoreType} from "../../../vuex/storeType";
import {PortfolioManagementGeneralTab} from "./portfolioManagementGeneralTab";
import {PortfolioManagementIntegrationTab} from "./portfolioManagementIntegrationTab";
import {PortfolioManagementShareTab} from "./portfolioManagementShareTab";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid class="page-wrapper">
            <v-card flat class="header-first-card">
                <v-card-title class="header-first-card__wrapper-title">
                    <div class="section-title header-first-card__title-text">{{ isNew ? "Добавление портфеля" : "Управление портфелями" }}</div>
                </v-card-title>
            </v-card>
            <v-layout v-if="portfolio" class="profile" column>
                <div v-if="!isNew" class="card__header">
                    <div class="card__header-title">
                        <div :class="['provider__image', selectedBroker?.code.toLowerCase()]"></div>
                        <div class="margRAuto">
                            <span>{{ portfolio.name }}</span>
                            <div @click="goBack" class="back-btn">Назад</div>
                        </div>
                    </div>
                    <v-menu transition="slide-y-transition" bottom left nudge-bottom="36">
                        <v-btn slot="activator">Экспорт</v-btn>
                        <v-list class="card__header-menu">
                            <v-list-tile @click="downloadFile" :disabled="downloadNotAllowed">
                                <v-list-tile-title>
                                    Экспорт в csv
                                </v-list-tile-title>
                            </v-list-tile>
                            <v-list-tile @click="exportPortfolio">
                                <v-list-tile-title>
                                    Экспорт в xlsx
                                </v-list-tile-title>
                            </v-list-tile>
                        </v-list>
                    </v-menu>
                </div>
                <v-tabs v-if="!isNew" v-model="currentTab" class="portfolio-management-tabs">
                    <v-tab :class="{'active': 0 === currentTab}">Общие настройки</v-tab>
                    <v-tab :class="{'active': 1 === currentTab}">Публичный доступ</v-tab>
                    <v-tab :class="{'active': 2 === currentTab}">Интеграция</v-tab>
                    <v-tab-item>
                        <portfolio-management-general-tab :portfolio="portfolio"></portfolio-management-general-tab>
                    </v-tab-item>
                    <v-tab-item>
                        <portfolio-management-share-tab :portfolio="portfolio"></portfolio-management-share-tab>
                    </v-tab-item>
                    <v-tab-item>
                        <portfolio-management-integration-tab :portfolio="portfolio"></portfolio-management-integration-tab>
                    </v-tab-item>
                </v-tabs>
                <template v-if="isNew">
                    <div class="portfolio-management-tab__title margB8">Общая информация</div>
                    <portfolio-management-general-tab :portfolio="portfolio"></portfolio-management-general-tab>
                </template>
                <v-card-actions v-if="currentTab !== 2">
                    <v-btn :loading="processState" :disabled="!isValid || processState" color="primary" light @click.stop.native="savePortfolio">
                        {{ isNew ? "Добавить" : "Сохранить"}}
                        <span slot="loader" class="custom-loader">
                        <v-icon color="blue">fas fa-spinner fa-spin</v-icon>
                      </span>
                    </v-btn>
                    <v-btn @click="goBack">Отмена</v-btn>
                </v-card-actions>
            </v-layout>
        </v-container>
    `,
    components: {PortfolioManagementGeneralTab, PortfolioManagementShareTab, PortfolioManagementIntegrationTab}
})
export class PortfolioManagementEditPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIOS)
    private reloadPortfolios: () => Promise<void>;
    /** Сервис по работе с портфелями */
    @Inject
    private portfolioService: PortfolioService;
    /** Сервис для экспорта портфеля */
    @Inject
    private exportService: ExportService;
    /** Портфель */
    private portfolio: PortfolioParams = null;
    /** Текущий таб */
    private currentTab: any = null;
    /** Признак добавления нового портфеля */
    private isNew = false;

    private processState = false;

    async beforeRouteUpdate(to: Route, from: Route, next: (to?: RawLocation | false | ((vm: Vue) => any) | void) => void): Promise<void> {
        await this.loadPortfolio(to.params.id);
        next();
    }

    /**
     * Инициализация портфеля
     * @inheritDoc
     */
    async mounted(): Promise<void> {
        UI.on(EventType.PORTFOLIO_CREATED, async () => this.reloadPortfolios());
        await this.loadPortfolio(this.$route.params.id);
    }

    /**
     * Загружает портфель
     * @param id идентификатор
     */
    private async loadPortfolio(id: string): Promise<void> {
        if (id === "new") {
            this.isNew = true;
            this.portfolio = {
                name: "",
                brokerId: null,
                access: 0,
                viewCurrency: Currency.RUB,
                openDate: DateUtils.formatDate(dayjs(), DateFormat.DATE2),
                accountType: PortfolioAccountType.BROKERAGE
            };
        } else {
            this.isNew = false;
            this.portfolio = await this.portfolioService.getPortfolioById(Number(id));
        }
        if (!this.portfolio.iisType) {
            this.portfolio.iisType = IisType.TYPE_A;
        }
    }

    @ShowProgress
    @DisableConcurrentExecution
    private async savePortfolio(): Promise<void> {
        if (!this.isValid) {
            this.$snotify.warning("Поля заполнены некорректно");
            return;
        }
        this.processState = true;
        let newPortfolio: PortfolioParams = null;
        try {
            if (this.isNew) {
                newPortfolio = await this.portfolioService.createPortfolio(this.portfolio);
            } else {
                await this.portfolioService.updatePortfolio(this.portfolio);
            }
        } catch (error) {
            // если 403 ошибки при добавлении портфеля, диалог уже отобразили, больше ошибок показывать не нужно
            if (error.code !== "403") {
                throw error;
            }
            return;
        } finally {
            this.processState = false;
        }
        this.$snotify.info(`Портфель успешно ${this.portfolio.id ? "изменен" : "создан"}`);
        this.processState = false;
        if (this.portfolio.id) {
            // если валюта была изменена, необходимо обновить данные по портфелю, иначе просто обновляем сам портфель
            if (this.portfolio.viewCurrency !== this.portfolio.viewCurrency) {
                UI.emit(EventType.PORTFOLIO_RELOAD, this.portfolio);
            } else {
                UI.emit(EventType.PORTFOLIO_UPDATED, this.portfolio);
            }
        } else {
            UI.emit(EventType.PORTFOLIO_CREATED);
            if (newPortfolio) {
                await this.$router.push({name: "portfolio-management-edit", params: {id: newPortfolio.id.toString()}});
            }
        }
    }

    /** Отправляет запрос на скачивание файла со сделками в формате csv */
    @ShowProgress
    private async downloadFile(): Promise<void> {
        await this.exportService.exportTrades(this.portfolio.id);
    }

    @ShowProgress
    private async exportPortfolio(): Promise<void> {
        await this.exportService.exportReport(this.portfolio.id, ExportType.COMPLEX);
    }

    /** Возвращает признак доступности для загрузки файла со сделками */
    private get downloadNotAllowed(): boolean {
        return ExportUtils.isDownloadNotAllowed(this.clientInfo);
    }

    private get isValid(): boolean {
        return this.portfolio.name.length >= 3 && this.portfolio.name.length <= 40 &&
            (dayjs().isAfter(DateUtils.parseDate(this.portfolio.openDate)) || DateUtils.currentDate() === this.portfolio.openDate) &&
            (CommonUtils.isBlank(this.portfolio.note) || this.portfolio.note.length <= 500);
    }

    /** Возвращает к списку портфелей */
    private goBack(): void {
        this.$router.push({name: "portfolio-management"});
    }

    private get selectedBroker(): DealsImportProvider {
        return this.portfolio.brokerId ? DealsImportProvider.valueById(this.portfolio.brokerId) : null;
    }
}