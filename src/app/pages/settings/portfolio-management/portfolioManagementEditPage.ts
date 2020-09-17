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
import {Resolver} from "../../../../../typings/vue";
import {Component, UI} from "../../../app/ui";
import {DisableConcurrentExecution} from "../../../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../../../platform/decorators/showProgress";
import {Enum, EnumType, IStaticEnum} from "../../../platform/enum";
import {ClientInfo, ClientService} from "../../../services/clientService";
import {ExportService, ExportType} from "../../../services/exportService";
import {DealsImportProvider} from "../../../services/importService";
import {IisType, PortfolioAccountType, PortfolioParams, PortfolioService} from "../../../services/portfolioService";
import {Currency} from "../../../types/currency";
import {EventType} from "../../../types/eventType";
import {CommonUtils} from "../../../utils/commonUtils";
import {DateUtils} from "../../../utils/dateUtils";
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
                    <div class="section-title header-first-card__title-text">{{ isNew ? "Добавление портфеля" : "Управление портфелем" }}</div>
                </v-card-title>
            </v-card>
            <v-layout v-if="portfolio" class="profile" column>
                <div v-if="!isNew" class="card__header">
                    <div class="card__header-title">
                        <div :class="['provider__image', selectedBroker ? selectedBroker.code.toLowerCase() : '']"></div>
                        <div class="margRAuto">
                            <span>{{ portfolioName }}</span>
                            <div @click="goBack" class="back-btn">Назад</div>
                        </div>
                    </div>
                    <v-menu transition="slide-y-transition" bottom left nudge-bottom="36">
                        <v-btn slot="activator">Экспорт</v-btn>
                        <v-list class="card__header-menu">
                            <v-list-tile @click="downloadFile" :disabled="downloadNotAllowed"
                                         :title="downloadNotAllowed ? 'Экспорт на вашем тарифе недоступен' : 'Экспорт всех сделок в csv формате'">
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
                <v-tabs v-if="!isNew" class="portfolio-management-tabs">
                    <v-tab v-for="tab in portfolioTabs" :key="tab.code" @change="currentTab = tab" :class="{'active': tab === currentTab}" :ripple="false">
                        {{ tab.description }}
                    </v-tab>
                    <v-tab-item>
                        <portfolio-management-general-tab :portfolio="portfolio"></portfolio-management-general-tab>
                    </v-tab-item>
                    <v-tab-item>
                        <portfolio-management-share-tab :portfolio="portfolio" :public-name="publicName" :public-link="publicLink"
                                                        @publicNameChange="onPublicNameChange" @publicLinkChange="onPublicLinkChange"></portfolio-management-share-tab>
                    </v-tab-item>
                    <v-tab-item>
                        <portfolio-management-integration-tab :portfolio="portfolio"></portfolio-management-integration-tab>
                    </v-tab-item>
                </v-tabs>
                <template v-if="isNew">
                    <div class="portfolio-management-tab__title margB8">Общая информация</div>
                    <portfolio-management-general-tab :portfolio="portfolio" @savePortfolio="savePortfolio"></portfolio-management-general-tab>
                </template>
                <v-card-actions v-if="currentTab !== PortfolioTab.INTEGRATION">
                    <v-btn :loading="processState" :disabled="processState" color="primary" light @click.stop.native="savePortfolio">
                        {{ isNew ? "Добавить" : "Сохранить"}}
                        <span slot="loader" class="custom-loader">
                        <v-icon color="blue">fas fa-spinner fa-spin</v-icon>
                      </span>
                    </v-btn>
                    <v-btn @click="goBack">{{ isNew ? 'Отмена' : 'Назад' }}</v-btn>
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
    @MainStore.Mutation(MutationType.UPDATE_PORTFOLIO)
    private updatePortfolio: (portfolio: PortfolioParams) => Promise<void>;
    @MainStore.Action(MutationType.RELOAD_CURRENT_PORTFOLIO)
    private reloadPortfolio: () => Promise<void>;
    /** Сервис по работе с портфелями */
    @Inject
    private portfolioService: PortfolioService;
    /** Сервис по работе с нформацией о клиенте */
    @Inject
    private clientService: ClientService;
    /** Сервис для экспорта портфеля */
    @Inject
    private exportService: ExportService;
    /** Портфель */
    private portfolio: PortfolioParams = null;
    /** Текущий таб */
    private currentTab: PortfolioTab = PortfolioTab.COMMON;
    /** Типы табов */
    private PortfolioTab = PortfolioTab;
    /** Список табок */
    private portfolioTabs = PortfolioTab.values();
    /** Признак добавления нового портфеля */
    private isNew = false;
    /** Статус прогресса */
    private processState = false;
    /** Статус прогресса */
    private portfolioName = "";
    /** Публичное имя инвестора */
    private publicName = "";
    /** Ссылка на публичный ресурс пользователя */
    private publicLink = "";

    /**
     * Инициализация портфеля
     * @inheritDoc
     */
    async mounted(): Promise<void> {
        UI.on(EventType.PORTFOLIO_CREATED, async () => {
            await this.reloadPortfolios();
            UI.emit(EventType.PORTFOLIO_LIST_UPDATED);
        });
        UI.on(EventType.PORTFOLIO_UPDATED, async (portfolio: PortfolioParams) => this.updatePortfolio(portfolio));
        UI.on(EventType.PORTFOLIO_RELOAD, async (portfolio: PortfolioParams) => {
            if (this.portfolio.id === portfolio.id) {
                await this.reloadPortfolio();
            }
        });
        UI.on(EventType.TRADE_CREATED, async () => await this.reloadPortfolio());
        await this.loadPortfolio(this.$route.params.id);
        this.portfolioName = this.portfolio.name;
        this.publicName = this.clientInfo.user.publicName;
        this.publicLink = this.clientInfo.user.publicLink;
    }

    beforeDestroy(): void {
        UI.off(EventType.PORTFOLIO_CREATED);
        UI.off(EventType.PORTFOLIO_UPDATED);
        UI.off(EventType.PORTFOLIO_RELOAD);
        UI.off(EventType.TRADE_CREATED);
    }

    async beforeRouteUpdate?(to: Route, from: Route, next: Resolver): Promise<void> {
        await this.loadPortfolio(to.params.id);
        next();
    }

    /**
     * Обрабатывает смену публичной ссылки
     */
    private onPublicLinkChange(publicLink: string): void {
        this.publicLink = publicLink;
    }

    /**
     * Обрабатывает смену публичного имени имени
     */
    private onPublicNameChange(publicName: string): void {
        this.publicName = publicName;
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
                fixFee: "",
                note: "",
                professionalMode: false,
                viewCurrency: Currency.RUB,
                openDate: DateUtils.currentDate(),
                accountType: PortfolioAccountType.BROKERAGE,
                iisType: null,
            };
        } else {
            this.isNew = false;
            this.portfolio = await this.portfolioService.getPortfolioById(Number(id));
        }
    }

    @ShowProgress
    @DisableConcurrentExecution
    private async savePortfolio(): Promise<void> {
        if (!await this.isValid()) {
            return;
        }
        this.processState = true;
        let newPortfolio: PortfolioParams = null;
        try {
            if (this.isNew) {
                newPortfolio = await this.portfolioService.createPortfolio(this.portfolio);
            } else {
                this.portfolio = await this.portfolioService.updatePortfolio(this.portfolio);
            }
            await this.savePublicName();
            await this.savePublicLink();
            this.portfolioName = this.portfolio.name;
        } catch (error) {
            // если 403 ошибки при добавлении портфеля, диалог уже отобразили, больше ошибок показывать не нужно
            if (error.code !== "403") {
                throw error;
            }
            return;
        } finally {
            this.processState = false;
        }
        this.$snotify.info(`Портфель успешно ${this.isNew ? "создан" : "изменен"}`);
        this.processState = false;
        if (this.isNew) {
            UI.emit(EventType.PORTFOLIO_CREATED);
            await this.$router.push({name: "portfolio-management-edit", params: {id: String(newPortfolio.id)}});
        } else {
            // если валюта была изменена, необходимо обновить данные по портфелю, иначе просто обновляем сам портфель
            if (this.portfolio.viewCurrency !== this.portfolio.viewCurrency) {
                UI.emit(EventType.PORTFOLIO_RELOAD, this.portfolio);
            } else {
                UI.emit(EventType.PORTFOLIO_UPDATED, this.portfolio);
            }
            await this.loadPortfolio(String(this.portfolio.id));
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

    private async isValid(): Promise<boolean> {
        if (this.portfolio.name.length < 3 && this.portfolio.name.length > 40) {
            this.$snotify.warning("Имя портфеля должно быть от 3 до 40 символов");
            return false;
        }
        if ((dayjs().isBefore(DateUtils.parseDate(this.portfolio.openDate)) && DateUtils.currentDate() !== this.portfolio.openDate)) {
            this.$snotify.warning("Дата открытия портфеля не может быть в будущем");
            return false;
        }
        if (!CommonUtils.isBlank(this.portfolio.note) && this.portfolio.note.length > 500) {
            this.$snotify.warning("Заметка должна быть не более 500 символов");
            return false;
        }
        if (this.portfolio.access === 2) {
            if (CommonUtils.isBlank(this.publicName)) {
                this.$snotify.warning("Публичное имя инвестора должно быть указано");
                return false;
            }
            if (!CommonUtils.isBlank(this.publicLink)) {
                this.$validator.attach({name: "value", rules: {regex: /^http[s]?:\/\//}});
                const result = await this.$validator.validate("value", this.publicLink);
                if (!result) {
                    this.$snotify.warning("Неверное значение Личного сайта. Ссылка должна начинаться с http:// или https://");
                    return false;
                }
            }
            if (CommonUtils.isBlank(this.portfolio.description)) {
                this.$snotify.warning("Цель портфеля должна быть указана");
                return false;
            }
        }
        return true;
    }

    /**
     * Сохраняет публичную ссылку
     */
    @ShowProgress
    private async savePublicLink(): Promise<void> {
        // отправляем запрос только если действительно поменяли
        if (this.publicLink !== this.clientInfo.user.publicLink) {
            await this.clientService.changePublicLink(this.publicLink);
            this.clientInfo.user.publicLink = this.publicLink;
        }
    }

    /**
     * Сохраняет публичное имя инвестора
     */
    @ShowProgress
    private async savePublicName(): Promise<void> {
        this.publicName = CommonUtils.isBlank(this.publicName) ? this.clientInfo.user.publicName : this.publicName;
        // отправляем запрос только если действительно поменяли
        if (this.publicName !== this.clientInfo.user.publicName) {
            await this.clientService.changePublicName(this.publicName);
            this.clientInfo.user.publicName = this.publicName;
        }
    }

    /** Возвращает к списку портфелей */
    private goBack(): void {
        this.$router.push({name: "portfolio-management"});
    }

    private get selectedBroker(): DealsImportProvider {
        return this.portfolio.brokerId ? DealsImportProvider.valueById(this.portfolio.brokerId) : null;
    }
}

@Enum("code")
export class PortfolioTab extends (EnumType as IStaticEnum<PortfolioTab>) {

    static readonly COMMON = new PortfolioTab("common", "Общие настройки");
    static readonly ACCESS = new PortfolioTab("access", "Публичный доступ");
    static readonly INTEGRATION = new PortfolioTab("integration", "Интеграция");

    private constructor(public code: string, public description: string) {
        super();
    }
}
