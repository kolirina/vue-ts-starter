import dayjs from "dayjs";
import {Component, namespace, Prop, UI} from "../../app/ui";
import {ClientInfo} from "../../services/clientService";
import {DateUtils} from "../../utils/dateUtils";
import {TariffUtils} from "../../utils/tariffUtils";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-layout column relative>
            <v-layout class="mini-menu-width" align-center justify-end column>
                <div>
                    <v-btn flat round icon dark :to="{name: 'portfolio-management'}" title="Управление портфелями" active-class="active-btn-link" class="link-icon-btn">
                        <span class="settings-icon"></span>
                    </v-btn>
                </div>
                <div class="mt-1">
                    <v-btn flat icon dark :to="{name: 'profile'}" title="Профиль" active-class="active-btn-link" class="link-icon-btn">
                        <span class="profile-icon"></span>
                    </v-btn>
                </div>
                <div class="mt-1 mb-3">
                    <v-btn flat icon dark :to="{name: 'logout'}" title="Выход" active-class="active-btn-link" class="link-icon-btn">
                        <span class="logout-icon"></span>
                    </v-btn>
                </div>
            </v-layout>
            <v-tooltip v-if="!sideBarOpened" content-class="custom-tooltip-wrap" max-width="340px" top nudge-right="55">
                <div slot="activator" :class="{'subscribe-status': true, 'subscribe-status_warning': false}">{{ subscribeDescription }}</div>
                <span>{{ expirationDescription }}</span>
            </v-tooltip>
        </v-layout>
    `
})
export class MenuBottomNavigation extends UI {

    @Prop({type: Boolean, default: false})
    private sideBarOpened: boolean;

    @MainStore.Getter
    private clientInfo: ClientInfo;

    private get subscribeDescription(): string {
        const paidTill = DateUtils.parseDate(this.clientInfo.user.paidTill);
        const currentDate = dayjs();
        const diff = paidTill.get("date") - currentDate.get("date");
        if (TariffUtils.isTariffExpired(this.clientInfo.user) || diff < 0) {
            return "Подписка истекла";
        } else {
            if (paidTill.isAfter(currentDate) && diff > 5) {
                return "Подписка активна";
            } else if (diff <= 5 && diff >= 0) {
                return "Подписка истекает";
            }
        }
        return "";
    }

    private get expirationDescription(): string {
        return `${this.subscribeDescription} ${this.expirationDate}`;
    }

    private get expirationDate(): string {
        return DateUtils.formatDate(DateUtils.parseDate(this.clientInfo.user.paidTill));
    }
}
