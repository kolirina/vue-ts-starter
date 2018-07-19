import {BtnReturn, CustomDialog} from "./customDialog";
import Component from "vue-class-component";
import {ClientInfo} from "../../types/types";
import {Container} from "typescript-ioc";
import {TokenService} from "../../services/tokenService";

/**
 * Диалог получения кода для встраиваемого блока
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" persistent max-width="650px">
            <v-card>
                <v-card-title class="headline">Настройка доступа к портфелю</v-card-title>
                <v-card-text>
                    <v-container fluid class="pa-0">
                        <v-layout row wrap>
                            <v-flex xs12>
                                <v-btn-toggle v-model="shareOption" style="display: flex">
                                    <v-btn v-for="item in shareOptions" :value="item.value" :key="item.value" color="primary" small
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
                                <v-text-field :value="shareOption === 'DEFAULT_ACCESS' ? publicLink : tokenLink" :readonly="true"></v-text-field>
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
                                        :return-value.sync="date"
                                        lazy
                                        transition="scale-transition"
                                        offset-y
                                        full-width
                                        min-width="290px">
                                    <v-text-field
                                            slot="activator"
                                            v-model="date"
                                            label="Срок действия токена до"
                                            required
                                            append-icon="event"
                                            readonly></v-text-field>
                                    <v-date-picker v-model="date" :no-title="true" locale="ru" :first-day-of-week="1"
                                                   @input="$refs.dateMenu.save(date)"></v-date-picker>
                                </v-menu>
                            </v-flex>
                        </v-layout>

                        <v-layout v-if="shareOption === 'BY_IDENTIFICATION'" row wrap>
                            <v-flex xs12>
                                <v-text-field label="Идентификатор пользователя" v-model="userId"></v-text-field>
                            </v-flex>
                        </v-layout>

                        <v-layout v-if="shareOption !== 'DEFAULT_ACCESS'" row wrap>
                            <v-flex xs12>
                                <v-btn color="primary" block small @click="generateTokenLink">
                                    Сгенерировать ссылку
                                </v-btn>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click.native="close" color="primary" small>Закрыть</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `
})
export class SharePortfolioDialog extends CustomDialog<SharePortfolioDialogData, BtnReturn> {

    $refs: {
        dateMenu: any
    };

    private shareOptions: ShareOption[] = [
        {name: "Обычный", value: ShareAccessType.DEFAULT_ACCESS},
        {name: "Со сроком действия", value: ShareAccessType.BY_LINK},
        {name: "Пользователю", value: ShareAccessType.BY_IDENTIFICATION}
    ];

    private shareOption = ShareAccessType.DEFAULT_ACCESS;

    private access = false;
    private divAccess = false;
    private tradeAccess = false;
    private lineDataAccess = false;
    private dashboardAccess = false;
    private date: Date = null;
    private dateMenuValue = false;
    private userId = "";
    private token: string = null;

    private async generateTokenLink(): Promise<void> {
        this.token = await Container.get(TokenService).generateToken(this.data.clientInfo.user.username, this.date);
    }

    private get publicLink(): string {
        return `${window.location.protocol}//${window.location.host}/public-portfolio/${this.data.portfolioId}/?ref=${this.data.clientInfo.user.id}`;
    }

    private get tokenLink(): string {
        return this.token ? `${window.location.protocol}//${window.location.host}/share/portfolio/${this.token}` : '';
    }
}

type ShareOption = {
    name: string,
    value: ShareAccessType
}

export type SharePortfolioDialogData = {
    portfolioId: string,
    clientInfo: ClientInfo
}

enum ShareAccessType {
    DEFAULT_ACCESS = "DEFAULT_ACCESS",
    BY_LINK = "BY_LINK",
    BY_IDENTIFICATION = "BY_IDENTIFICATION"
}