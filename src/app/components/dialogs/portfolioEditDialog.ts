import dayjs from "dayjs";
import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {VueRouter} from "vue-router/types/router";
import {UI} from "../../app/ui";
import {DisableConcurrentExecution} from "../../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {CustomDialog} from "../../platform/dialogs/customDialog";
import {IisType, PortfolioAccountType, PortfolioParams, PortfolioService} from "../../services/portfolioService";
import {EventType} from "../../types/eventType";
import {CommonUtils} from "../../utils/commonUtils";
import {DateFormat, DateUtils} from "../../utils/dateUtils";
import {MainStore} from "../../vuex/mainStore";

@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" ref="dialog" persistent max-width="600px">
            <v-card v-if="portfolioParams" class="dialog-wrap portfolio-dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-title class="paddB0">
                    <span class="dialog-header-text">{{ (editMode ? 'Редактирование' : 'Добавление') + ' портфеля' }}</span>
                </v-card-title>

                <v-card-text class="paddT0 paddB0">
                    <v-layout wrap>
                        <v-flex xs12 class="section-portfolio-name">
                            <v-text-field label="Введите название портфеля" v-model.trim="portfolioParams.name" required autofocus
                                v-validate="'required|max:40|min:3'"
                                :error-messages="errors.collect('name')"
                                data-vv-name="name" @keyup.enter="savePortfolio"
                                class="required">
                            </v-text-field>
                        </v-flex>

                        <v-layout class="select-option-wrap">
                            <v-flex class="select-section">
                                <v-select :items="accessTypes" v-model="portfolioParams.access" menu-props="returnValue" item-text="label" label="Доступ"
                                            dense hide-details></v-select>
                            </v-flex>

                            <v-flex class="select-section">
                                <v-select :items="currencyList" v-model="portfolioParams.viewCurrency" label="Валюта портфеля"
                                            :persistent-hint="true" dense hide-details
                                            hint="Валюта, в которой происходит расчет всех показателей. Активы, приобретенные в другой валюте
                                            будут конвертированы по курсу на дату совершения сделки.">
                                </v-select>
                            </v-flex>

                            <v-flex class="select-section">
                                <v-select :items="accountTypes" v-model="portfolioParams.accountType" :return-object="true" item-text="description" dense hide-details
                                            label="Тип счета"></v-select>
                            </v-flex>
                            <v-flex class="select-section" v-if="portfolioParams.accountType === accountType.IIS" >
                                <v-select :items="iisTypes" dense hide-details
                                            v-model="portfolioParams.iisType" :return-object="true" item-text="description" label="Тип вычета"></v-select>
                            </v-flex>
                        </v-layout>

                        <v-layout>
                            <v-flex xs12 sm5>
                                <ii-number-field label="Фиксированная комиссия" v-model="portfolioParams.fixFee"
                                                    hint="Для автоматического рассчета комиссии при внесении сделок." :decimals="5" @keyup.enter="savePortfolio">
                                </ii-number-field>
                            </v-flex>

                            <v-flex xs12 sm5 class="wrap-calendar-section">
                                <v-menu
                                        ref="dateMenu"
                                        :close-on-content-click="false"
                                        v-model="dateMenuValue"
                                        :return-value.sync="portfolioParams.openDate"
                                        lazy
                                        transition="scale-transition"
                                        offset-y
                                        full-width
                                        min-width="290px">
                                    <v-text-field
                                            slot="activator"
                                            v-model="portfolioParams.openDate"
                                            :error-messages="errors.collect('openDate')"
                                            name="openDate"
                                            label="Дата открытия"
                                            required
                                            append-icon="event"
                                            readonly></v-text-field>
                                    <v-date-picker v-model="portfolioParams.openDate" :no-title="true" locale="ru" :first-day-of-week="1"
                                                    @input="onDateSelected"></v-date-picker>
                                </v-menu>
                            </v-flex>
                        </v-layout>

                        <v-layout>
                            <v-flex xs12 class="textarea-section">
                                <v-textarea label="Заметка" v-model="portfolioParams.note" :rows="2" :counter="500"
                                v-validate="'max:500'" :error-messages="errors.collect('note')" data-vv-name="note"></v-textarea>
                            </v-flex>
                        </v-layout>

                        <v-flex xs12>
                            <v-tooltip content-class="custom-tooltip-wrap modal-tooltip" top>
                                <v-checkbox slot="activator" label="Профессиональный режим"
                                v-model="portfolioParams.professionalMode" class="portfolio-default-text"></v-checkbox>
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
                    </v-layout>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn :loading="processState" :disabled="!isValid || processState" color="primary" light @click.stop.native="savePortfolio">
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
                name: "",
                access: false,
                viewCurrency: "RUB",
                openDate: DateUtils.formatDate(dayjs(), DateFormat.DATE2),
                accountType: PortfolioAccountType.BROKERAGE
            };
        }
        if (!this.portfolioParams.iisType) {
            this.portfolioParams.iisType = IisType.TYPE_A;
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
        await this.portfolioService.createOrUpdatePortfolio(this.portfolioParams);
        this.$snotify.info(`Портфель успешно ${this.portfolioParams.id ? "изменен" : "создан"}`);
        this.processState = false;
        if (this.portfolioParams.id) {
            // если валюта была изменена, необходимо обновить данные по портфелю, иначе просто обновляем сам портфель
            if (this.portfolioParams.viewCurrency !== this.data.portfolioParams.viewCurrency) {
                UI.emit(EventType.PORTFOLIO_RELOAD, this.portfolioParams);
            } else {
                UI.emit(EventType.PORTFOLIO_UPDATED, this.portfolioParams);
            }
        } else {
            UI.emit(EventType.PORTFOLIO_CREATED);
        }
        this.close(true);
    }

    /**
     * Кастомная валидация изза какого-то бага с форматирование дат в либе v-validate
     * @param date
     */
    private async onDateSelected(date: string): Promise<void> {
        this.$refs.dateMenu.save(date);
        if (dayjs().isBefore(DateUtils.parseDate(this.portfolioParams.openDate))) {
            this.$validator.errors.add({field: "openDate", msg: "Дата открытия портфеля не может быть в будущем"});
        } else {
            this.$validator.errors.remove("openDate");
        }
    }

    private get isValid(): boolean {
        return this.portfolioParams.name.length >= 3 && this.portfolioParams.name.length <= 40 &&
            (dayjs().isAfter(DateUtils.parseDate(this.portfolioParams.openDate)) || DateUtils.currentDate() === this.portfolioParams.openDate) &&
            (CommonUtils.isBlank(this.portfolioParams.note) || this.portfolioParams.note.length <= 500);
    }

    private cancel(): void {
        this.close();
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
