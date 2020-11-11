import {namespace} from "vuex-class";
import {Component, Prop, UI} from "../../app/ui";
import {ClientInfo} from "../../services/clientService";
import {Tariff} from "../../types/tariff";
import {NavBarItem} from "../../types/types";
import {DateUtils} from "../../utils/dateUtils";
import {TariffUtils} from "../../utils/tariffUtils";
import {StoreType} from "../../vuex/storeType";
import {PortfolioSwitcher} from "../portfolioSwitcher";
import {MenuBottomNavigation} from "./menuBottomNavigation";
import {NavigationLink} from "./navigationLink";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-layout class="overflow-hidden">
            <v-layout column justify-space-between align-center class="mini-menu-width">
                <div>
                    <v-btn @click.stop="openDialog" fab dark small color="indigo" depressed class="add-btn-menu">
                        <v-icon dark>add</v-icon>
                    </v-btn>
                    <div v-if="sideBarOpened" class="iconMenu iconMenu-calc-height">
                        <vue-scroll>
                            <navigation-link v-for="item in mainSection" :item="item" :key="item.action" icon-mode></navigation-link>
                        </vue-scroll>
                    </div>
                </div>
                <menu-bottom-navigation :side-bar-opened="sideBarOpened"></menu-bottom-navigation>
            </v-layout>
            <v-layout v-if="!sideBarOpened" column class="wrap-list-menu">
                <div v-if="showFreeTariffBlock" class="tariff-notification">
                    <div class="margB8">У Вас бесплатный тариф. Подпишитесь и получите полный набор инструментов для учета активов без ограничений</div>
                    <a @click="goToTariffs" class="v-btn theme--light big_btn primary">Подписаться</a>
                </div>
                <navigation-link v-for="item in mainSection" :item="item" :key="item.action"></navigation-link>
                <v-tooltip v-if="!sideBarOpened" content-class="custom-tooltip-wrap" class="margTAuto" max-width="340px" top nudge-right="55">
                    <div slot="activator" @click="goToTariffs" :class="{'subscribe-status': true, 'subscribe-status_warning': false}">{{ subscribeDescription }}</div>
                    <span>{{ expirationDescription }}</span>
                </v-tooltip>
            </v-layout>
        </v-layout>
    `,
    components: {PortfolioSwitcher, MenuBottomNavigation, NavigationLink}
})
export class NavigationList extends UI {

    @Prop({type: Boolean, required: true})
    private sideBarOpened: boolean;

    @Prop({required: true})
    private mainSection: NavBarItem[];

    @MainStore.Getter
    private clientInfo: ClientInfo;

    private openDialog(): void {
        this.$emit("openDialog");
    }

    private goToTariffs(): void {
        if (this.$router.currentRoute.name !== "tariffs") {
            this.$router.push({name: "tariffs"});
        }
    }

    private get showFreeTariffBlock(): boolean {
        return this.clientInfo.user.tariff === Tariff.FREE;
    }

    private get subscribeDescription(): string {
        return TariffUtils.getSubscribeDescription(this.clientInfo.user);
    }

    private get expirationDescription(): string {
        return `${TariffUtils.getSubscribeDescription(this.clientInfo.user, true)} ${this.expirationDate}`;
    }

    private get expirationDate(): string {
        return DateUtils.formatDate(DateUtils.parseDate(this.clientInfo.user.paidTill));
    }
}
