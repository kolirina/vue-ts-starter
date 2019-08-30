/*
 * TODO: Исправить скринкасты
 */

import Component from "vue-class-component";
import {namespace} from "vuex-class";
import {UI} from "../app/ui";
import {AddTradeDialog} from "../components/dialogs/addTradeDialog";
import {FeedbackDialog} from "../components/dialogs/feedbackDialog";
import {ImageDialog} from "../components/dialogs/imageDialog";
import {AssetType} from "../types/assetType";
import {Operation} from "../types/operation";
import {Portfolio} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid class="selectable" id="up">
            <v-card flat class="header-first-card">
                <v-card-title class="header-first-card__wrapper-title">
                    <div class="section-title header-first-card__title-text">
                        Справка по работе сервиса
                    </div>
                </v-card-title>
            </v-card>
            <v-layout class="wrapper-list-reference" wrap>
                <div class="wrapper-list-reference__item">
                    <div class="wrapper-list-reference__item-content-wrapper">
                        <a @click.stop="$vuetify.goTo('#about')">О сервисе</a>
                    </div>
                    <div class="wrapper-list-reference__item-content-wrapper">
                        <a @click.stop="$vuetify.goTo('#trades_add')">Добавление сделок</a>
                    </div>
                    <div class="wrapper-list-reference__item-content-wrapper">
                        <a @click.stop="$vuetify.goTo('#balances')">Текущие остатки</a>
                    </div>
                    <div class="wrapper-list-reference__item-content-wrapper">
                        <a @click.stop="$vuetify.goTo('#import')">Импорт сделок</a>
                    </div>
                    <div class="wrapper-list-reference__item-content-wrapper">
                        <a @click.stop="$vuetify.goTo('#export')">Экспорт данных</a>
                    </div>
                </div>
                <div class="wrapper-list-reference__item">
                    <div class="wrapper-list-reference__item-content-wrapper">
                        <a @click.stop="$vuetify.goTo('#portfolio')">Портфель</a>
                    </div>
                    <div class="wrapper-list-reference__item-content-wrapper">
                        <a @click.stop="$vuetify.goTo('#trades')">Сделки</a>
                    </div>
                    <div class="wrapper-list-reference__item-content-wrapper">
                        <a @click.stop="$vuetify.goTo('#trades')">Комисии, расходы</a>
                    </div>
                    <div class="wrapper-list-reference__item-content-wrapper">
                        <a @click.stop="$vuetify.goTo('#events')">Страница События</a>
                    </div>
                    <div class="wrapper-list-reference__item-content-wrapper">
                        <a @click.stop="$vuetify.goTo('#combined_portfolio')">Составной портфель</a>
                    </div>
                </div>
                <div class="wrapper-list-reference__item">
                    <div class="wrapper-list-reference__item-content-wrapper">
                        <a @click.stop="$vuetify.goTo('#dividends')">Дивиденды</a>
                    </div>
                    <div class="wrapper-list-reference__item-content-wrapper">
                        <a @click.stop="$vuetify.goTo('#quotes')">Котировки</a>
                    </div>
                    <div class="wrapper-list-reference__item-content-wrapper">
                        <a @click.stop="$vuetify.goTo('#settings')">Настройки</a>
                    </div>
                    <div class="wrapper-list-reference__item-content-wrapper">
                        <a @click.stop="$vuetify.goTo('#settings_portfolio')">Управление портфелями</a>
                    </div>
                    <div class="wrapper-list-reference__item-content-wrapper">
                        <a @click.stop="$vuetify.goTo('#settings_public')">Публичный доступ</a>
                    </div>
                </div>
                <div class="wrapper-list-reference__item">
                    <div class="wrapper-list-reference__item-content-wrapper">
                        <a @click.stop="$vuetify.goTo('#tariffs_public')">Тарифы</a>
                    </div>
                    <div class="wrapper-list-reference__item-content-wrapper">
                        <a @click.stop="$vuetify.goTo('#settings_promo_codes')">Промокоды</a>
                    </div>
                    <div class="wrapper-list-reference__item-content-wrapper">
                        <a @click.stop="$vuetify.goTo('#settings_notifications')">Уведомления</a>
                    </div>
                    <div class="wrapper-list-reference__item-content-wrapper">
                        <a @click.stop="$vuetify.goTo('#help')">Вопросы и помощь</a>
                    </div>
                    <div class="wrapper-list-reference__item-content-wrapper">
                        <a @click.stop="$vuetify.goTo('#privacy')">Соглашение</a>
                    </div>
                </div>
            </v-layout>
            <div>
                <v-expansion-panel expand class="wrapper-panel" v-model="configExpansionPanel">
                    <v-expansion-panel-content>
                        <template v-slot:actions>
                            <i class="custom-action-icon"></i>
                        </template>
                        <template v-slot:header>
                            <div id="about">О сервисе</div>
                        </template>
                        <v-card>
                            <div class="wrapper-content-panel">
                                <div class="wrapper-content-panel__paired-section">
                                    <div class="wrapper-content-panel__paired-section-item">
                                        <p>
                                            Сервис позволяет учитывать <a @click.stop="$vuetify.goTo('#buy_stock')">акции</a>,
                                            <a @click.stop="$vuetify.goTo('#buy_bonds')">облигации</a>, ETF, валюты и другие виды активов.
                                        </p>
                                        <p>
                                            Предоставляет информацию и оценку эффективности ваших инвестиций в сравнении с доходностью индекса ММВБ, инфляции, ставок по депозитам.
                                        </p>
                                        <p>
                                            Основной единицей учета является сделка. Также для более точной оценки ваших инвестиций вы можете учитывать дивидендные,
                                            купонные и амортизационные выплаты, вести учет комиссий и расходов для каждого портфеля в отдельности.
                                        </p>
                                    </div>
                                    <div class="wrapper-content-panel__paired-section-item">
                                        <p>
                                            Сервисом удобно пользоваться как в web-версии,
                                            так и с мобильных устройств.
                                        </p>
                                        <p>
                                            Мы поддерживаем как ios, так и android. Скачать приложения
                                            вы можете по указанным ссылкам.
                                        </p>
                                        <div class="apple-google-pic">
                                            <a href="https://itunes.apple.com/ru/app/intelinvest-%D1%83%D1%87%D0%B5%D1%82-
                                                %D0%B8%D0%BD%D0%B2%D0%B5%D1%81%D1%82%D0%B8%D1%86%D0%B8%D0%B9
                                                /id1422478197?mt=8" title="Загрузите приложение в App Store" target="_blank">
                                                <img src="./img/help/app-store-badge2.svg" alt="pic" @click.stop="openImageDialog"/>
                                            </a>
                                            <a href="https://play.google.com/store/apps/details?id=ru.intelinvest.portfolio"
                                               title="Загрузите приложение в Google Play"
                                               target="_blank">
                                                <img src="./img/help/google-play-badge2.svg" alt="pic" @click.stop="openImageDialog"/>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </v-card>
                    </v-expansion-panel-content>
                    <v-expansion-panel-content>
                        <template v-slot:actions>
                            <i class="custom-action-icon"></i>
                        </template>
                        <template v-slot:header>
                            <div id="trades_add">Добавление сделок</div>
                        </template>
                        <v-card>
                            <div class="wrapper-content-panel">
                                <div class="wrapper-content-panel__paired-section">
                                    <div class="wrapper-content-panel__paired-section-item">
                                        <p>
                                            Кнопка добавления сделок
                                            <v-btn @click.stop="openDialog()"  fab dark small color="indigo" depressed class="add-btn-menu">
                                                <v-icon>add</v-icon>
                                            </v-btn>
                                        </p>
                                        <p>
                                            При нажатии открывается диалоговое окно, как можно выбрать
                                            тип вносимой сделки (Акция, Облигация, Деньги) и действие,
                                            в зависимости от типа сделки.
                                        </p>
                                        <p>
                                            Для акции это - Купить, Продать, Дивиденд;<br>
                                            Для облигации - Купить, Продать, Погашение, Купон,
                                            Амортизация;<br>
                                            Для денег - Внести, Вывести, Доход, Расход, Покупка валюты, Продажа аалюты.
                                        </p>
                                        <p>
                                            При внесении сделки автоматически подставляется на
                                            введенную дату для акции - цена, для облигации - цена,
                                            номинал, НКД.
                                        </p>
                                        <p>
                                            При вводе количества рассчитывается размер суммы сделки, с
                                            учетом комиссии.
                                        </p>
                                    </div>
                                    <div class="wrapper-content-panel__paired-section-item">
                                        <p>
                                            По умолчанию установлен чекбокс "Cписать деньги"
                                            ("Зачислить деньги"), который определяет, будет ли
                                            сопровождаться сделка списанием с денежного счета на сумму
                                            покупки (или пополнением счета на сумму продажи).
                                        </p>
                                        <p>
                                            При этом сделка по деньгам будет связана с основной
                                            сделкой, при редактировании основной сделки по бумаге,
                                            сделка по денежным средствам будет обновлена
                                            автоматически.
                                        </p>
                                        <p>
                                            Сумму доступных денежных средств в портфеле можно увидеть
                                            ниже (например, Доступно: 12 280.56).
                                        </p>
                                        <p>
                                            После добавления сделки вы увидите сообщение об успешности
                                            операции и об обновлении данных на странице.
                                        </p>
                                    </div>
                                </div>
                                <div class="gif-block">
                                    <div class="gif-block-item">
                                        <div class="title-gif-block">
                                            Примеры сделок
                                        </div>
                                        <div class="gif-block-item__title" id="buy_stock">
                                            Покупка акции
                                        </div>
                                        <div>
                                            <img src="./img/help/add_stock_buy.gif" @click.stop="openImageDialog"/>
                                        </div>
                                    </div>
                                    <div class="gif-block-item">
                                        <div class="gif-block-item__title" id="buy_bonds">
                                            Покупка облигации
                                        </div>
                                        <div>
                                            <img src="./img/help/add_bond_trade.gif" @click.stop="openImageDialog"/>
                                        </div>
                                    </div>
                                    <div class="gif-block-item">
                                        <div class="gif-block-item__title">
                                            Добавление дивиденда
                                        </div>
                                        <div>
                                            <img src="./img/help/add_dividend.gif" @click.stop="openImageDialog"/>
                                        </div>
                                    </div>
                                    <div class="gif-block-item">
                                        <div class="gif-block-item__title">
                                            Добавление купонной выплаты
                                        </div>
                                        <div>
                                            <img src="./img/help/add_coupon.gif" @click.stop="openImageDialog"/>
                                        </div>
                                    </div>
                                    <div class="gif-block-item">
                                        <div class="gif-block-item__title">
                                            Пополнение денежного счета
                                        </div>
                                        <div>
                                            <img src="./img/help/add_money_trade.gif" @click.stop="openImageDialog"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </v-card>
                    </v-expansion-panel-content>
                    <v-expansion-panel-content>
                        <template v-slot:actions>
                            <i class="custom-action-icon"></i>
                        </template>
                        <template v-slot:header>
                            <div id="balances">Текущие остатки портфеля</div>
                        </template>
                        <v-card>
                            <div class="wrapper-content-panel">
                                <div class="wrapper-content-panel__single-section">
                                    <div class="wrapper-content-panel__single-section-item">
                                        <p>
                                            Эта функция полезна, если у вас
                                            нет полной истории сделок или вы хотите быстро начать
                                            работу с новым портфелем.
                                        </p>
                                        <p>
                                            Вы можете не заносить все сделки, а только указать текущее
                                            состояние портфеля и текущие остатки денежных средств на
                                            счете брокера. <a href="#/balances">Указать остатки</a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </v-card>
                    </v-expansion-panel-content>
                    <v-expansion-panel-content>
                        <template v-slot:actions>
                            <i class="custom-action-icon"></i>
                        </template>
                        <template v-slot:header>
                            <div id="import">Импорт сделок</div>
                        </template>
                        <v-card>
                            <div class="wrapper-content-panel">
                                <div class="wrapper-content-panel__paired-section">
                                    <div class="wrapper-content-panel__paired-section-item">
                                        <p>
                                            Для более удобного переноса истории ваших сделок, сервис
                                            поддерживает автоматический импорт сделок из популярных
                                            терминалов и распространенных брокеров. После выбора в
                                            меню вашего брокера или терминала, вам будет показана
                                            подробная инструкция по получению отчета. Чтобы
                                            воспользоваться импортом, перейдите в меню Настройки -&gt;
                                            <a href="#/settings/import">Импорт сделок</a>
                                        </p>
                                        <div class="gif-block-item  border-block-in-paired-section">
                                            <p>
                                                <div>
                                                    <img src="./img/help/import_1.png" @click.stop="openImageDialog"/>
                                                </div>
                                            </p>
                                            <div>
                                                Что делать, если отчет не загружается?
                                            </div>
                                            <p>
                                                Для начала проверьте формат файла. Для каждого брокера
                                                описаны инструкции по форматам.
                                            </p>
                                            <p>
                                                <div>
                                                    <img src="./img/help/import_2.png" @click.stop="openImageDialog"/>
                                                </div>
                                            </p>
                                            <p>
                                                Внимательно прочитайте информацию во всплывающем окне.
                                                Там написаны причины, по которым импорт не проходит.
                                            </p>
                                            <p>
                                                Сделки по бумагам с не распознанными тикерами необходимо
                                                довнести вручную через диалог ввода
                                                <a href="#/balances">текущих остатков портфеля</a>.
                                            </p>
                                        </div>
                                    </div>
                                    <div class="wrapper-content-panel__paired-section-item">
                                        <div>
                                            Как устроен импорт?
                                        </div>
                                        <p>
                                            Для большинства брокеров и терминалов импортируются
                                            не только сделки купли-продажи ценных бумаг, а также сделки
                                            по движению денежных средств на счете.
                                        </p>
                                        <p>
                                            При завершении импорта мы просим указать текущий остаток
                                            денежных средств в портфеле, на основании которого
                                            создается корректирующая сделка внесения/списания денег,
                                            чтобы стоимость портфеля соответствовала действительности.
                                        </p>
                                        <p>
                                            Прибыль по дивидендам и купонам и амортизации начисляется
                                            в портфель автоматически на основе наших данных.
                                        </p>
                                        <p>
                                            Если после импорта вы не обнаружили в списке сделок
                                            начисленный дивиденд/купон (или обнаружили расхождение
                                            суммы), вы можете внести начисление вручную через
                                            добавление сделки.
                                        </p>
                                        <p>
                                            О любых неточностях просим также сообщать в техподдержку.
                                        </p>
                                        <p>
                                            Для всех брокеров, кроме Финама, комиссии брокера по
                                            сделкам извлекаются из отчета. Клиентам Финама рекомендуем
                                            указать в настройках портфеля фиксированный процент
                                            комиссии от суммы сделки, в таком случае комиссия при
                                            импорте будет применена ко всем сделкам автоматически.
                                        </p>
                                        <p>
                                            Если в портфеле имелась иная прибыль/убыток помимо
                                            начислений и комиссий брокера (например, доход по РЕПО,
                                            налог, комссия депозитария), вы можете внести их вручную
                                            через добавление сделки Деньги -&gt; Расход/Доход.
                                        </p>
                                        <p>
                                            Выключите при этом флаг "Списать/Зачислить деньги", так
                                            как денежный остаток портфеля после импорта актуален.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </v-card>
                    </v-expansion-panel-content>
                    <v-expansion-panel-content>
                        <template v-slot:actions>
                            <i class="custom-action-icon"></i>
                        </template>
                        <template v-slot:header>
                            <div id="export">Экспорт сделок</div>
                        </template>
                        <v-card>
                            <div class="wrapper-content-panel">
                                <div class="wrapper-content-panel__paired-section">
                                    <div class="wrapper-content-panel__paired-section-item">
                                        <p>
                                            Чтобы воспользоваться экспортом, перейдите в меню
                                            Настройки -&gt;
                                            <a href="#/settings/export">Экспорт сделок</a>
                                        </p>
                                        <p>
                                            В разделе можно настроить резервную копию своих портфелей.
                                            Вы выбираете нужный портфель (или портфели), добавляете в
                                            таблицу и настраиваете расписание.
                                        </p>
                                    </div>
                                    <div class="wrapper-content-panel__paired-section-item">
                                        <p>
                                            На почту в выбранные дни будут приходить письма с
                                            вложениями, содержащие csv-файлы в формате Intelinvest.
                                        </p>
                                        <p>
                                            Таким образом, вы сможете восстановить утерянные сделки
                                            либо старую версию портфеля при неудачном импорте.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </v-card>
                    </v-expansion-panel-content>
                    <v-expansion-panel-content>
                        <template v-slot:actions>
                            <i class="custom-action-icon"></i>
                        </template>
                        <template v-slot:header>
                            <div id="portfolio">Страница Портфель</div>
                        </template>
                        <v-card>
                            <div class="wrapper-content-panel">
                                <div class="wrapper-content-panel__paired-section">
                                    <div class="wrapper-content-panel__paired-section-item">
                                        <p>
                                            Здесь представлена подробная информацию по текущему
                                            состоянию выбранного
                                            <a href="#/portfolio">портфеля</a> и ценным бумагам,
                                            входящим в его состав.
                                        </p>
                                        <p>
                                            В интерактивных информерах сверху представлены наиболее
                                            важные показатели: текущая суммарная стоимость, доход и
                                            годовая доходность портфеля, а также изменение стоимости
                                            портфеля за текущий день.
                                        </p>
                                        <p>
                                            <div>
                                                <img src="./img/help/portfolio_1.png" @click.stop="openImageDialog"/>
                                            </div>
                                        </p>
                                        <p>
                                            Ниже расположена таблица с основными типами активов
                                            (акции, облигации, деньги), их суммарными стоимостями и
                                            размером доли в портфеле.
                                        </p>
                                        <p>
                                            Более подробная информация по акциям и облигациям
                                            представлена в блоках ниже.
                                        </p>
                                        <p>
                                            Нажмите на кнопку напротив каждой бумаги чтобы просмотреть
                                            доступные с ней действия.
                                        </p>
                                        <p>
                                            <div>
                                                <img src="./img/help/portfolio_2.png" @click.stop="openImageDialog"/>
                                            </div>
                                        </p>
                                        <p>
                                            Можно быстро купить, продать или внести начисление по
                                            дивиденду или купону, причем данные будут автоматически
                                            заполнены с учетом выбранной бумаги.Таким же образом, путем
                                            удаления всех бумаг, вы можете быстро очистить весь портфель.
                                        </p>
                                        <p>
                                            <div>
                                                <img src="./img/help/portfolio_3.png" @click.stop="openImageDialog"/>
                                            </div>
                                        </p>
                                    </div>
                                    <div class="wrapper-content-panel__paired-section-item">
                                        <p>
                                            Также есть возможность просмотреть дополнительную
                                            информацию по каждой позиции в портфеле. Для этого
                                            необходимо развернуть строку в таблице нажатием на кнопку
                                            слева.
                                        </p>
                                        <p>
                                            <div>
                                                <img src="./img/help/portfolio_4.png" @click.stop="openImageDialog"/>
                                            </div>
                                        </p>
                                        <p>
                                            Для каждой таблицы предусмотрена диаграмма распределения
                                            активов в портфеле по долям. На графике стоимости портфеля
                                            можно дополнительно включить отображение сделок.
                                        </p>
                                        <p>
                                            На графике распределения активов по отраслям можно
                                            посмотреть какие акции и какой объем занимают по отдельной
                                            каждой отрасли.
                                        </p>
                                        <p>
                                            <div>
                                                <img src="./img/help/portfolio_5.png" @click.stop="openImageDialog"/>
                                            </div>
                                        </p>
                                        <p>
                                            <div>
                                                <img src="./img/help/portfolio_6.png" @click.stop="openImageDialog"/>
                                            </div>
                                        </p>
                                        <p>
                                            Для таблиц предусмотрена возможность фильтрации,
                                            сортировки и отображения произвольного набора колонок. Вы
                                            включаете отображение только тех колонок, которые хотите
                                            видеть.
                                        </p>
                                        <p>
                                            Разворачивающиеся панели и таблицы сохраняют свое
                                            состояние, поэтому при следующем входе, будут отображены
                                            те колонки, которые вы отметили.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </v-card>
                    </v-expansion-panel-content>
                    <v-expansion-panel-content>
                        <template v-slot:actions>
                            <i class="custom-action-icon"></i>
                        </template>
                        <template v-slot:header>
                            <div id="balances">Страница Аналитика</div>
                        </template>
                        <v-card>
                            <div class="wrapper-content-panel">
                                <div class="wrapper-content-panel__single-section">
                                    <div class="wrapper-content-panel__single-section-item">
                                        <p>
                                            Здесь вы найдете подробный анализ вашего портфеля и указание
                                            на его узкие места - как можно увеличить доходность или снизить риск.
                                        </p>
                                        <p>
                                            <img src="./img/help/analytics_1.png" @click.stop="openImageDialog"/>
                                        </p>
                                        <p>
                                            Также вы найдете графики сравнения портфеля с бенчмарками (инфляция, ставки по депозитам, Индекс МосБиржи)
                                        </p>
                                        <p>
                                            <img src="./img/help/analytics_2.png" @click.stop="openImageDialog"/>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </v-card>
                    </v-expansion-panel-content>
                    <v-expansion-panel-content>
                        <template v-slot:actions>
                            <i class="custom-action-icon"></i>
                        </template>
                        <template v-slot:header>
                            <div id="trades">Страница Сделки</div>
                        </template>
                        <v-card>
                            <div class="wrapper-content-panel">
                                <div class="wrapper-content-panel__paired-section">
                                    <div class="wrapper-content-panel__paired-section-item">
                                        <p>
                                            На этой <a href="#/trades">странице</a> вы можете
                                            просмотреть все Ваши сделки по текущему портфелю. Для
                                            таблицы сделок также доступно сохранение состояния
                                            отображаемых колонок, сортировка и фильтрация.
                                        </p>
                                        <p>
                                            <img src="./img/help/trades_1.png" @click.stop="openImageDialog"/>
                                        </p>
                                        <p>
                                            Например, чтобы быстро просмотреть все сделки покупки
                                            по акции, необходимо в фильтре установить Акции и Покупка.
                                        </p>
                                        <p>
                                            Для просмотра всех денежных сделок, выключите Связанные сделки
                                            и выберите тип списка Денежные средства.
                                        </p>
                                    </div>
                                    <div class="wrapper-content-panel__paired-section-item">
                                        <p>
                                            Для каждой сделки доступно редактирование параметров, оно
                                            зависит от типа сделки (Акция, Облигация, Деньги).
                                        </p>
                                        <p>
                                            Из контекстного меню в таблице можно быстро добавить
                                            сделку. При разворачивании строки таблицы в доступно
                                            редактирование заметки к сделке.
                                        </p>
                                        <p>
                                            <img src="./img/help/trades_2.png" @click.stop="openImageDialog"/>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </v-card>
                    </v-expansion-panel-content>
                    <v-expansion-panel-content>
                        <template v-slot:actions>
                            <i class="custom-action-icon"></i>
                        </template>
                        <template v-slot:header>
                            <div id="commissions">
                                Добавление комиссий, расходов и доходов
                            </div>
                        </template>
                        <v-card>
                            <div class="wrapper-content-panel">
                                <div class="wrapper-content-panel__paired-section">
                                    <div class="wrapper-content-panel__paired-section-item">
                                        <p>
                                            Существует два основных вида сделок:
                                            <a @click.stop="openDialog(assetType.MONEY, operation.INCOME)"><span>Доход</span></a>
                                            /
                                            <a @click.stop="openDialog(assetType.MONEY, operation.LOSS)"><span>Расход</span></a>
                                            или
                                            <a @click.stop="openDialog(assetType.MONEY, operation.DEPOSIT)"><span>Внести</span></a>
                                            /
                                            <a @click.stop="openDialog(assetType.MONEY, operation.WITHDRAW)"><span>Вывести</span></a>
                                            . Сделки Доход / Расход влияют на прибыль, и отражаются на
                                            доходности портфеля.
                                        </p>
                                        <p>
                                            Например, вы можете учеть комиссию депозитарию за перевод
                                            бумаг от одного брокера к другому, абонентскую плату или
                                            другие виды расходов, связанных с ведением портфеля, внеся
                                            сделку типа Расход.
                                        </p>
                                        <p>
                                            А, например, полученные проценты по займам РЕПО, вычет по ИИС,
                                            вы можете внести как Доход. Чекбокс "Списать / Зачислить на счет"
                                            включен по умолчанию, означает, что также будет добавлена
                                            сделка влияющая на остаток денежных средств на счете.
                                        </p>
                                    </div>
                                    <div class="wrapper-content-panel__paired-section-item">
                                        <p>
                                            Сделки Ввод / Вывод непосредственно на прибыль не влияют,
                                            но влияют на остаток денежных средств на счете.
                                        </p>
                                        <p>
                                            Если вы считаете что какие-то категории расходов по
                                            портфелю не стоит учитывать в прибыли, вы можете внести
                                            сделку по Выводу денежных средств со счета, чтобы денежные
                                            остатки в системе совпадали с таковыми у вашего брокера.
                                        </p>
                                        <p>
                                            Также существует еще два вида сделок, это
                                            <a @click.stop="openDialog(assetType.MONEY, operation.CURRENCY_BUY)">Покупка валюты</a> и
                                            <a @click.stop="openDialog(assetType.MONEY, operation.CURRENCY_SELL)">Продажа валюты.</a>
                                            Данные сделки позволяют отобразить в вашем портфеле сделки по конвертации валют.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </v-card>
                    </v-expansion-panel-content>
                    <v-expansion-panel-content>
                        <template v-slot:actions>
                            <i class="custom-action-icon"></i>
                        </template>
                        <template v-slot:header>
                            <div id="events">Страница События</div>
                        </template>
                        <v-card>
                            <div class="wrapper-content-panel">
                                <div class="wrapper-content-panel__paired-section">
                                    <div class="wrapper-content-panel__paired-section-item">
                                        <p>
                                            <a href="#/events">Здесь</a> отображаются текущие
                                            начисления (дивиденды, купоны, амортизация, погашения) по
                                            бумагам в портфеле.
                                        </p>
                                        <p>
                                            Например, если Газпром заплатил дивиденды 16.06.2016, то
                                            начиная с 17.06.2016 в таблице Новые события появится
                                            информация о выплаченном дивиденде.
                                        </p>
                                        <p>
                                            При поступлении дивидендов на ваш счет вы просто исполняете
                                            данную дивидендную выплату нажатием на пункт меню Исполнить в таблице.
                                        </p>
                                        <p>
                                            <img src="./img/help/events_1.png" @click.stop="openImageDialog"/>
                                        </p>
                                        <p>
                                            При исполнении можно отредактировать дату зачисления,
                                            количество акций, внести заметку. По умолчанию размер
                                            начисления отображается уже за вычетом налога в 13%.
                                        </p>
                                    </div>
                                    <div class="wrapper-content-panel__paired-section-item">
                                        <p>
                                            <img src="./img/help/events_2.png" @click.stop="openImageDialog"/>
                                        </p>
                                        <p>
                                            Вы можете изменить размер начисления (в случаях когда
                                            используется произвольная ставка налогообложения,
                                            например, эмитент уменьшил НОБ).
                                        </p>
                                        <p>
                                            По умолчанию установлен чекбокс "Зачислить деньги", при
                                            исполнении выплаты, будет занесена сделка по добавлению
                                            начисления и сделка по зачислению денежных средств.
                                        </p>
                                        <p>
                                            Если убрать чекбокс, будет добавлена только сделка по
                                            зачислению начисления, если, например, вы выводите
                                            полученные начисления сразу из портфеля.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </v-card>
                    </v-expansion-panel-content>
                    <v-expansion-panel-content>
                        <template v-slot:actions>
                            <i class="custom-action-icon"></i>
                        </template>
                        <template v-slot:header>
                            <div id="combined_portfolio">Страница Составной портфель</div>
                        </template>
                        <v-card>
                            <div class="wrapper-content-panel">
                                <div class="wrapper-content-panel__single-section">
                                    <div class="wrapper-content-panel__single-section-item">
                                        <p>
                                            На этой <a href="#/combined-portfolio">странице</a> вы можете объединить для просмотра
                                            несколько портфелей в один, и проанализировать состав и
                                            доли каждой акции, если, например, она входит в состав
                                            нескольких портфелей.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </v-card>
                    </v-expansion-panel-content>
                    <v-expansion-panel-content>
                        <template v-slot:actions>
                            <i class="custom-action-icon"></i>
                        </template>
                        <template v-slot:header>
                            <div id="dividends">Страница Дивиденды</div>
                        </template>
                        <v-card>
                            <div class="wrapper-content-panel">
                                <div class="wrapper-content-panel__paired-section">
                                    <div class="wrapper-content-panel__paired-section-item">
                                        <p>
                                            <a href="#/dividends">Здесь</a> представлено четыре
                                            таблицы. Суммарные дивиденды. Отображаются суммарные
                                            выплаты и доходность по каждой акции.
                                        </p>
                                        <p>
                                            <img src="./img/help/dividends_1.png" @click.stop="openImageDialog"/>
                                        </p>
                                        <p>
                                            Дивиденды по годам. Отображаются суммарные выплаты и
                                            доходность в разбивке по тикеру и году.
                                        </p>
                                    </div>
                                    <div class="wrapper-content-panel__paired-section-item">
                                        <p>
                                            Сделки по дивидендам. Отображаются все внесенные сделки по
                                            дивидендам.
                                        </p>
                                        <p>
                                            Сумма дивидендов по годам. Отображается информация в
                                            разрезе по годам.
                                        </p>
                                        <p>
                                            Стоимость портфеля на конец года и дивидендная доходность
                                            портфеля рассчитанная относительно этой стоимости.
                                        </p>
                                        <p>
                                            Позволяет оценить тенденцию дивидендной доходности
                                            портфеля.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </v-card>
                    </v-expansion-panel-content>
                    <v-expansion-panel-content>
                        <template v-slot:actions>
                            <i class="custom-action-icon"></i>
                        </template>
                        <template v-slot:header>
                            <div id="quotes">Страница Котировки</div>
                        </template>
                        <v-card>
                            <div class="wrapper-content-panel">
                                <div class="wrapper-content-panel__paired-section">
                                    <div class="wrapper-content-panel__paired-section-item">
                                        <p>
                                            <a href="#/quotes">Здесь</a> вы можете посмотреть сводную
                                            информацию по всем бумагам и валютам, которые есть в сервисе.
                                        </p>
                                        <p>
                                            В разделе представлено три таблицы: Акции, Облигации и Валюты
                                        </p>
                                        <p>
                                            <img src="./img/help/quotes_1.png" @click.stop="openImageDialog"/>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </v-card>
                    </v-expansion-panel-content>
                    <v-expansion-panel-content>
                        <template v-slot:actions>
                            <i class="custom-action-icon"></i>
                        </template>
                        <template v-slot:header>
                            <div id="quotes">Страница Информация</div>
                        </template>
                        <v-card>
                            <div class="wrapper-content-panel">
                                <div class="wrapper-content-panel__paired-section">
                                    <div class="wrapper-content-panel__paired-section-item">
                                        <p>
                                            На данной <a href="#/share-info">странице</a> вы найдете подробную информацию об
                                            эмитенте и просмотреть историю дивидендных выплат для акции, купонов, амортизации и погашений для облигации.
                                        </p>
                                        <p>
                                            Также на графике вы сможете увидеть динамику изменения цены бумаги за выбранный период.
                                        </p>
                                        <p>
                                            <img src="./img/help/information_1.png" @click.stop="openImageDialog"/>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </v-card>
                    </v-expansion-panel-content>
                    <v-expansion-panel-content>
                        <template v-slot:actions>
                            <i class="custom-action-icon"></i>
                        </template>
                        <template v-slot:header>
                            <div id="settings">Настройки</div>
                        </template>
                        <v-card>
                            <div class="wrapper-content-panel">
                                <div class="wrapper-content-panel__paired-section">
                                    <div class="wrapper-content-panel__paired-section-item">
                                        <div>
                                            <a id="settings_portfolio" class="non-cursor-click">Управление портфелями</a>
                                        </div>
                                        <p>
                                            На этой <a href="#/settings/portfolio-management">вкладке</a> можно
                                            управлять своими портфелями, добавить новый, удалить
                                            существующий. Для существующих портфелей доступно
                                            редактирование имени, можно задать размер фиксированной
                                            комиссии (в процентах, тогда при добавлении сделок,
                                            комиссия будет рассчитываться автоматически),задать валюту
                                            портфеля.
                                        </p>
                                        <p>
                                            У портфеля есть доступ, по умолчанию он Закрытый, портфель
                                            можно сделать доступным для просмотра по ссылке. Отдельно
                                            настраивается доступ к различным частям портфеля: таблица
                                            Портфель, график стоимости портфеля, Сделки, Сделки по
                                            дивидендам.
                                        </p>
                                        <p>
                                            Также можно получить код на встраиваемые блоки-информеры -
                                            полезно, если Вы хотите разместить наглядную информацию о
                                            своем портфеле на своем сайте или в блоге.
                                        </p>
                                        <p>
                                            <img src="./img/help/settings_1.png" @click.stop="openImageDialog"/>
                                        </p>
                                        <div>
                                            <a id="settings_public" class="non-cursor-click">Публичный доступ</a>
                                        </div>
                                        <p>
                                            При публичном доступе доступно встраивание информеров с
                                            информацией по портфелю на форумы или блоги.
                                        </p>
                                        <p>
                                            <img src="./img/help/settings_3.png" @click.stop="openImageDialog"/>
                                        </p>
                                        <p>
                                            В сокращенном варианте не отображается суммарная стоимость портфеля, а только его текущие показатели доходности.
                                            Дополнительные настройки портфеля доступны при разворачивании строки в таблице. Здесь можно задать тип счета (Брокерский или ИИС).
                                        </p>
                                        <p>
                                            <img src="./img/help/settings_4.png" @click.stop="openImageDialog"/>
                                        </p>
                                        <p>
                                            Параметр "Профессиональный режим" во включенном состоянии позволяет добавлять короткие позиции в портфель,
                                            при этом не будет проверяться количество доступных бумаг при продаже.
                                            А также разрешает маржинальные сделки, со списанием денег больше чем есть на счету.
                                        </p>
                                        <p>
                                            <img src="./img/help/settings_5.png" @click.stop="openImageDialog"/>
                                        </p>
                                    </div>
                                    <div class="wrapper-content-panel__paired-section-item">
                                        <div>
                                            <a class="non-cursor-click">Профиль</a>
                                        </div>
                                        <p>
                                            <a href="#/profile">Здесь</a> можно сменить пароль и адрес
                                            электронной почты. Новый адрес необходимо подтвердить.
                                            Уведомления будут приходить на новый адрес электронной
                                            почты.
                                        </p>
                                        <p>
                                            Также здесь можно отвязать вашу карту для отмены автоматического продления подписки.
                                            Можно отписаться от рассылки или подписаться на нее снова.
                                        </p>
                                        <p>
                                            <img src="./img/help/settings_2.png" @click.stop="openImageDialog"/>
                                        </p>
                                        <div>
                                            <a id="tariffs_public" class="non-cursor-click">Тарифы</a>
                                        </div>
                                        <p>
                                            <a href="#/settings/tariffs">В данном разделе</a> вы можете посмотреть свой текущий тарифный план, подключить или продлить
                                            подписку на сервис, применить подарочные промокоды. Не все тарифные планы могут быть доступны для выбора.
                                            Например, если у вас раньше был подключен тарифный план Профессионал, и у вас заведено 4 портфеля, то вы не сможете выбрать
                                            для подключениятарифный план Стандарт, потому что будете превышать ограничения тарифного плана.
                                        </p>
                                        <p>
                                            Либо если на тарифе Профессионал в портфеле у вас есть
                                            зарубежные бумаги и валюта, то переход на другие тарифы
                                            будет невозможен. В этом случае вам надо будет удалить все
                                            сделки по валюте и зарубежным бумагам.
                                        </p>
                                        <p>
                                            Но если ваше текущее количество ценных бумаг и портфелей
                                            позволяют выбрать тариф, то вы можете подключить его.
                                            Возможно как понижение тарифного плана так и повышение, с
                                            последующим перерасчетом. Например, вы оплатили тарифный
                                            план Профессионал на месяц, и по прошествии двух недель
                                            решаете перейти на тарифный план Стандарт, вам нужно будет
                                            произвести оплату выбранного тарифного плана на месяц или
                                            год, и остаток от перерасчета прошлого тарифа будет
                                            прибавлен к оплаченному сроку.
                                        </p>
                                        <div>
                                            <a id="settings_promo_codes" class="non-cursor-click">Промокоды</a>
                                        </div>
                                        <p>
                                            <a href="#/settings/promo-codes">В данном</a> разделе будет
                                            представлен личный промокод, которым вы сможете делиться
                                            со своими знакомыми. Воспользовавшись им, они получают
                                            скидку 20% на первую покупку любого тарифного плана, а вы
                                            получаете месяц подписки совершенно бесплатно с первой
                                            оплаты, либо 30% от всех последующих оплат приглашенного
                                            Вами пользователя. Ниже можно настроить вид
                                            вознаграждения.
                                        </p>
                                        <p>
                                            <img src="./img/help/settings_6.png" @click.stop="openImageDialog"/>
                                        </p>
                                        <div>
                                            <a id="settings_notifications" class="non-cursor-click">Уведомления</a>
                                        </div>
                                        <p>
                                            <a href="#/settings/notifications">Здесь</a> можно настроить
                                            уведомления о достижении целевых цен на акции/облигации и
                                            подписаться на новости интересующих эмитентов.
                                        </p>
                                        <p>
                                            <img src="./img/help/settings_7.png" @click.stop="openImageDialog"/>
                                        </p>
                                        <p>
                                            В первом случае вы формируете список бумаг для оповещений, и
                                            задаете цены, при которых будет срабатывать уведомление.
                                            Для целевой цены можно можно задать допуск цены, чтобы
                                            увеличить диапазон срабатывания. При достижении целевой
                                            цены будет отправлено письмо с уведомлением. Уведомления
                                            отправляются один раз за текущий день, при достижении
                                            целевых цен.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </v-card>
                    </v-expansion-panel-content>
                    <v-expansion-panel-content>
                        <template v-slot:actions>
                            <i class="custom-action-icon"></i>
                        </template>
                        <template v-slot:header>
                            <div id="help">Вопросы и помощь</div>
                        </template>
                        <v-card>
                            <div class="wrapper-content-panel">
                                <div class="wrapper-content-panel__single-section">
                                    <div class="wrapper-content-panel__single-section-item">
                                        <p>
                                            Если у Вас есть вопросы или предложения по работе сайта,
                                            вы можете написать нам по эл.почте
                                            <a @click.stop="openFeedBackDialog">web@intelinvest.ru</a> или
                                            задать вопрос на канале
                                            <a href="https://telegram.me/intelinvestSupportBot" title="Задайте вопрос в Telegram" target="_blank">telegram</a>
                                            наши специалисты с радостью вам ответят и помогут.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </v-card>
                    </v-expansion-panel-content>
                    <v-expansion-panel-content>
                        <template v-slot:actions>
                            <i class="custom-action-icon"></i>
                        </template>
                        <template v-slot:header>
                            <div id="privacy">Соглашение</div>
                        </template>
                        <v-card>
                            <div class="wrapper-content-panel">
                                <div class="wrapper-content-panel__single-section">
                                    <v-layout>
                                        <a href="/terms-of-use" target="_blank">Пользовательское соглашение</a>
                                    </v-layout>
                                </div>
                            </div>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </div>
            <div>
                <v-btn depressed fixed fab bottom right color="#F0F3F8" @click.stop="$vuetify.goTo('#up')" class="wrapper-content-panel__privacy-section-up-page-btn">
                    <v-icon color="#8a98af">keyboard_arrow_up</v-icon>
                </v-btn>
            </div>
        </v-container>
    `
})
export class HelpPage extends UI {

    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: number) => Promise<void>;
    @MainStore.Getter
    private portfolio: Portfolio;

    private assetType = AssetType;
    private operation = Operation;
    /* Управление какие блоки открыты при загрузке страницы */
    private configExpansionPanel: boolean[] = [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true
    ];

    /* Диалог добавления сделок */
    private async openDialog(assetType: AssetType, operation: Operation): Promise<void> {
        const result = await new AddTradeDialog().show({
            store: this.$root.$store.state[StoreType.MAIN],
            router: this.$root.$router,
            operation,
            assetType
        });
        if (result) {
            await this.reloadPortfolio(this.portfolio.id);
        }
    }

    private async openImageDialog(): Promise<void> {
        await new ImageDialog().show((event as any).target.attributes[0].nodeValue);
    }

    /* Диалог обратной связи */
    private async openFeedBackDialog(): Promise<void> {
        await new FeedbackDialog().show(this.$root.$store.state[StoreType.MAIN].clientInfo);
    }
}
