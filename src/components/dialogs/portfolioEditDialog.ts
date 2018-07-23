import Component from 'vue-class-component';
import {VueRouter} from 'vue-router/types/router';
import {PortfolioParams} from '../../types/types';
import {MainStore} from '../../vuex/mainStore';
import {CustomDialog} from './customDialog';

@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" persistent max-width="700px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ (editMode ? 'Редактирование' : 'Добавление') + ' портфеля' }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12>
                                <v-text-field label="Название" v-model="name" required :counter="40"></v-text-field>
                            </v-flex>

                            <v-flex xs12>
                                <v-select :items="accessTypes" v-model="access" :return-value="true" item-text="label" label="Доступ"></v-select>
                            </v-flex>

                            <v-flex xs12>
                                <v-tooltip top>
                                    <v-checkbox slot="activator" label="Профессиональный режим" v-model="professionalMode"></v-checkbox>
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
                                <v-select :items="currencyList" v-model="viewCurrency" label="Валюта портфеля"
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
                                        :return-value.sync="openDate"
                                        lazy
                                        transition="scale-transition"
                                        offset-y
                                        full-width
                                        min-width="290px">
                                    <v-text-field
                                            slot="activator"
                                            v-model="openDate"
                                            label="Дата открытия"
                                            required
                                            append-icon="event"
                                            readonly></v-text-field>
                                    <v-date-picker v-model="openDate" :no-title="true" locale="ru" :first-day-of-week="1"
                                                   @input="$refs.dateMenu.save(openDate)"></v-date-picker>
                                </v-menu>
                            </v-flex>

                            <v-flex xs12>
                                <v-select :items="accountTypes" v-model="accountType" label="Тип счета"></v-select>
                            </v-flex>

                            <v-flex xs12>
                                <v-select v-if="accountType === 'ИИС'" :items="iisTypes" v-model="iisType" label="Тип вычета"></v-select>
                            </v-flex>

                            <v-flex xs12>
                                <v-text-field label="Фиксированная комиссия" v-model="fixFee"
                                              hint="Для автоматического рассчета комиссии при внесении сделок.">
                                </v-text-field>
                            </v-flex>

                            <v-flex xs12>
                                <v-textarea label="Заметка" v-model="note" :counter="500"></v-textarea>
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

    private id = '';
    private name = '';
    private viewCurrency = 'RUB';
    private access = false;
    private fixFee = '';
    private openDate = '';
    private accountType = 'Брокерский';
    private professionalMode = false;
    private iisType = 'С вычетом на взносы';
    private broker = '';
    private note = '';
    private combined = false;

    private dateMenuValue = false;
    private currencyList = ['RUB', 'USD'];
    private accessTypes = [AccessTypes.PRIVATE, AccessTypes.PUBLIC];
    private iisTypes = ['С вычетом на взносы', 'С вычетом на доходы'];
    private accountTypes = ['Брокерский', 'ИИС'];
    private processState = false;
    private editMode = false;

    private mounted(): void {
        if (this.data.portfolioParams) {
            Object.assign(this, this.data.portfolioParams);
            this.editMode = true;
        }
        console.log(this.id, this.name);
    }

    private cancel(): void {
        this.close();
    }

    private async savePortfolio(): Promise<void> {
        this.processState = true;
        const portfolio: PortfolioParams = {
            id: this.id,
            name: this.name,
            access: this.access,
            fixFee: this.fixFee,
            viewCurrency: this.viewCurrency,
            accountType: this.accountType,
            professionalMode: this.professionalMode,
            openDate: this.openDate,
            combined: this.combined
        };
        console.log(portfolio);
        setTimeout(() => {
            this.processState = false;
            this.close(true);
        }, 5000);
    }
}

class AccessTypes {
    static readonly PUBLIC = {value: true, label: 'Публичный'};
    static readonly PRIVATE = {value: false, label: 'Закрытый'};
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
