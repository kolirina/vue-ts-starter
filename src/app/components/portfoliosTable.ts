import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {DisableConcurrentExecution} from "../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../platform/decorators/showProgress";
import {BtnReturn} from "../platform/dialogs/customDialog";
import {ClientInfo} from "../services/clientService";
import {PortfolioParams, PortfoliosDialogType, PortfolioService} from "../services/portfolioService";
import {EventType} from "../types/eventType";
import {Portfolio, TableHeader} from "../types/types";
import {SortUtils} from "../utils/sortUtils";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {ConfirmDialog} from "./dialogs/confirmDialog";
import {EmbeddedBlocksDialog} from "./dialogs/embeddedBlocksDialog";
import {PortfolioEditDialog} from "./dialogs/portfolioEditDialog";
import {SharePortfolioDialog} from "./dialogs/sharePortfolioDialog";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-data-table :headers="headers" :items="portfolios" item-key="id" :custom-sort="customSort" hide-actions class="portfolios-content-table">
            <template #items="props">
                <tr class="selectable" @dblclick="props.expanded = !props.expanded">
                    <td>
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
                                <img src="img/portfolio/pro.svg" slot="activator">
                                <div class="pa-3">
                                    Активирован профессиональный режим
                                </div>
                            </v-tooltip>
                            <v-tooltip transition="slide-y-transition" open-on-hover
                                       content-class="menu-icons" left bottom v-if="props.item.access"
                                       nudge-right="122" nudge-top="10"
                                       :class="['hint-for-icon-name-section', props.item.access && !props.item.professionalMode ? 'pl-3' : 'pl-2']">
                                <img src="img/portfolio/share.svg" slot="activator">
                                <div class="pa-3">
                                    Открыт публичный доступ к портфелю
                                </div>
                            </v-tooltip>
                        </v-layout>
                    </td>
                    <td class="text-xs-right">{{ props.item.fixFee }}&nbsp;<span class="second-value">%</span></td>
                    <td class="text-xs-center">{{ props.item.viewCurrency }}</td>
                    <td class="text-xs-left">{{ props.item.accountType.description }}</td>
                    <td class="text-xs-right">{{ props.item.openDate }}</td>
                    <td class="justify-center layout px-0" @click.stop>
                        <v-menu transition="slide-y-transition" bottom left min-width="173">
                            <v-btn slot="activator" flat icon dark>
                                <span class="menuDots"></span>
                            </v-btn>
                            <v-list dense>
                                <v-list-tile @click="openDialogForEdit(props.item)">
                                    <v-list-tile-title>
                                        Редактировать
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click="clonePortfolio(props.item.id)">
                                    <v-list-tile-title>
                                        Копировать
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
                            <v-layout class="setings-btn">
                                <v-btn class="btn" v-clipboard="() => publicLink(props.item.id)" @click="copyPortfolioLink">
                                    Копировать ссылку на портфель
                                </v-btn>
                                <v-menu content-class="dialog-type-menu"
                                        transition="slide-y-transition"
                                        nudge-bottom="36" right class="setings-menu"
                                        :close-on-content-click="false">
                                    <v-btn class="btn" slot="activator">
                                        Настройка доступа
                                    </v-btn>
                                    <v-list dense>
                                        <v-flex>
                                            <div @click.stop="openSharePortfolioDialog(props.item, type)" class="menu-text" v-for="type in dialogTypes.values()" :key="type.code">
                                                {{ type.description }}
                                            </div>
                                        </v-flex>
                                    </v-list>
                                </v-menu>
                                <v-btn class="btn" @click.stop="openEmbeddedDialog(props.item.id)">
                                    Встраиваемые блоки
                                </v-btn>
                            </v-layout>

                            <div class="link-section">
                                <div>
                                    <a class="portfolio-link portfolio-default-text" :href="informerH(props.item.id)" target="_blank">Информер-картинка горизонтальный</a>
                                </div>
                                <div>
                                    <a class="portfolio-link portfolio-default-text" :href="informerV(props.item.id)" target="_blank">Информер-картинка вертикальный</a>
                                </div>
                            </div>
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
    @MainStore.Action(MutationType.RELOAD_PORTFOLIOS)
    private reloadPortfolios: () => Promise<void>;
    @MainStore.Action(MutationType.SET_CURRENT_PORTFOLIO)
    private setCurrentPortfolio: (id: string) => Promise<Portfolio>;
    @Inject
    private portfolioService: PortfolioService;
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

    private async openDialogForEdit(portfolioParams: PortfolioParams): Promise<void> {
        await new PortfolioEditDialog().show({store: this.$store.state[StoreType.MAIN], router: this.$router, portfolioParams});
    }

    private async deletePortfolio(portfolio: PortfolioParams): Promise<void> {
        const result = await new ConfirmDialog().show(`Вы собираетесь удалить портфель ${portfolio.name}.
                                              Все сделки по акциям, облигациям и дивиденды,
                                              связанные с этим портфелем будут удалены.`);
        if (result === BtnReturn.YES) {
            await this.deletePortfolioAndShowMessage(portfolio.id);
        }
    }

    @ShowProgress
    @DisableConcurrentExecution
    private async deletePortfolioAndShowMessage(id: string): Promise<void> {
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

    private publicLink(id: string): string {
        return `${window.location.protocol}//${window.location.host}/public-portfolio/${id}/?ref=${this.clientInfo.user.id}`;
    }

    private informerV(id: string): string {
        return `${window.location.protocol}//${window.location.host}/informer/v/${id}.png`;
    }

    private informerH(id: string): string {
        return `${window.location.protocol}//${window.location.host}/informer/h/${id}.png`;
    }

    private async openEmbeddedDialog(id: string): Promise<void> {
        await new EmbeddedBlocksDialog().show(id);
    }

    private async openSharePortfolioDialog(portfolio: PortfolioParams, type: PortfoliosDialogType): Promise<void> {
        await new SharePortfolioDialog().show({portfolio: portfolio, clientInfo: this.clientInfo, type: type});
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

    private copyPortfolioLink(): void {
        this.$snotify.info("Ссылка скопирована");
    }
}
