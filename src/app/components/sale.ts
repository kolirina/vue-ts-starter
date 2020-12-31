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
                <div class="banner__title">Новый год с Intelinvest!</div>
                <div class="banner__description selectable">
                    <template v-if="discountApplied">
                        оплатите со своей персональной скидкой {{ clientInfo.user.nextPurchaseDiscount }}%
                    </template>
                    <template v-else>
                        cкидка 20% по коду
                    </template>
                </div>
                <div v-if="!discountApplied" class="banner__ny-code">
                    <div class="banner__ny-code_code selectable">NY2021</div>
                    <div class="banner__ny-code_active">Активен до 03.01.2021</div>
                </div>
                <v-btn color="primary" class="big_btn" @click="goToTariffs">Оплатить тарифный план</v-btn>
            </div>
            <div class="banner__img">
                <img src="./img/portfolio/ny-banner-balls.svg" alt="sale">
            </div>
        </div>
    `
})
export class SaleComponent extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;

    /** Переход на страницу тарифов */
    private goToTariffs(): void {
        // если у пользователя уже есть скидка и она больше 20% то промокод не применяем
        const needApply = TariffUtils.isDiscountApplied(this.clientInfo) &&
            this.clientInfo.user.nextPurchaseDiscount <= 20;
        this.$router.push({name: "tariffs", query: {promoCode: "NY2021", needApply: String(needApply)}});
        this.close();
    }

    private close(): void {
        this.$emit("closeBanner");
    }

    private get discountApplied(): boolean {
        return TariffUtils.isDiscountApplied(this.clientInfo) &&
            this.clientInfo.user.nextPurchaseDiscount > 20;
    }
}
