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
import {Component, Prop, UI} from "../../../app/ui";
import {BrokerSwitcher} from "../../../components/brokerSwitcher";
import {AccessTypes} from "../../../components/dialogs/portfolioEditDialog";
import {DisableConcurrentExecution} from "../../../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../../../platform/decorators/showProgress";
import {DealsImportProvider} from "../../../services/importService";
import {IisType, PortfolioAccountType, PortfolioParams, PortfolioService} from "../../../services/portfolioService";
import {ALLOWED_CURRENCIES} from "../../../types/currency";
import {EventType} from "../../../types/eventType";
import {CommonUtils} from "../../../utils/commonUtils";
import {DateUtils} from "../../../utils/dateUtils";

@Component({
    // language=Vue
    template: `
        <div class="portfolio-management-tab__wrapper">
            <v-switch v-model="portfolio.professionalMode" @change="onProfessionalModeChange" class="margB20">
                <template #label>
                    <span>Профессиональный режим</span>
                    <v-tooltip content-class="custom-tooltip-wrap" bottom>
                        <sup class="custom-tooltip" slot="activator">
                            <v-icon>fas fa-info-circle</v-icon>
                        </sup>
                        <span>
                            Профессиональный режим включает дополнительные возможности, необходимые опытным инвесторам:
                            <ul>
                                <li>возможность уходить в минус по деньгам (маржинальное кредитование)</li>
                                <li>возможность открытия коротких позиций</li>
                                <li>возможность учета времени заключения сделки</li>
                            </ul>
                        </span>
                    </v-tooltip>
                </template>
            </v-switch>

            <v-text-field label="Введите название портфеля" v-model.trim="portfolio.name" required autofocus
                          v-validate="'required|max:40|min:3'"
                          :error-messages="errors.collect('name')"
                          data-vv-name="name" @keyup.enter="savePortfolio"
                          class="required" hint="Обязательное поле">
            </v-text-field>

            <v-layout class="select-option-wrap">
                <v-flex class="select-section">
                    <v-select :items="currencyList" v-model="portfolio.viewCurrency" label="Валюта портфеля"
                              :persistent-hint="true" dense hide-details
                              hint="Валюта, в которой происходит расчет всех показателей. Активы, приобретенные в другой валюте
                                    будут конвертированы по курсу на дату совершения сделки." :menu-props="{nudgeBottom:'22'}">
                    </v-select>
                </v-flex>

                <v-flex class="select-section">
                    <v-select :items="accountTypes" v-model="portfolio.accountType" :return-object="true" item-text="description" dense hide-details
                              label="Тип счета" :menu-props="{nudgeBottom:'22'}"></v-select>
                </v-flex>
                <v-flex class="select-section" v-if="portfolio.accountType === accountType.IIS">
                    <v-select :items="iisTypes" dense hide-details :menu-props="{nudgeBottom:'22'}"
                              v-model="portfolio.iisType" :return-object="true" item-text="description" label="Тип вычета"></v-select>
                </v-flex>
            </v-layout>
            <div class="selected-broker__wrapper">
                <div v-if="selectedBroker" class="selected-broker">
                    <div :class="['selected-broker__img', selectedBroker.code.toLowerCase()]"></div>
                    <span>{{ selectedBroker.description }}</span>
                </div>
                <broker-switcher @selectProvider="onSelectProvider"></broker-switcher>
            </div>

                <v-layout>
                    <v-flex xs12 sm5>
                        <ii-number-field label="Фиксированная комиссия в %" v-model="portfolio.fixFee"
                                         hint="Для автоматического рассчета комиссии при внесении сделок." :decimals="5" @keyup.enter="savePortfolio">
                        </ii-number-field>
                    </v-flex>

                    <v-flex xs12 sm5 class="wrap-calendar-section">
                        <v-menu
                                ref="dateMenu"
                                :close-on-content-click="false"
                                v-model="dateMenuValue"
                                :return-value.sync="portfolio.openDate"
                                lazy
                                transition="scale-transition"
                                offset-y
                                full-width
                                min-width="290px">
                            <v-text-field
                                    slot="activator"
                                    v-model="portfolio.openDate"
                                    :error-messages="errors.collect('openDate')"
                                    name="openDate"
                                    label="Дата открытия"
                                    required
                                    append-icon="event"
                                    readonly></v-text-field>
                            <v-date-picker v-model="portfolio.openDate" :no-title="true" locale="ru" :first-day-of-week="1"
                                           @input="onDateSelected"></v-date-picker>
                        </v-menu>
                    </v-flex>
                </v-layout>

                <v-layout>
                    <v-flex xs12 class="textarea-section">
                        <v-textarea label="Заметка" v-model="portfolio.note" :rows="2" :counter="500"
                                    v-validate="'max:500'" :error-messages="errors.collect('note')" data-vv-name="note"></v-textarea>
                    </v-flex>
                </v-layout>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn :loading="processState" :disabled="!isValid || processState" color="primary" light @click.stop.native="savePortfolio">
                    Сохранить
                    <span slot="loader" class="custom-loader">
                        <v-icon color="blue">fas fa-spinner fa-spin</v-icon>
                      </span>
                </v-btn>
            </v-card-actions>
        </div>
    `,
    components: {BrokerSwitcher}
})
export class PortfolioManagementGeneralTab extends UI {
    $refs: {
        dateMenu: any
    };
    /** Сервис по работе с портфелями */
    @Inject
    private portfolioService: PortfolioService;
    /** Портфель */
    @Prop()
    private portfolio: PortfolioParams;

    private dateMenuValue = false;
    /** Список валют */
    private currencyList = ALLOWED_CURRENCIES;
    private iisTypes = IisType.values();
    private accountType = PortfolioAccountType;
    private accountTypes = PortfolioAccountType.values();
    private processState = false;

    /** Включение/выключение профессионального режима */
    private async onProfessionalModeChange(): Promise<void> {
        const result = await this.portfolioService.updatePortfolio(this.portfolio);
        this.$snotify.info(`Профессиональный режим для портфеля ${result.professionalMode ? "включен" : "выключен"}`);
        UI.emit(EventType.PORTFOLIO_UPDATED, result);
    }

    @ShowProgress
    @DisableConcurrentExecution
    private async savePortfolio(): Promise<void> {
        if (!this.isValid) {
            this.$snotify.warning("Поля заполнены некорректно");
            return;
        }
        this.processState = true;
        try {
            await this.portfolioService.createOrUpdatePortfolio(this.portfolio);
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
        }
    }

    /**
     * Кастомная валидация изза какого-то бага с форматирование дат в либе v-validate
     * @param date
     */
    private async onDateSelected(date: string): Promise<void> {
        this.$refs.dateMenu.save(date);
        if (dayjs().isBefore(DateUtils.parseDate(this.portfolio.openDate))) {
            this.$validator.errors.add({field: "openDate", msg: "Дата открытия портфеля не может быть в будущем"});
        } else {
            this.$validator.errors.remove("openDate");
        }
    }

    /**
     * Обрабатывает событие выбора провайдера из стороннего компонента
     * @param provider выбранный провайдер
     */
    private onSelectProvider(provider: DealsImportProvider): void {
        this.portfolio.brokerId = provider.id;
    }

    private removeBrokerId(): void {
        this.portfolio.brokerId = null;
    }

    private get isValid(): boolean {
        return this.portfolio.name.length >= 3 && this.portfolio.name.length <= 40 &&
            (dayjs().isAfter(DateUtils.parseDate(this.portfolio.openDate)) || DateUtils.currentDate() === this.portfolio.openDate) &&
            (CommonUtils.isBlank(this.portfolio.note) || this.portfolio.note.length <= 500);
    }

    private get selectedBroker(): DealsImportProvider {
        return this.portfolio.brokerId ? DealsImportProvider.valueById(this.portfolio.brokerId) : null;
    }
}