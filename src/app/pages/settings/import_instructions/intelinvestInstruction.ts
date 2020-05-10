import Component from "vue-class-component";
import {UI} from "../../../app/ui";

@Component({
    // language=Vue
    template: `
        <div class="intel-invest-instruction">
            <div class="intel-invest-instruction__title">Вы можете импортировать сделки сами, создав CSV-файл следующей структуры:</div>
            <div class="intel-invest-instruction__format">
                <div class="intel-invest-instruction__format-text">
                    TYPE;DATE;TICKER;QUANTITY;PRICE;FEE;NKD;NOMINAL;CURRENCY;FEE_CURRENCY;NOTE;LINK_ID;
                </div>
            </div>
            <div class="intel-invest-instruction__title-values">
                Поле <strong>TYPE</strong> может принимать значения:
            </div>
            <div class="intel-invest-instruction__values">
                <div class="intel-invest-instruction__values-item">
                    <div class="intel-invest-instruction__values-item__title">STOCKBUY / STOCKSELL</div>
                    <div class="intel-invest-instruction__values-item__content">
                        Покупка/Продажа Акции. Поля: тикер, дата, количество, цена, комиссия, [заметка], валюта, [id связанной сделки]
                    </div>
                </div>
                <div class="intel-invest-instruction__values-item">
                    <div class="intel-invest-instruction__values-item__title">ASSET_BUY / ASSET_SELL</div>
                    <div class="intel-invest-instruction__values-item__content">
                        Покупка/Продажа Произвольного актива. Поля: тикер, дата, количество, цена, комиссия, [заметка], валюта, [id связанной сделки]
                    </div>
                </div>
                <div class="intel-invest-instruction__values-item">
                    <div class="intel-invest-instruction__values-item__title">BONDBUY / BONDSELL</div>
                    <div class="intel-invest-instruction__values-item__content">
                        Покупка/Продажа Облигации. Поля: secid, дата, количество, цена в %, комиссия, НКД, номинал,
                        [заметка], валюта, [id связанной сделки]
                    </div>
                </div>
                <div class="intel-invest-instruction__values-item">
                    <div class="intel-invest-instruction__values-item__title">COUPON</div>
                    <div class="intel-invest-instruction__values-item__content">
                        Выплата купона. Поля: тикер, дата, количество, сумма выплаты, [заметка], валюта, [id связанной сделки]
                    </div>
                </div>
                <div class="intel-invest-instruction__values-item">
                    <div class="intel-invest-instruction__values-item__title">AMORTIZATION</div>
                    <div class="intel-invest-instruction__values-item__content">
                        Выплата амортизации. Поля: тикер, дата, количество, сумма выплаты, [заметка], валюта, [id связанной
                        сделки]
                    </div>
                </div>
                <div class="intel-invest-instruction__values-item">
                    <div class="intel-invest-instruction__values-item__title">DIVIDEND</div>
                    <div class="intel-invest-instruction__values-item__content">
                        Выплата Дивиденда. Поля: тикер, дата, количество, сумма выплаты, [заметка], валюта, [id связанной сделки]
                    </div>
                </div>
                <div class="intel-invest-instruction__values-item">
                    <div class="intel-invest-instruction__values-item__title">ASSET_DIVIDEND</div>
                    <div class="intel-invest-instruction__values-item__content">
                        Выплата произвольного дохода по активу. Поля: тикер, дата, количество, сумма выплаты, [заметка], валюта, [id связанной сделки]
                    </div>
                </div>
                <div class="intel-invest-instruction__values-item">
                    <div class="intel-invest-instruction__values-item__title">MONEYDEPOSIT</div>
                    <div class="intel-invest-instruction__values-item__content">
                        Зачисление денежных средств на счет. Поля: дата, сумма, [заметка], валюта, [id связанной сделки]
                    </div>
                </div>
                <div class="intel-invest-instruction__values-item">
                    <div class="intel-invest-instruction__values-item__title">MONEYWITHDRAW</div>
                    <div class="intel-invest-instruction__values-item__content">
                        Вывод денежных средств со счета. Поля: дата, сумма, [заметка], валюта, [id связанной сделки]
                    </div>
                </div>
                <div class="intel-invest-instruction__values-item">
                    <div class="intel-invest-instruction__values-item__title">INCOME</div>
                    <div class="intel-invest-instruction__values-item__content">
                        Произвольный доход. Поля: дата, сумма, [заметка], валюта, [id связанной сделки]
                    </div>
                </div>
                <div class="intel-invest-instruction__values-item">
                    <div class="intel-invest-instruction__values-item__title">LOSS</div>
                    <div class="intel-invest-instruction__values-item__content">
                        Произвольный расход. Поля: дата, сумма, [заметка], валюта, [id связанной сделки]
                    </div>
                </div>
                <div class="intel-invest-instruction__values-item">
                    <div class="intel-invest-instruction__values-item__title">CURRENCY_BUY</div>
                    <div class="intel-invest-instruction__values-item__content">
                        Обмен валюты (Покупка). Поля: дата, сумма, [заметка], валюта, id связанной сделки
                    </div>
                </div>
                <div class="intel-invest-instruction__values-item">
                    <div class="intel-invest-instruction__values-item__title">CURRENCY_SELL</div>
                    <div class="intel-invest-instruction__values-item__content">
                        Обмен валюты (Продажа). Поля: дата, сумма, [заметка], валюта, id связанной сделки
                    </div>
                </div>
                <div class="intel-invest-instruction__values-l-section">
                    Параметр <b>LINK_ID</b> (id связанной сделки), для создания связанных сделок, должен быть уникальным и
                    совпадать у двух связанных сделок. Например, у сделки по покупке акции указываете 1, и у сделки по деньгам тоже 1.
                    Этот параметр опциональный для всех типов сделок кроме сделок по Обмену валюты.
                </div>
            </div>

            <ul>
                <li>В заметке, по возможности, не используйте спецсимволы</li>
                <li>Проверьте кодировку файла (csv), она должна быть UTF-8</li>
                <li>НКД в отчете должен указываться на одну бумагу</li>
                <li>Количество бумаг должно быть указано в штуках (не в лотах)</li>
                <li>Формат даты должен быть либо короткий 15.01.2018, либо полный 15.01.2018 12:55:07</li>
                <li>Колонка FEE_CURRENCY может быть не заполнена, если комиссия не указывается</li>
                <li>Для каждого типа сделки указан набор обязательных полей, необязательные поля, отмечены квадратными скобками [заметка]</li>
            </ul>

            <div class="intel-invest-instruction__title-template">Скачать шаблоны отчетов с примерами</div>
            <div class="intel-invest-instruction__template">
                <div>
                    <a href="static/example.csv">example.csv</a>
                </div>
                <div>
                    <a href="static/example.xlsx">example.xlsx</a>
                </div>
            </div>
            <div class="intel-invest-instruction__template-requirements">
                Используйте шаблон в формате xlsx для формирования таблицы со своими сделками, и просто сохраните результат
                как файл в формате csv (разделители запятая) чтобы использовать его при импорте.
            </div>
        </div>
    `
})
export class IntelinvestInstruction extends UI {
}
