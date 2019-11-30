import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../app/ui";

@Component({
    // language=Vue
    template: `
        <div class="update-service-dialog__content">
            <div>
                <p>
                    Мы рады сообщить, что сервис учета инвестиций Intelinvest <br>
                    стал еще удобнее, быстрее и появились новые возможности.
                </p>
                <p>
                    Вот список обновлений сервиса за последнее время:<br>
                </p>

                <ul>
                    <li>Добавили возможность учета дробного количества активов</li>
                    <li>Улучшили отображение таблиц</li>
                    <li>Улучшили и исправили импорт по QUIK</li>
                    <li>Улучшили и исправили импорт ВТБ</li>
                    <li>Улучшили и исправили импорт Фридом Финанс</li>
                    <li>Улучшили и исправили импорт Interactive Brokers</li>
                    <li>Мелкие исправления и доработки, о которых Вы нам сообщали</li>
                </ul>
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
                <div v-if="isLogin">
                    Желаем вам доходных инвестиций, команда Intelinvest.
                    Все вопросы и предложения, как всегда, через форму
                    <a @click="openFeedBackDialog">
                        обратной связи.
                    </a>
                    <br>
                    <br>
                </div>
                Почитать о всех обновлениях сервиса более подробно вы можете в нашем блоге
                <a href="http://blog.intelinvest.ru/" target="_blank" class="decorationNone">blog.intelinvest.ru</a>
                Оперативно получить поддержку можно в группе <a href="https://vk.com/intelinvest" target="_blank" class="decorationNone">VK</a>
                или <a href="https://www.facebook.com/intelinvest.ru/" target="_blank" class="decorationNone">facebook</a>
            </div>
        </div>
    `
})
export class UpdateServiceInfo extends UI {

    @Prop({default: false, type: Boolean})
    private isLogin: boolean;

    private openFeedBackDialog(): void {
        this.$emit("openFeedBackDialog");
    }
}
