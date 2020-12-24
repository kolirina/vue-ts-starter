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
                <v-btn color="primary" class="big_btn" @click="openGiftLink">Купить сертификат</v-btn>
            </div>
            <div class="banner__img">
                <img src="./img/portfolio/gift-img.png" alt="sale">
            </div>
        </div>
    `
})
export class GiftBanner extends UI {

    private close(): void {
        this.$emit("closeBanner");
    }

    /**
     * Осуществляет переход на страницу просмотра портфеля
     * @param id идентификатор портфеля
     */
    private openGiftLink(id: number): void {
        const url = `${window.location.protocol}//${window.location.host}/gift`;
        window.open(url, "_blank");
    }
}
