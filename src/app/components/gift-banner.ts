import {Component, UI} from "../app/ui";

@Component({
    // language=Vue
    template: `
        <div class="banner gift-banner">
            <v-icon class="banner__close" @click.native="close">close</v-icon>
            <div class="banner__content">
                <div class="banner__title">Подарочные сертификаты</div>
                <div class="banner__description">
                    подарите контроль инвестиций родным, друзьям или коллегам
                </div>
                <v-btn color="primary" class="big_btn" href="https://intelinvest.ru/gift" target="_blank">Купить сертификат</v-btn>
            </div>
            <img src="./img/portfolio/gift-img.png" alt="sale">
        </div>
    `
})
export class GiftBanner extends UI {

    private close(): void {
        this.$emit("closeBanner");
    }
}
