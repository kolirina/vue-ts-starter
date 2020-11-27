import {namespace} from "vuex-class";
import {Component, UI} from "../app/ui";
import {ClientInfo} from "../services/clientService";
import {TariffUtils} from "../utils/tariffUtils";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <div class="sale">
            <v-icon class="sale__close" @click.native="close">close</v-icon>
            <div class="sale__content">
                <div class="sale__title">Черная пятница в Intelinvest</div>
                <div class="sale__description selectable">
                    <template v-if="discountApplied">
                        оплатите со своей персональной скидкой {{ clientInfo.user.nextPurchaseDiscount }}%
                    </template>
                    <template v-else>
                        скидка 20% по промокоду: BLACKFRIDAY<br>действует до 28.11.20
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
        this.$router.push({name: "tariffs"});
    }

    private close(): void {
        this.$emit("closeBanner");
    }

    private get discountApplied(): boolean {
        return TariffUtils.isDiscountApplied(this.clientInfo);
    }
}
