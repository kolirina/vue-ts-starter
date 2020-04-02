/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2019
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2019
 */

import {Client} from "../services/clientService";

export class HelpDeskUtils {

    static isWidgetInit = false;

    static initWidget(user: Client): void {
        if (!HelpDeskUtils.isWidgetInit) {
            HelpDeskUtils.initCallback(user);
            const widgetScript = document.createElement("script");
            widgetScript.src = "https://lib.usedesk.ru/secure.usedesk.ru/widget_157910_17658.js";
            document.head.appendChild(widgetScript);
            HelpDeskUtils.isWidgetInit = true;
        }
    }

    static toggleWidget(toggle: boolean, client: Client): void {
        if (toggle) {
            if (HelpDeskUtils.isWidgetInit) {
                window.usedeskMessenger?.toggle(true);
            } else {
                HelpDeskUtils.initWidget(client);
            }
        } else {
            window.usedeskMessenger?.toggle(false);
        }
    }

    private static initCallback(user: Client): void {
        window.__widgetInitCallback = (widget: UseDeskWidget) => {
            const expectedWidget = window.usedeskMessenger;
            expectedWidget.identify({
                email: user.email,
                name: user.username
            });
        };
    }
}
