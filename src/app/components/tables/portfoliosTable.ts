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
import {PortfolioParams, PortfoliosDialogType, PortfolioService} from "../../services/portfolioService";
import {EventType} from "../../types/eventType";
import {Tariff} from "../../types/tariff";
import {Portfolio, TableHeader} from "../../types/types";
import {CommonUtils} from "../../utils/commonUtils";
import {ExportUtils} from "../../utils/exportUtils";
import {PortfolioUtils} from "../../utils/portfolioUtils";
import {SortUtils} from "../../utils/sortUtils";
import {MutationType} from "../../vuex/mutationType";
import {StoreType} from "../../vuex/storeType";
import {ConfirmDialog} from "../dialogs/confirmDialog";
import {EmbeddedBlocksDialog} from "../dialogs/embeddedBlocksDialog";
import {SharePortfolioDialog} from "../dialogs/sharePortfolioDialog";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-data-table :headers="headers" :items="portfolios" item-key="id" :custom-sort="customSort" hide-actions class="data-table portfolios-content-table" must-sort>
            <template #items="props">
                <tr class="selectable" @dblclick="props.expanded = !props.expanded">
                    <td data-v-step="2">
                        <span @click="props.expanded = !props.expanded" class="data-table-cell" :class="{'data-table-cell-open': props.expanded, 'path': true}"></span>
                    </td>
                    <td class="pl-0">
                        <v-layout align-center>
                            <span>
                                {{ props.item.name }}
                            </span>
                            <v-tooltip transition="slide-y-transition" open-on-hover
                                       content-class="menu-icons" right bottom v-if="props.item.professionalMode"
                                       nudge-right="122" nudge-top="10" class="hint-for-icon-name-section pl-3">
                                <i class="professional-mode-icon" slot="activator"></i>
                                <div class="pa-3">
                                    Активирован профессиональный режим
                                </div>
                            </v-tooltip>
                            <v-tooltip v-if="props.item.access" transition="slide-y-transition" open-on-hover
                                       content-class="menu-icons" left bottom
                                       nudge-right="122" nudge-top="10"
                                       :class="['hint-for-icon-name-section', props.item.access && !props.item.professionalMode ? 'pl-3' : 'pl-2']">
                                <i class="public-portfolio-icon" slot="activator"></i>
                                <div class="pa-3">
                                    Открыт публичный доступ к портфелю
                                </div>
                            </v-tooltip>
                        </v-layout>
                    </td>
                    <td class="text-xs-right">{{ props.item.fixFee }}&nbsp;<span class="second-value">%</span></td>
                    <td class="text-xs-center">{{ props.item.viewCurrency | currencySymbolByCurrency }}</td>
                    <td class="text-xs-left">{{ props.item.accountType.description }}</td>
                    <td class="text-xs-right">{{ props.item.openDate }}</td>
                    <td class="justify-center layout px-0" @click.stop data-v-step="1">
                        <v-menu transition="slide-y-transition" bottom left min-width="173" nudge-bottom="30">
                            <v-btn slot="activator" flat icon dark>
                                <span class="menuDots"></span>
                            </v-btn>
                            <v-list dense>
                                <v-list-tile @click="goToEdit(props.item.id)">
                                    <v-list-tile-title>
                                        Редактировать
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click="clonePortfolio(props.item.id)">
                                    <v-list-tile-title>
                                        Создать копию
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click="downloadFile(props.item.id)" :disabled="downloadNotAllowed"
                                             :title="downloadNotAllowed ? 'Экспорт на вашем тарифе недоступен' : 'Экспорт всех сделок в csv формате'">
                                    <v-list-tile-title>
                                        Экспорт в csv
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click="exportPortfolio(props.item.id)">
                                    <v-list-tile-title>
                                        Экспорт в xlsx
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-divider></v-divider>
                                <v-list-tile @click="clearPortfolio(props.item)">
                                    <v-list-tile-title class="delete-btn">
                                        Очистить
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click="deletePortfolio(props.item)">
                                    <v-list-tile-title class="delete-btn">
                                        Удалить
                                    </v-list-tile-title>
                                </v-list-tile>
                            </v-list>
                        </v-menu>
                    </td>
                </tr>
            </template>

            <template #expand="props">
                <v-card flat>
                    <v-card-text class="action-btn-table-row">
                        <div class="wrap-info-content">
                            <v-layout>
                                <div class="portfolio-default-text">
                                    Портфель "{{ props.item.name }}" <span v-if="props.item.brokerName">Брокер "{{ props.item.brokerName }}"</span>
                                </div>
                                <v-spacer></v-spacer>
                                <v-tooltip content-class="custom-tooltip-wrap" top>
                                    <v-checkbox slot="activator" label="Профессиональный режим"
                                                @change="onProfessionalModeChange(props.item)"
                                                v-model="props.item.professionalMode" hide-details class="portfolio-default-text">
                                    </v-checkbox>
                                    <span>
                                        Профессиональный режим включает дополнительные возможности, необходимые опытным инвесторам:
                                        <ul>
                                            <li>возможность уходить в минус по деньгам (маржинальное кредитование)</li>
                                            <li>возможность открытия коротких позиций</li>
                                            <li>возможность учета времени заключения сделки</li>
                                        </ul>
                                    </span>
                                </v-tooltip>
                            </v-layout>

                            <v-layout class="link-section" wrap>
                                <div class="fs14 maxW500">
                                    <div v-if="showNoteLink(props.item.note)" class="maxW500">
                                        <span class="bold">Заметка:</span>
                                        <div class="text-truncate">{{ props.item.note }}</div>
                                    </div>
                                    <a v-else @click.stop="goToEdit(props.item.id)">Создать заметку</a>
                                </div>
                            </v-layout>
                        </div>
                    </v-card-text>
                </v-card>
            </template>
        </v-data-table>
    `
})
export class PortfoliosTable extends UI {

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
    /** Типы диалогов */
    private dialogTypes = PortfoliosDialogType;

    private headers: TableHeader[] = [
        {text: "", align: "left", ghost: true, sortable: false, value: "", active: true, width: "44"},
        {text: "Название", align: "left", value: "name"},
        {text: "Фикс. комиссия", align: "right", value: "fixFee", width: "50"},
        {text: "Валюта", align: "center", value: "viewCurrency"},
        {text: "Тип счета", align: "left", value: "accountType.description"},
        {text: "Дата открытия", align: "right", value: "openDate"},
        {text: "", value: "", align: "center", width: "25", sortable: false}
    ];

    @Prop({default: [], required: true})
    private portfolios: PortfolioParams[];

    private goToEdit(id: number): void {
        this.$router.push({name: "portfolio-management-edit", params: {id: String(id)}});
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

    @ShowProgress
    private async onProfessionalModeChange(portfolio: PortfolioParams): Promise<void> {
        const result = await this.portfolioService.updatePortfolio(portfolio);
        this.$snotify.info(`Профессиональный режим для портфеля ${result.professionalMode ? "включен" : "выключен"}`);
        UI.emit(EventType.PORTFOLIO_UPDATED, result);
    }

    private customSort(items: PortfolioParams[], index: string, isDesc: boolean): PortfolioParams[] {
        items.sort((a: PortfolioParams, b: PortfolioParams): number => {
            const first = (a as any)[index];
            const second = (b as any)[index];
            if (!isDesc) {
                const result = SortUtils.compareValues(first, second) * -1;
                return result === 0 ? Number(b.id) - Number(a.id) : result;
            } else {
                const result = SortUtils.compareValues(first, second);
                return result === 0 ? Number(a.id) - Number(b.id) : result;
            }
        });
        return items;
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

    private copyPortfolioLink(): void {
        this.$snotify.info("Ссылка скопирована");
    }

    private showNoteLink(note: string): boolean {
        return !CommonUtils.isBlank(note);
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
