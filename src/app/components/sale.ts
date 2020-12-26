import {namespace} from "vuex-class";
import {Component, UI} from "../app/ui";
import {ClientInfo} from "../services/clientService";
import {TariffUtils} from "../utils/tariffUtils";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <div class="banner sale-banner">
            <v-icon class="banner__close" @click.native="close">close</v-icon>
            <div class="banner__content">
                <div class="banner__title">Новогодние скидки в Intelinvest</div>
                <div class="banner__description selectable">
                    <template v-if="discountApplied">
                        оплатите со своей персональной скидкой {{ clientInfo.user.nextPurchaseDiscount }}%
                    </template>
                    <template v-else>
                        скидка 20% по промокоду: NY2021<br>действует до 03.01.2021
                    </template>
                </div>
                <v-btn color="primary" class="big_btn" @click="goToTariffs">Оплатить тарифный план</v-btn>
            </div>
            <img src="./img/portfolio/sale-img.svg" alt="sale">
        </div>
    `
})
export class SaleComponent extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;

    /** Переход на страницу тарифов */
    private goToTariffs(): void {
        this.$router.push({name: "tariffs", query: {promoCode: "NY2021"}});
        this.close();
    }

    private close(): void {
        this.$emit("closeBanner");
    }

    private get discountApplied(): boolean {
        return TariffUtils.isDiscountApplied(this.clientInfo);
    }
}
