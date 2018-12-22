import * as moment from "moment";
import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {UI} from "../../app/ui";
import {ClientInfo} from "../../services/clientService";
import {PortfolioParams, PortfolioService} from "../../services/portfolioService";
import {EventType} from "../../types/eventType";
import {CommonUtils} from "../../utils/commonUtils";
import {DateFormat, DateUtils} from "../../utils/dateUtils";
import {BtnReturn, CustomDialog} from "./customDialog";

/**
 * Диалог получения ссылки публичного портфеля
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="650px">
            <v-card>
                <v-card-title class="headline">Настройка доступа к портфелю</v-card-title>
                <v-card-text>
                    <v-container fluid class="pa-0">
                        <v-layout row wrap>
                            <v-flex xs12>
                                <v-btn-toggle v-model="shareOption" style="display: flex" dark mandatory>
                                    <v-btn v-for="item in shareOptions" :value="item.value" :key="item.value" color="info" small
                                           style="width: 33.33%;width:calc(100%  /3)">
                                        {{ item.name }}
                                    </v-btn>
                                </v-btn-toggle>
                            </v-flex>
                        </v-layout>
                    </v-container>

                    <v-container grid-list-md>
                        <v-layout row wrap>
                            <v-flex v-if="shareOption === 'DEFAULT_ACCESS'" xs9>
                                Включите публичный доступ, и тогда информацию по вашему портфелю смогут просматривать все, кто обладает этой ссылкой. Ссылка не
                                изменяется и действительна пока включен доступ, вы можете разместить ее на форуме или блоге. Настройки доступа отдельных блоков
                                влияют на все типы доступа.
                            </v-flex>
                            <v-flex v-if="shareOption === 'BY_LINK'" xs9>
                                По этой ссылке ниже вы можете предоставить временный доступ к просмотру портфеля. По истечению времени ссылка станет неактивна.
                                Не задавайте слишком большое время жизни ссылки, отменить ее будет невозможно.
                            </v-flex>
                            <v-flex v-if="shareOption === 'BY_IDENTIFICATION'" xs9>
                                Вы можете предоставить временный доступ к просмотру портфеля конкретному пользователю Intelinvest. Для просмотра пользователю
                                будет необходимо авторизоваться в свой аккаунт. По истечению времени ссылка станет неактивна. Не задавайте слишком большое время
                                жизни ссылки, отменить ее будет невозможно.
                            </v-flex>
                            <v-flex xs3>

                            </v-flex>
                        </v-layout>

                        <v-layout row wrap>
                            <v-flex xs12>
                                <v-text-field :value="link" placeholder="url для доступа к портфелю" readonly></v-text-field>
                            </v-flex>
                        </v-layout>

                        <v-layout v-if="shareOption === 'DEFAULT_ACCESS'" row wrap>
                            <v-flex xs12>
                                <v-checkbox v-model="access" hide-details class="shrink mr-2" label="Публичный доступ к портфелю"></v-checkbox>
                            </v-flex>
                            <v-flex xs12>
                                <v-checkbox v-model="divAccess" hide-details class="shrink mr-2" label="Просмотр дивидендов"></v-checkbox>
                            </v-flex>
                            <v-flex xs12>
                                <v-checkbox v-model="tradeAccess" hide-details class="shrink mr-2" label="Просмотр сделок"></v-checkbox>
                            </v-flex>
                            <v-flex xs12>
                                <v-checkbox v-model="lineDataAccess" hide-details class="shrink mr-2" label="Просмотр графика"></v-checkbox>
                            </v-flex>
                            <v-flex xs12>
                                <v-checkbox v-model="dashboardAccess" hide-details class="shrink mr-2" label="Просмотр дашборда"></v-checkbox>
                            </v-flex>
                        </v-layout>

                        <v-layout v-if="shareOption === 'BY_LINK'" row wrap>
                            <v-flex xs12>
                                <v-menu
                                        ref="dateMenu"
                                        :close-on-content-click="false"
                                        v-model="dateMenuValue"
                                        :nudge-right="40"
                                        :return-value.sync="expiredDate"
                                        lazy
                                        transition="scale-transition"
                                        offset-y
                                        full-width
                                        min-width="290px">
                                    <v-text-field
                                            slot="activator"
                                            v-model="expiredDate"
                                            label="Срок действия токена до"
                                            required
                                            append-icon="event"
                                            readonly></v-text-field>
                                    <v-date-picker v-model="expiredDate" :no-title="true" locale="ru" :first-day-of-week="1"
                                                   @input="$refs.dateMenu.save(expiredDate)"></v-date-picker>
                                </v-menu>
                            </v-flex>
                        </v-layout>

                        <v-layout v-if="shareOption === 'BY_IDENTIFICATION'" row wrap>
                            <v-flex xs12>
                                <v-text-field label="Идентификатор пользователя" v-model="userId"></v-text-field>
                            </v-flex>
                        </v-layout>

                        <v-layout row wrap>
                            <v-flex xs12>
                                <v-btn v-if="shareOption !== 'DEFAULT_ACCESS'" color="primary" block small @click="generateTokenLink">
                                    Сгенерировать ссылку
                                </v-btn>
                                <v-btn v-else color="primary" block small @click="savePublicParams">
                                    Сохранить настройки доступа
                                </v-btn>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="info lighten-2" flat @click.native="close">Отмена</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `
})
export class SharePortfolioDialog extends CustomDialog<SharePortfolioDialogData, BtnReturn> {

    $refs: {
        dateMenu: any
    };

    @Inject
    private portfolioService: PortfolioService;

    private shareOptions: ShareOption[] = [
        {name: "Обычный", value: ShareAccessType.DEFAULT_ACCESS},
        {name: "Со сроком действия", value: ShareAccessType.BY_LINK},
        {name: "Пользователю", value: ShareAccessType.BY_IDENTIFICATION}
    ];

    private shareOption = ShareAccessType.DEFAULT_ACCESS;

    private access = true;
    private divAccess = false;
    private tradeAccess = false;
    private lineDataAccess = false;
    private dashboardAccess = false;
    private expiredDate: string = DateUtils.formatDate(moment().add(7, "days"), DateFormat.DATE2);
    private dateMenuValue = false;
    private userId = "";
    private shareUrlsCache: { [key: string]: string } = {
        [ShareAccessType.DEFAULT_ACCESS]: null,
        [ShareAccessType.BY_LINK]: null,
        [ShareAccessType.BY_IDENTIFICATION]: null
    };

    private async generateTokenLink(): Promise<void> {
        const isValid = this.isValid();
        if (!isValid) {
            return;
        }
        this.shareUrlsCache[this.shareOption] = await this.portfolioService.getPortfolioShareUrl({
            id: this.data.portfolio.id, sharePortfolioType: this.shareOption, userName: this.userId, expiredDate: this.expiredDate
        });
    }

    private async savePublicParams(): Promise<void> {
        const result = await this.portfolioService.updatePortfolio({
            ...this.data.portfolio,
            access: this.access,
            tradesAccess: this.tradeAccess,
            dividendsAccess: this.divAccess,
            dashboardAccess: this.dashboardAccess,
            lineDataAccess: this.lineDataAccess
        });
        this.$snotify.info("Настройки доступа к портфелю успешно изменены");
        UI.emit(EventType.PORTFOLIO_UPDATED, result);
    }

    private get link(): string {
        if (this.shareOption === ShareAccessType.DEFAULT_ACCESS) {
            return `${window.location.protocol}//${window.location.host}/public-portfolio/${this.data.portfolio.id}/?ref=${this.data.clientInfo.user.id}`;
        }
        return this.shareUrlsCache[this.shareOption];
    }

    private isValid(): boolean {
        if (this.shareOption === ShareAccessType.DEFAULT_ACCESS) {
            return true;
        }
        if (this.expiredDate === null || moment().isAfter(DateUtils.parseDate(this.expiredDate))) {
            this.$snotify.warning("Срок действия токена должна быть больше текущей даты");
            return false;
        }
        if (this.shareOption === ShareAccessType.BY_IDENTIFICATION && CommonUtils.isBlank(this.userId)) {
            this.$snotify.warning("Идентификатор пользователя должен быть заполнен");
            return false;
        }
        return true;
    }
}

type ShareOption = {
    name: string,
    value: ShareAccessType
};

export type SharePortfolioDialogData = {
    portfolio: PortfolioParams,
    clientInfo: ClientInfo
};

enum ShareAccessType {
    DEFAULT_ACCESS = "DEFAULT_ACCESS",
    BY_LINK = "BY_LINK",
    BY_IDENTIFICATION = "BY_IDENTIFICATION"
}
