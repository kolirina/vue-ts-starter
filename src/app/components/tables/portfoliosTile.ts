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
import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {DisableConcurrentExecution} from "../../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {BtnReturn} from "../../platform/dialogs/customDialog";
import {ClientInfo} from "../../services/clientService";
import {ExportService, ExportType} from "../../services/exportService";
import {OverviewService} from "../../services/overviewService";
import {PortfolioAccountType, PortfolioParams, PortfolioService} from "../../services/portfolioService";
import {EventType} from "../../types/eventType";
import {Tariff} from "../../types/tariff";
import {Portfolio} from "../../types/types";
import {ExportUtils} from "../../utils/exportUtils";
import {MutationType} from "../../vuex/mutationType";
import {StoreType} from "../../vuex/storeType";
import {ConfirmDialog} from "../dialogs/confirmDialog";
import {PortfolioEditDialog} from "../dialogs/portfolioEditDialog";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-card class="import-wrapper">
            <div class="portfolio-list">
                <div v-for="portfolio in portfolios"  @click="goToEdit(portfolio.id.toString())" class="portfolio-item">
                    <div class="portfolio-item__header">
                        <div class="portfolio-item__header-description">{{ portfolio.name }}</div>
                        <v-tooltip content-class="custom-tooltip-wrap modal-tooltip" bottom>
                            <template v-slot:activator="{ on }">
                                <div v-on="on" class="portfolio-item__make-deposit"></div>
                            </template>
                            <span>Внести дивиденды за 2020 год</span>
                        </v-tooltip>
                        <div @click.stop data-v-step="1">
                            <v-menu transition="slide-y-transition" bottom left min-width="173" nudge-bottom="30">
                                <v-btn slot="activator" flat icon dark>
                                    <span class="menuDots menuDots_dark"></span>
                                </v-btn>
                                <v-list dense>
                                    <v-list-tile @click="openDialogForEdit(portfolio)">
                                        <v-list-tile-title>
                                            Редактировать
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile @click="clonePortfolio(portfolio)">
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
                                    <v-divider v-if="!portfolio.parentTradeId"></v-divider>
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
                            <div v-if="portfolio.accountType === PortfolioAccountType.IIS"><span>Тип ИИС</span><span>{{portfolio.iisType.description}}</span></div>
                        </div>
                    </div>
                </div>
                <v-btn @click.stop="goToEdit('new')" color="#f7f9fb" class="portfolio-item-add"></v-btn>
            </div>
        </v-card>
    `
})
export class PortfoliosTile extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIOS)
    private reloadPortfolios: () => Promise<void>;
    @MainStore.Action(MutationType.SET_CURRENT_PORTFOLIO)
    private setCurrentPortfolio: (id: number) => Promise<Portfolio>;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: number) => Promise<void>;
    /** Сервис по работе с портфелями */
    @Inject
    private portfolioService: PortfolioService;
    /** Сервис для экспорта портфеля */
    @Inject
    private exportService: ExportService;
    @Inject
    private overviewService: OverviewService;

    private PortfolioAccountType = PortfolioAccountType;

    @Prop({default: [], required: true})
    private portfolios: PortfolioParams[];

    private async openDialogForEdit(portfolioParams: PortfolioParams): Promise<void> {
        await new PortfolioEditDialog().show({store: this.$store.state[StoreType.MAIN], router: this.$router, portfolioParams});
    }

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
        const currentPortfolioId = this.clientInfo.user.currentPortfolioId;
        await this.reloadPortfolios();
        // нужно обновлять данные только если удаляемый портфель был выбран текущим и соответственно теперь выбран другой
        if (id === currentPortfolioId) {
            // могли удалить текущий портфель, надо выставить портфель по умолчанию
            await this.setCurrentPortfolio(this.clientInfo.user.portfolios[0].id);
        }
        this.$snotify.info("Портфель успешно удален");
    }

    @ShowProgress
    @DisableConcurrentExecution
    private async clonePortfolio(id: string): Promise<void> {
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
            if (this.portfolio.id === portfolioId) {
                await this.reloadPortfolio(portfolioId);
            }
            this.$snotify.info("Портфель успешно очищен");
        }
    }

    @ShowProgress
    private async onProfessionalModeChange(portfolio: PortfolioParams): Promise<void> {
        const result = await this.portfolioService.updatePortfolio(portfolio);
        this.$snotify.info(`Профессиональный режим для портфеля ${result.professionalMode ? "включен" : "выключен"}`);
        UI.emit(EventType.PORTFOLIO_UPDATED, result);
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

    private goToEdit(id: string): void {
        this.$router.push({name: "portfolio-management-edit", params: {id: id}});
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
