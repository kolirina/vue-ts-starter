import {namespace} from "vuex-class";
import {Component, UI} from "../../app/ui";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {EventType} from "../../types/eventType";
import {Portfolio} from "../../types/types";
import {MutationType} from "../../vuex/mutationType";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

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
                <div class="profile__items">
                    <div @click="goToMainSetting" class="profile-item">
                        <div class="profile-item__header">
                            <img src="./img/profile/main-settings.svg" alt="">
                            <span>Основные настройки</span>
                        </div>
                        <ul>
                            <li>Смена пароля</li>
                            <li>Смена Email</li>
                        </ul>
                        <ul>
                            <li>Публичное имя инвестора</li>
                            <li>Ссылка на личный сайт</li>
                        </ul>
                    </div>
                    <div @click="goToPaymentSetting" class="profile-item">
                        <div class="profile-item__header">
                            <img src="./img/profile/payment-method.svg" alt="">
                            <span>Способ оплаты</span>
                        </div>
                        <ul>
                            <li>Тарифный план</li>
                            <li>Способ оплаты</li>
                        </ul>
                    </div>
                    <div @click="goToInterfaceSetting" class="profile-item">
                        <div class="profile-item__header">
                            <img src="./img/profile/interface-settings.svg" alt="">
                            <span>Настройки интерфейса</span>
                        </div>
                        <ul>
                            <li>Выбор темы</li>
                            <li>Виджет помощи</li>
                        </ul>
                    </div>
                    <div @click="goToSubscriptionsSetting" class="profile-item">
                        <div class="profile-item__header">
                            <img src="./img/profile/subscriptions.svg" alt="">
                            <span>Подписки</span>
                        </div>
                        <ul>
                            <li>Информационная рассылка</li>
                        </ul>
                    </div>
                </div>
            </v-layout>
        </v-container>
    `
})
export class ProfilePage extends UI {

    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: number) => Promise<void>;
    @MainStore.Getter
    private portfolio: Portfolio;

    /**
     * Инициализирует данные компонента
     * @inheritDoc
     */
    @ShowProgress
    async created(): Promise<void> {
        UI.on(EventType.TRADE_CREATED, async () => await this.reloadPortfolio(this.portfolio.id));
    }

    beforeDestroy(): void {
        UI.off(EventType.TRADE_CREATED);
    }

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
