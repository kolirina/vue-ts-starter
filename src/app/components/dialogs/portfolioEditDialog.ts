import * as moment from "moment";
import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {VueRouter} from "vue-router/types/router";
import {UI} from "../../app/ui";
import {IisType, PortfolioAccountType, PortfolioParams, PortfolioService} from "../../services/portfolioService";
import {EventType} from "../../types/eventType";
import {DateFormat, DateUtils} from "../../utils/dateUtils";
import {MainStore} from "../../vuex/mainStore";
import {CustomDialog} from "./customDialog";

@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" persistent max-width="700px">
            <v-card v-if="portfolioParams">
                <v-card-title>
                    <span class="headline">{{ (editMode ? 'Редактирование' : 'Добавление') + ' портфеля' }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12>
                                <v-text-field label="Название" v-model="portfolioParams.name" required :counter="40"></v-text-field>
                            </v-flex>

                            <v-flex xs12>
                                <v-select :items="accessTypes" v-model="portfolioParams.access" menu-props="returnValue" item-text="label" label="Доступ"></v-select>
                            </v-flex>

                            <v-flex xs12>
                                <v-tooltip top>
                                    <v-checkbox slot="activator" label="Профессиональный режим" v-model="portfolioParams.professionalMode"></v-checkbox>
                                    <span>
                                        Профессиональный режим включает дополнительные возможности, необходимые опытным инвесторам:
                                        <ul>
                                            <li>возможность уходить в минус по деньгам (маржинальное кредитование)</li>
                                            <li>возможность открытия коротких позиций</li>
                                            <li>возможность учета времени заключения сделки</li>
                                        </ul>
                                    </span>
                                </v-tooltip>
                            </v-flex>

                            <v-flex xs12>
                                <v-select :items="currencyList" v-model="portfolioParams.viewCurrency" label="Валюта портфеля"
                                          :persistent-hint="true"
                                          hint="Валюта, в которой происходит расчет всех показателей. Активы, приобретенные в другой валюте
                                          будут конвертированы по курсу на дату совершения сделки.">
                                </v-select>
                            </v-flex>

                            <v-flex xs12>
                                <v-menu
                                        ref="dateMenu"
                                        :close-on-content-click="false"
                                        v-model="dateMenuValue"
                                        :nudge-right="40"
                                        :return-value.sync="portfolioParams.openDate"
                                        lazy
                                        transition="scale-transition"
                                        offset-y
                                        full-width
                                        min-width="290px">
                                    <v-text-field
                                            slot="activator"
                                            v-model="portfolioParams.openDate"
                                            label="Дата открытия"
                                            required
                                            append-icon="event"
                                            readonly></v-text-field>
                                    <v-date-picker v-model="portfolioParams.openDate" :no-title="true" locale="ru" :first-day-of-week="1"
                                                   @input="$refs.dateMenu.save(portfolioParams.openDate)"></v-date-picker>
                                </v-menu>
                            </v-flex>

                            <v-flex xs12>
                                <v-select :items="accountTypes" v-model="portfolioParams.accountType" :return-object="true" item-text="description"
                                          label="Тип счета"></v-select>
                            </v-flex>

                            <v-flex xs12>
                                <v-select v-if="portfolioParams.accountType === 'IIS'" :items="iisTypes"
                                          v-model="portfolioParams.iisType" :return-object="true" item-text="description" label="Тип вычета"></v-select>
                            </v-flex>

                            <v-flex xs12>
                                <v-text-field label="Фиксированная комиссия" v-model="portfolioParams.fixFee"
                                              hint="Для автоматического рассчета комиссии при внесении сделок.">
                                </v-text-field>
                            </v-flex>

                            <v-flex xs12>
                                <v-textarea label="Заметка" v-model="portfolioParams.note" :counter="500"></v-textarea>
                            </v-flex>
                        </v-layout>
                    </v-container>
                    <small>* обозначает обязательные поля</small>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="info lighten-2" flat @click.native="cancel">Отмена</v-btn>
                    <v-btn :loading="processState" :disabled="processState" color="primary" light @click.native="savePortfolio">
                        {{ editMode ? 'Сохранить' : 'Добавить'}}
                        <span slot="loader" class="custom-loader">
                        <v-icon color="blue">fas fa-spinner fa-spin</v-icon>
                      </span>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `,
    components: {CustomDialog}
})
export class PortfolioEditDialog extends CustomDialog<PortfolioDialogData, boolean> {

    $refs: {
        dateMenu: any
    };

    @Inject
    private portfolioService: PortfolioService;

    private portfolioParams: PortfolioParams = null;

    private dateMenuValue = false;
    private currencyList = ["RUB", "USD", "EUR"];
    private accessTypes = [AccessTypes.PRIVATE, AccessTypes.PUBLIC];
    private iisTypes = IisType.values();
    private accountType = PortfolioAccountType;
    private accountTypes = PortfolioAccountType.values();
    private processState = false;
    private editMode = false;

    /**
     * Инициализация данных диалога
     * @inheritDoc
     */
    mounted(): void {
        if (this.data.portfolioParams) {
            this.portfolioParams = {...this.data.portfolioParams};
            this.editMode = true;
        } else {
            this.portfolioParams = {
                name: null,
                access: false,
                viewCurrency: "RUB",
                openDate: DateUtils.formatDate(moment(), DateFormat.DATE2),
                accountType: PortfolioAccountType.BROKERAGE
            };
        }
    }

    private cancel(): void {
        this.close();
    }

    private async savePortfolio(): Promise<void> {
        this.processState = true;
        const result = await this.portfolioService.createOrUpdatePortfolio(this.portfolioParams);
        this.$snotify.info(`Портфель успешно ${this.portfolioParams.id ? "изменен" : "создан"}`);
        this.processState = false;
        UI.emit(EventType.PORTFOLIO_CREATED, result);
        this.close(true);
    }
}

class AccessTypes {
    static readonly PUBLIC = {value: true, label: "Публичный"};
    static readonly PRIVATE = {value: false, label: "Закрытый"};
}

type AccessType = {
    value: boolean,
    label: string
};

export type PortfolioDialogData = {
    store: MainStore,
    router: VueRouter,
    portfolioParams?: PortfolioParams
};
