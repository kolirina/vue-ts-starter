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

import {namespace} from "vuex-class";
import {Component, UI} from "../app/ui";
import {ClientInfo} from "../services/clientService";
import {HelpDeskUtils} from "../utils/HelpDeskUtils";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <span class="d-none"></span>
    `
})
export class HelpDeskWidget extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;

    created(): void {
        if (this.clientInfo.user.needShowHelpDeskWidget) {
            HelpDeskUtils.initWidget(this.clientInfo.user);
        }
    }
}
