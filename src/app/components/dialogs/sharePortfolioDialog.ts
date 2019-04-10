import dayjs from "dayjs";
import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {UI} from "../../app/ui";
import {DisableConcurrentExecution} from "../../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {BtnReturn, CustomDialog} from "../../platform/dialogs/customDialog";
import {ClientInfo} from "../../services/clientService";
import {PortfolioParams, PortfolioService, TypeDialogOpen} from "../../services/portfolioService";
import {EventType} from "../../types/eventType";
import {CommonUtils} from "../../utils/commonUtils";
import {DateFormat, DateUtils} from "../../utils/dateUtils";

/**
 * Диалог получения ссылки публичного портфеля
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="550px">
            <v-card class="dialog-wrap portfolio-dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-title class="dialog-header-text">Настройка доступа к портфелю</v-card-title>
                <v-card-text class="paddT0 paddB0">

                    <div>
                        <v-layout row wrap>
                            <!--<v-flex v-if="shareOption === 'DEFAULT_ACCESS'" xs9>
                                Включите публичный доступ, и тогда информацию по вашему портфелю смогут просматривать все, кто обладает этой ссылкой. Ссылка не
                                изменяется и действительна пока включен доступ, вы можете разместить ее на форуме или блоге. Настройки доступа отдельных блоков
                                влияют на все типы доступа.
                            </v-flex>-->
                            <!--<v-flex v-if="shareOption === 'BY_LINK'" xs9>
                                По этой ссылке ниже вы можете предоставить временный доступ к просмотру портфеля. По истечению времени ссылка станет неактивна.
                                Не задавайте слишком большое время жизни ссылки, отменить ее будет невозможно.
                            </v-flex>-->
                            <!--<v-flex v-if="shareOption === 'BY_IDENTIFICATION'" xs9>
                                Вы можете предоставить временный доступ к просмотру портфеля конкретному пользователю Intelinvest. Для просмотра пользователю
                                будет необходимо авторизоваться в свой аккаунт. По истечению времени ссылка станет неактивна. Не задавайте слишком большое время
                                жизни ссылки, отменить ее будет невозможно.
                            </v-flex>-->
                        </v-layout>

                        <v-layout column>
                            <v-flex xs12 v-if="shareOption === 'BY_IDENTIFICATION'">
                                <v-text-field label="Идентификатор пользователя" v-model="userId"></v-text-field>
                            </v-flex>
                            <v-flex xs12 sm5 v-if="shareOption === 'BY_LINK'" style="margin-top: 20px">
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
                            <v-flex xs12 v-if="link" style="margin-top: 20px">
                                <v-text-field :value="link" placeholder="url для доступа к портфелю" readonly hide-details id="linkForCopy"></v-text-field>
                            </v-flex>
                        </v-layout>

                        <v-layout v-if="shareOption === 'DEFAULT_ACCESS'" column class="default-access-content">
                            <v-layout wrap justify-space-between>
                                <div>
                                    <v-flex xs12>
                                        <v-checkbox v-model="access"
                                        hide-details class="shrink mr-2 portfolio-default-text"
                                        label="Публичный доступ к портфелю" color="#3B6EC9"></v-checkbox>
                                    </v-flex>
                                    <v-flex xs12>
                                        <v-checkbox v-model="divAccess"
                                        hide-details class="shrink mr-2 mt-0 portfolio-default-text"
                                        label="Просмотр дивидендов" color="#3B6EC9"></v-checkbox>
                                    </v-flex>
                                    <v-flex xs12>
                                        <v-checkbox v-model="tradeAccess"
                                        hide-details class="shrink mr-2 mt-0 portfolio-default-text"
                                        label="Просмотр сделок" color="#3B6EC9"></v-checkbox>
                                    </v-flex>
                                    <v-flex xs12>
                                        <v-checkbox v-model="lineDataAccess"
                                        hide-details class="shrink mr-2 mt-0 portfolio-default-text"
                                        label="Просмотр графика" color="#3B6EC9"></v-checkbox>
                                    </v-flex>
                                    <v-flex xs12>
                                        <v-checkbox v-model="dashboardAccess"
                                        hide-details class="shrink mr-2 mt-0 portfolio-default-text"
                                        label="Просмотр дашборда" color="#3B6EC9"></v-checkbox>
                                    </v-flex>
                                </div>
                                <div>
                                    <v-menu content-class="qr-code-section"
                                            transition="slide-y-transition"
                                            nudge-bottom="36" left class="setings-menu"
                                            :close-on-content-click="false">
                                        <v-btn class="btn" slot="activator">
                                            QR code
                                        </v-btn>
                                        <v-list dense>
                                            <v-flex>
                                                <qriously v-if="link" :value="link" :size="120"></qriously>
                                            </v-flex>
                                        </v-list>
                                    </v-menu>
                                </div>
                            </v-layout>
                        </v-layout>

                        <v-layout wrap v-if="shareOption !== 'DEFAULT_ACCESS'" style="margin-top: 20px">
                            <div v-if="!link">
                                <v-btn class="btn" slot="activator" @click="generateTokenLink">
                                    Сгенерировать ссылку
                                </v-btn>
                            </div>
                            <div v-if="link">
                                <v-btn class="btn" slot="activator" @click="copyLink">
                                    Копировать ссылку
                                </v-btn>
                            </div>
                            <div v-if="link" style="margin-left:20px;">
                                <v-menu content-class="qr-code-section"
                                        transition="slide-y-transition"
                                        nudge-bottom="36" left class="setings-menu"
                                        :close-on-content-click="false">
                                    <v-btn class="btn" slot="activator">
                                        QR code
                                    </v-btn>
                                    <v-list dense>
                                        <v-flex>
                                            <qriously :value="link" :size="120"></qriously>
                                        </v-flex>
                                    </v-list>
                                </v-menu>
                            </div>
                        </v-layout>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" light @click.native="savePublicParams">Сохранить</v-btn>
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
    private dialogType = TypeDialogOpen;

    private shareOption: TypeDialogOpen = null;

    private access = true;
    private divAccess = false;
    private tradeAccess = false;
    private lineDataAccess = false;
    private dashboardAccess = false;
    private expiredDate: string = DateUtils.formatDate(dayjs().add(7, "day"), DateFormat.DATE2);
    private dateMenuValue = false;
    private userId = "";
    private shareUrlsCache: { [key: string]: string } = {
        [this.dialogType.DEFAULT_ACCESS.code]: null,
        [this.dialogType.BY_LINK.code]: null,
        [this.dialogType.BY_IDENTIFICATION.code]: null
    };

    mounted(): void {
        this.shareOption = this.data.type;
        this.access = this.data.portfolio.access;
        this.divAccess = this.data.portfolio.dividendsAccess;
        this.tradeAccess = this.data.portfolio.tradesAccess;
        this.lineDataAccess = this.data.portfolio.lineDataAccess;
        this.dashboardAccess = this.data.portfolio.dashboardAccess;
    }

    @ShowProgress
    private async generateTokenLink(): Promise<void> {
        const isValid = this.isValid();
        if (!isValid) {
            return;
        }
        this.shareUrlsCache[this.shareOption.code] = await this.portfolioService.getPortfolioShareUrl({
            id: this.data.portfolio.id, sharePortfolioType: this.shareOption.code, userName: this.userId, expiredDate: this.expiredDate
        });
    }

    @ShowProgress
    @DisableConcurrentExecution
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
        this.close();
    }

    private get link(): string {
        if (this.shareOption === this.dialogType.DEFAULT_ACCESS) {
            return `${window.location.protocol}//${window.location.host}/public-portfolio/${this.data.portfolio.id}/?ref=${this.data.clientInfo.user.id}`;
        }
        return this.shareUrlsCache[this.shareOption.code];
    }

    private copyLink(): void {
        const target = document.getElementById("linkForCopy");
        target.focus();
        (target as HTMLInputElement).select();
        document.execCommand("copy");
        target.blur();
    }

    private isValid(): boolean {
        if (this.shareOption === this.dialogType.DEFAULT_ACCESS) {
            return true;
        }
        if (this.expiredDate === null || dayjs().isAfter(DateUtils.parseDate(this.expiredDate))) {
            this.$snotify.warning("Срок действия токена должна быть больше текущей даты");
            return false;
        }
        if (this.shareOption === this.dialogType.BY_IDENTIFICATION && CommonUtils.isBlank(this.userId)) {
            this.$snotify.warning("Идентификатор пользователя должен быть заполнен");
            return false;
        }
        return true;
    }
}

export type SharePortfolioDialogData = {
    portfolio: PortfolioParams,
    clientInfo: ClientInfo,
    type: TypeDialogOpen
};
