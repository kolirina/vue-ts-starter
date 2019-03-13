import Component from "vue-class-component";
import {BtnReturn, CustomDialog} from "./customDialog";

@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="650px">
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-title class="paddB0">
                    <span class="headline">Обновления сервиса</span>
                    <v-spacer></v-spacer>
                </v-card-title>

                <v-card-text>
                    <v-container class="selectable">
                        Сервисом стало удобно пользоваться не только в web-версии, а также и с мобильных устройств. Мы поддерживаем как ios, так и android.
                        Скачать приложения вы можете по указанным ссылкам.
                        <div style="margin-top: 15px;">
                            <a href="https://itunes.apple.com/ru/app/intelinvest-%D1%83%D1%87%D0%B5%D1%82-%D0%B8%D0%BD%D0%B2%D0%B5%D1%81%D1%82%D0%B8%D1%86%D0%B8%D0%B9
                                                                /id1422478197?mt=8" title="Загрузите приложение в App Store" target="_blank">
                                <img src="./img/help/app-store-badge.svg" alt="pic" style="height: 52px;margin-right: 10px; margin-left: 10px" class="pic">
                            </a>
                            <a href="https://play.google.com/store/apps/details?id=ru.intelinvest.portfolio" title="Загрузите приложение в Google Play" target="_blank">
                                <img src="./img/help/google-play-badge.svg" alt="pic" style="height: 52px;margin-right: 10px; margin-left: 10px">
                            </a>
                        </div>
                        <p>
                            Добавили более 1800 ETF, торгующихся на американском рынке.
                        </p>
                        <p>
                            Исправили добавление событий
                        </p>
                        Желаем вам доходных инвестиций, команда Intelinvest
                        <div style="margin-bottom: 15px; margin-top: 10px;">
                            Все вопросы и предложения, как всегда, через форму
                            <a href="#" @click="openFeedBackDialog" style="cursor: pointer;">
                                обратной связи
                            </a>
                            . Почитать о всех обновлениях сервиса более подробно вы можете в нашем блоге
                            <a href="http://blog.intelinvest.ru/" target="_blank">blog.intelinvest.ru</a>
                            Оперативно получить поддержку можно в группе
                            <a href="https://vk.com/intelinvest" target="_blank">VK</a>
                            или
                            <a href="https://www.facebook.com/intelinvest.ru/" target="_blank">facebook</a>
                        </div>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click.native="acceptAndClose" dark>
                        Понятно. Закрыть
                    </v-btn>
                    <v-btn color="info lighten-2" flat @click.native="close">Отмена</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `
})
export class NotificationUpdateDialog extends CustomDialog<void, BtnReturn> {

    static readonly DATE: string = "2018-10-05";

    private acceptAndClose(): void {
        this.close(BtnReturn.YES);
    }

    private openFeedBackDialog(): void {
        this.close(BtnReturn.SHOW_FEEDBACK);
    }
}
