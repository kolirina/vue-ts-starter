import {Component, UI} from "../../app/ui";

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            <v-card flat class="header-first-card">
                <v-card-title class="header-first-card__wrapper-title">
                    <div class="section-title header-first-card__title-text">Профиль</div>
                </v-card-title>
            </v-card>
            <v-layout class="profile" column>
                <div @click="goToMainSetting">Основные настройки</div>
                <div @click="goToPaymentSetting">Способ оплаты</div>
                <div @click="goToInterfaceSetting">Настройки интерфейса</div>
                <div @click="goToSubscriptionsSetting">Подписки</div>
            </v-layout>
        </v-container>
    `
})
export class ProfilePage extends UI {

    private goToMainSetting(): void {
        this.$router.push({name: "profile-main"});
    }

    private goToPaymentSetting(): void {
        this.$router.push({name: "profile-payment"});
    }

    private goToInterfaceSetting(): void {
        this.$router.push({name: "profile-interface"});
    }

    private goToSubscriptionsSetting(): void {
        this.$router.push({name: "profile-subscription"});
    }
}
