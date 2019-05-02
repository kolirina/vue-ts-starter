import Component from "vue-class-component";
import {BtnReturn, CustomDialog} from "../../platform/dialogs/customDialog";

@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px">
            <v-card class="dialog-wrap update-service-dialog">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-title class="pb-0">
                    <span class="dialog-header-text pl-3">Обновления сервиса</span>
                </v-card-title>

                <v-card-text>
                    <div class="pl-3 py-0 update-service-dialog__content">
                        <div>
                            <p>
                                Команда Intelinvest рада представить новую версию сервиса!
                            </p>

                            <p>
                                Полностью новая технологическая платформа Intelinvest.
                                Оптимизированы все процессы и работа,
                                новый интерфейс стал работать до 10 раз быстрее.
                            </p>

                            <ul>
                                <li>Переработанный раздел <b>Уведомления</b>.
                                    Вся работа с уведомлениями по акциям и облигациям теперь в одном разделе.
                                </li>
                                <li>Добавлена возможность задавать заметки к любой бумаге в
                                    портфеле из таблиц Акции и Облигации.
                                </li>
                                <li>Улучшенный фильтр для страницы <b>Сделки</b>.</li>
                                <li>Оптимизирован <b>импорт</b>, теперь он также будет работать быстрее.</li>
                                <li>Добавили автоподстановку значений начисления при ручном
                                    внесении дивиденда, купона, амортизации и погашения.
                                </li>
                            </ul>
                            <p>

                            <p>
                                Но самое главное изменение в новом сервисе – это <b>существенное ускорение</b>
                                внедрения нового функционала по вашим просьбам!
                                Новый сервис не только стал быстрее работать, но он стал и проще в
                                разработке и технической поддержке. Таким образом, мы будем развиваться еще быстрее.
                            </p>

                            <p>
                                Мы оставили возможность переключиться между версиями без потерь информации
                                по вашим портфелям. Все изменения, которые вы внесете в портфель в новой версии,
                                автоматически синхронизируются со старой версией. И наоборот.
                            </p>
                            <p>
                                Поддержка старого интерфейса будет прекращена после переноса дополнительных
                                разделов из старой версии сервиса.
                            </p>
                            <p>
                                Старая версия доступна по адресу <a href="https://old.intelinvest.ru">https://old.intelinvest.ru</a>
                            </p>
                        </div>
                        <div class="mt-3 mb-4">
                            <a href="https://itunes.apple.com/ru/app/intelinvest-%D1%83%D1%87%D0%B5%D1%82-%D0%B8%D0%BD%D0%B2%D0%B5%D1%81%D1%82%D0%B8%D1%86%D0%B8%D0%B9
                               /id1422478197?mt=8" title="Загрузите приложение в App Store" target="_blank" class="mr-1">
                                <img src="./img/help/app-store-badge2.svg" alt="pic">
                            </a>
                            <a href="https://play.google.com/store/apps/details?id=ru.intelinvest.portfolio" title="Загрузите приложение в Google Play"
                               target="_blank" class="ml-2">
                                <img src="./img/help/google-play-badge2.svg" alt="pic">
                            </a>
                        </div>
                        <div>
                            Желаем вам доходных инвестиций, команда Intelinvest.
                            Все вопросы и предложения, как всегда, через форму
                            <a @click="openFeedBackDialog">
                                обратной связи.
                            </a>
                            <br>
                            <br>
                            Почитать о всех обновлениях сервиса более подробно вы можете в нашем блоге
                            <a href="http://blog.intelinvest.ru/" target="_blank" class="decorationNone">blog.intelinvest.ru</a>
                            Оперативно получить поддержку можно в группе <a href="https://vk.com/intelinvest" target="_blank" class="decorationNone">VK</a>
                            или <a href="https://www.facebook.com/intelinvest.ru/" target="_blank" class="decorationNone">facebook</a>
                        </div>
                    </div>
                </v-card-text>
                <v-card-actions class="pr-3 pb-3">
                    <v-spacer></v-spacer>
                    <div class="pr-3 pb-3">
                        <v-btn color="primary" @click.native="acceptAndClose" dark>
                            Спасибо. Закрыть
                        </v-btn>
                    </div>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `
})
export class NotificationUpdateDialog extends CustomDialog<void, BtnReturn> {

    static readonly DATE: string = "2019-05-02";

    private acceptAndClose(): void {
        this.close(BtnReturn.YES);
    }

    private openFeedBackDialog(): void {
        this.close(BtnReturn.SHOW_FEEDBACK);
    }
}
