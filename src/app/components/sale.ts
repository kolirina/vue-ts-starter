import {Component, UI} from "../app/ui";

@Component({
    // language=Vue
    template: `
        <div class="sale">
            <v-icon class="sale__close" @click.native="close">close</v-icon>
            <div class="sale__content">
                <div class="sale__title">Черная пятница в Intelinvest</div>
                <div class="sale__description">
                    скидка 20% по промокоду: BLACKFRIDAY<br>действует до 28.11.20
                </div>
                <v-btn color="primary" class="big_btn" @click="goToTariffs">Оплатить тарифный план</v-btn>
            </div>
            <img src="../img/portfolio/sale-img.svg" alt="sale">
        </div>
    `
})
export class SaleComponent extends UI {

    /** Переход на страницу тарифов */
    private goToTariffs(): void {
        this.$router.push("/settings/tariffs");
    }

    private close(): void {
        this.$emit("closeBanner");
    }
}