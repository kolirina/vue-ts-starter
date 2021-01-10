import {namespace} from "vuex-class/lib/bindings";
import {Component, UI} from "../app/ui";
import {ClientInfo} from "../services/clientService";
import {Tariff} from "../types/tariff";
import {TariffHint} from "../types/types";
import {DateUtils} from "../utils/dateUtils";
import {TariffUtils} from "../utils/tariffUtils";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <div v-if="clientInfo && hintCoords" :style="{ left: hintCoords.x, top: hintCoords.y, display: hintCoords.display }" class="custom-v-menu" v-tariff-expired-hint>
            <div class="v-menu-content">
                <template v-if="tariffExpired">
                    <template v-if="isFreeTariff || isExpiredTrial">
                        Подключите любой платный тарифный план (Профессионал или Стандарт) для получения доступа ко всем возможностям сервиса.
                    </template>
                    <template v-else-if="isExpiredStandard">
                        Продлите вашу подписку на тарифный план Стандарт или подключите тарифный план Профессионал для получения доступа ко всем возможностям сервиса.
                    </template>
                    <template v-else-if="isExpiredPro">
                        Продлите вашу подписку на тарифный план Профессионал для получения доступа ко всем возможностям сервиса.
                    </template>
                    <br/>
                    <br/>
                </template>
                <template v-if="limitsExceeded">
                    Вы превысили условия вашего текущего тафира
                    <p>
                        <template v-if="exceedLimitByPortfolios">
                            Создано портфелей: <b>{{ clientInfo.user.portfoliosCount }}</b> Доступно на тарифе: <b>{{ maxPortfoliosCount }}</b><br/>
                        </template>
                        <template v-if="exceedLimitByShareCount">
                            <template v-if="oldStandardTariffsLimitsApplicable">
                                Добавлено ценных бумаг: <b>{{ sharesCount }}</b> Доступно на тарифе: <b>{{ maxSharesCount }}</b> <br>
                            </template>
                            <template v-else>
                                В одном из портфелей превышено допустимое количество бумаг. Доступно на тарифе: <b>{{ maxSharesCount }}</b> на портфель <br>
                            </template>
                        </template>
                    </p>
                </template>
                Подробнее узнать о тарифных планах Intelinvest, вы можете по <span @click.stop="goToTariff" class="link">ссылке</span>.
            </div>
        </div>
    `
})
export class TariffExpiredHint extends UI {

    @MainStore.Getter
    private hintCoords: TariffHint;
    @MainStore.Getter
    private clientInfo: ClientInfo;

    private goToTariff(): void {
        this.$router.push({path: "/settings/tariffs"});
    }

    private get isFreeTariff(): boolean {
        return this.clientInfo.user.tariff === Tariff.FREE;
    }

    private get isExpiredTrial(): boolean {
        return this.clientInfo.user.tariff === Tariff.TRIAL && this.tariffExpired;
    }

    private get isExpiredStandard(): boolean {
        return this.clientInfo.user.tariff === Tariff.STANDARD && this.tariffExpired;
    }

    private get isExpiredPro(): boolean {
        return this.clientInfo.user.tariff === Tariff.PRO && this.tariffExpired;
    }

    private get sharesCount(): number {
        if (this.oldStandardTariffsLimitsApplicable) {
            return this.clientInfo.user.sharesCount;
        }
        return this.clientInfo.user.portfolios.map(portfolio => portfolio.sharesCount).reduce((previousValue, currentValue) => previousValue + currentValue, 0);
    }

    get maxPortfoliosCount(): string {
        return this.clientInfo.user.tariff.maxPortfoliosCount === 0x7fffffff ? "Без ограничений" : String(this.clientInfo.user.tariff.maxPortfoliosCount);
    }

    get maxSharesCount(): string {
        if (this.oldStandardTariffsLimitsApplicable) {
            return "Без ограничений";
        }
        return this.clientInfo.user.tariff.maxSharesCount === 0x7fffffff ? "Без ограничений" : String(this.clientInfo.user.tariff.maxSharesCount);
    }

    /**
     * Возвращает true если текущие показатели пользователя превышают лимиты тарифа по портфелям/бумагам/содержанию
     */
    private get limitsExceeded(): boolean {
        const skipCheckSharesLimit = this.clientInfo.user.tariff === Tariff.STANDARD && this.clientInfo.user.skipTariffValidationDate &&
            DateUtils.parseDate(this.clientInfo.user.skipTariffValidationDate).isAfter(DateUtils.parseDate(DateUtils.currentDate()));
        return this.exceedLimitByPortfolios || (!skipCheckSharesLimit && this.exceedLimitByShareCount);
    }

    private get tariffExpired(): boolean {
        return TariffUtils.isTariffExpired(this.clientInfo.user);
    }

    private get exceedLimitByPortfolios(): boolean {
        return this.clientInfo.user.portfoliosCount > this.clientInfo.user.tariff.maxPortfoliosCount;
    }

    private get exceedLimitByShareCount(): boolean {
        if (this.oldStandardTariffsLimitsApplicable) {
            return false;
        }
        return this.clientInfo.user.portfolios.some(portfolio => portfolio.sharesCount > this.clientInfo.user.tariff.maxSharesCount);
    }

    /**
     * Возвращает признак применения лимитов по новым тарифам
     */
    private get oldStandardTariffsLimitsApplicable(): boolean {
        return this.clientInfo.user.tariff === Tariff.STANDARD &&
            DateUtils.parseDate(this.clientInfo.user.skipTariffValidationDate).isAfter(DateUtils.parseDate(DateUtils.currentDate()));
    }
}
