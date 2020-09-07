/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2019
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2019
 */

import {Inject} from "typescript-ioc";
import {namespace} from "vuex-class/lib/bindings";
import {Component, Prop, UI} from "../app/ui";
import {DisableConcurrentExecution} from "../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../platform/decorators/showProgress";
import {BtnReturn} from "../platform/dialogs/customDialog";
import {ClientInfo} from "../services/clientService";
import {ExportService, ExportType} from "../services/exportService";
import {OverviewService} from "../services/overviewService";
import {PortfolioAccountType, PortfolioParams, PortfolioService} from "../services/portfolioService";
import {EventType} from "../types/eventType";
import {Tariff} from "../types/tariff";
import {Portfolio} from "../types/types";
import {ExportUtils} from "../utils/exportUtils";
import {PortfolioUtils} from "../utils/portfolioUtils";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {ChangeTariffDialog} from "./dialogs/changeTariffDialog";
import {ConfirmDialog} from "./dialogs/confirmDialog";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-card class="import-wrapper">
            <div class="portfolio-list">
                <div v-for="portfolio in portfolios" :key="portfolio.id" @click="goToEdit(portfolio.id)" class="portfolio-item">
                    <div class="portfolio-item__header">
                        <div class="portfolio-item__header-description">{{ portfolio.name }}</div>
                        <v-tooltip v-if="portfolio.note" content-class="custom-tooltip-wrap modal-tooltip" bottom>
                            <template v-slot:activator="{ on }">
                                <div v-on="on" class="portfolio-item__make-deposit"></div>
                            </template>
                            <span>{{ portfolio.note }}</span>
                        </v-tooltip>
                        <v-tooltip v-if="portfolio.professionalMode" transition="slide-y-transition" open-on-hover
                                   content-class="menu-icons" right bottom nudge-right="122" nudge-top="10" class="hint-for-icon-name-section">
                            <i class="professional-mode-icon" slot="activator"></i>
                            <div class="pa-3">
                                Активирован профессиональный режим
                            </div>
                        </v-tooltip>
                        <v-tooltip v-if="portfolio.access" transition="slide-y-transition" open-on-hover
                                   content-class="menu-icons" left bottom nudge-right="122" nudge-top="10" :class="['hint-for-icon-name-section']">
                            <i class="public-portfolio-icon" slot="activator"></i>
                            <div class="pa-3">
                                Открыт публичный доступ к портфелю
                            </div>
                        </v-tooltip>
                        <div @click.stop class="margLAuto">
                            <v-menu transition="slide-y-transition" bottom left min-width="173" nudge-bottom="30">
                                <v-btn slot="activator" flat icon dark>
                                    <span class="menuDots menuDots_dark"></span>
                                </v-btn>
                                <v-list dense>
                                    <v-list-tile @click="goToEdit(portfolio.id)">
                                        <v-list-tile-title>
                                            Редактировать
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile @click="clonePortfolio(portfolio.id)">
                                        <v-list-tile-title>
                                            Создать копию
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile @click="downloadFile(portfolio.id)" :disabled="downloadNotAllowed">
                                        <v-list-tile-title>
                                            Экспорт в csv
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile @click="exportPortfolio(portfolio.id)">
                                        <v-list-tile-title>
                                            Экспорт в xlsx
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-divider></v-divider>
                                    <v-list-tile @click="clearPortfolio(portfolio)">
                                        <v-list-tile-title class="delete-btn">
                                            Очистить
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile @click="deletePortfolio(portfolio)">
                                        <v-list-tile-title class="delete-btn">
                                            Удалить
                                        </v-list-tile-title>
                                    </v-list-tile>
                                </v-list>
                            </v-menu>
                        </div>
                    </div>
                    <div class="portfolio-item__body">
                        <div class="portfolio-item__body-info">
                            <div><span>Фиксированная комиссия</span><span>{{ portfolio.fixFee }} %</span></div>
                            <div><span>Валюта</span><span>{{ portfolio.viewCurrency }}</span></div>
                            <div><span>Тип счета</span><span>{{ portfolio.accountType.description }}</span></div>
                            <div v-if="portfolio.accountType === PortfolioAccountType.IIS">
                                <span>Тип ИИС</span>
                                <span>{{portfolio.iisType.description}}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <v-btn @click.stop="createNewPortfolio" color="#f7f9fb" class="portfolio-item-add"></v-btn>
            </div>
        </v-card>
    `
})
export class PortfoliosTile extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Getter
    private portfolio: Portfolio;
    /** Комбинированный портфель */
    @MainStore.Getter
    private combinedPortfolioParams: PortfolioParams;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIOS)
    private reloadPortfolios: () => Promise<void>;
    @MainStore.Action(MutationType.SET_CURRENT_PORTFOLIO)
    private setCurrentPortfolio: (id: number) => Promise<Portfolio>;
    @MainStore.Action(MutationType.RELOAD_CURRENT_PORTFOLIO)
    private reloadPortfolio: () => Promise<void>;
    @MainStore.Mutation(MutationType.UPDATE_COMBINED_PORTFOLIO)
    private updateCombinedPortfolio: (viewCurrency: string) => void;
    /** Сервис по работе с портфелями */
    @Inject
    private portfolioService: PortfolioService;
    /** Сервис для экспорта портфеля */
    @Inject
    private exportService: ExportService;
    @Inject
    private overviewService: OverviewService;
    @Prop({default: [], required: true})
    private portfolios: PortfolioParams[];
    /** Типы счетов портфеля */
    private PortfolioAccountType = PortfolioAccountType;

    private async deletePortfolio(portfolio: PortfolioParams): Promise<void> {
        const result = await new ConfirmDialog().show(`Вы собираетесь удалить портфель "${portfolio.name}".
                                              Все сделки по акциям, облигациям и дивиденды,
                                              связанные с этим портфелем будут удалены.`);
        if (result === BtnReturn.YES) {
            await this.deletePortfolioAndShowMessage(portfolio.id);
        }
    }

    @ShowProgress
    @DisableConcurrentExecution
    private async deletePortfolioAndShowMessage(id: number): Promise<void> {
        await this.portfolioService.deletePortfolio(id);
        // запоминаем текущий портфель, иначе ниже они может быть обновлен
        const currentPortfolioId = this.portfolio.id;
        this.overviewService.resetCacheForId(currentPortfolioId);
        this.resetCombinedOverviewCache(currentPortfolioId);
        await this.reloadPortfolios();
        // если портфель был установлен по умолчанию, но не был выбран в списке портфелей, перезагружаем информацию о клиенте
        if (id === this.clientInfo.user.currentPortfolioId && id !== currentPortfolioId) {
            this.clientInfo.user.currentPortfolioId = this.clientInfo.user.portfolios[0].id;
        }
        // если портфель был выбран в списке портфелей и установлен по умолчанию, перезагружаем портфель
        if (id === currentPortfolioId) {
            // могли удалить текущий портфель, надо выставить портфель по умолчанию
            await this.setCurrentPortfolio(this.clientInfo.user.portfolios[0].id);
        }
        // мог удалиться портфель входящий в составной
        this.updateCombinedPortfolio(this.combinedPortfolioParams.viewCurrency);
        this.$snotify.info("Портфель успешно удален");
        UI.emit(EventType.PORTFOLIO_LIST_UPDATED);
    }

    @ShowProgress
    @DisableConcurrentExecution
    private async clonePortfolio(id: number): Promise<void> {
        await this.portfolioService.createPortfolioCopy(id);
        this.$snotify.info("Копия портфеля успешно создана");
        UI.emit(EventType.PORTFOLIO_CREATED);
    }

    private async clearPortfolio(portfolio: PortfolioParams): Promise<void> {
        const portfolioId = portfolio.id;
        const result = await new ConfirmDialog().show(`Данная операция удалит все сделки в портфеле "${portfolio.name}".`);
        if (result === BtnReturn.YES) {
            await this.portfolioService.clearPortfolio(portfolioId);
            this.overviewService.resetCacheForId(portfolioId);
            this.resetCombinedOverviewCache(portfolioId);
            if (this.portfolio.id === portfolioId) {
                await this.reloadPortfolio();
            }
            this.$snotify.info("Портфель успешно очищен");
        }
    }

    /**
     * Отправляет запрос на скачивание файла со сделками в формате csv
     */
    @ShowProgress
    private async downloadFile(id: number): Promise<void> {
        await this.exportService.exportTrades(id);
    }

    @ShowProgress
    private async exportPortfolio(id: number): Promise<void> {
        await this.exportService.exportReport(id, ExportType.COMPLEX);
    }

    private goToEdit(id: number): void {
        this.$router.push({name: "portfolio-management-edit", params: {id: String(id)}});
    }

    private async createNewPortfolio(): Promise<void> {
        if (this.clientInfo.user.tariff.maxPortfoliosCount < this.clientInfo.user.portfolios.length + 1) {
            await new ChangeTariffDialog().show(this.$router);
            return;
        }
        await this.$router.push({name: "portfolio-management-edit", params: {id: "new"}});
    }

    private resetCombinedOverviewCache(portfolioId: number): void {
        PortfolioUtils.resetCombinedOverviewCache(this.combinedPortfolioParams, portfolioId, this.overviewService);
    }

    /**
     * Возвращает признак доступности для загрузки файла со сделками
     */
    private get downloadNotAllowed(): boolean {
        return ExportUtils.isDownloadNotAllowed(this.clientInfo);
    }

    /**
     * Возвращает признак доступности для работы с настройками публичного портфеля
     */
    private get publicSettingsAllowed(): boolean {
        return this.clientInfo.user.tariff !== Tariff.FREE;
    }
}
