import {namespace} from "vuex-class/lib/bindings";
import {Component, UI} from "../app/ui";
import {ClientInfo} from "../services/clientService";
import {SystemPropertyName} from "../services/systemPropertiesService";
import {Permission} from "../types/permission";
import {Tariff} from "../types/tariff";
import {MapType, TariffHint} from "../types/types";
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
                            Создано портфелей: <b>{{ clientInfo.user.portfoliosCount }}</b> Доступно на тарифе: <b>{{ maxPortfoliosCount }}</b>, <br/>
                        </template>
                        <template v-if="exceedLimitByShareCount">
                            добавлено ценных бумаг: <b>{{ clientInfo.user.sharesCount }}</b> Доступно на тарифе: <b>{{ maxSharesCount }}</b> <br/>
                        </template>
                    </p>
                    <p v-if="exceedLimitByForeignShares">
                        В ваших портфелях имеются сделки с валютой или по иностранным ценным бумагам<br/>
                        Тариф не позволяет учитывать сделки по ценным бумагам номинированными в валюте.
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
    @MainStore.Getter
    private systemProperties: MapType;

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

    get maxPortfoliosCount(): string {
        return this.clientInfo.user.tariff.maxPortfoliosCount === 0x7fffffff ? "Без ограничений" : String(this.clientInfo.user.tariff.maxPortfoliosCount);
    }

    get maxSharesCount(): string {
        if (this.newTariffsApplicable) {
            return this.clientInfo.user.tariff.maxSharesCountNew === 0x7fffffff ? "Без ограничений" : String(this.clientInfo.user.tariff.maxSharesCountNew);
        }
        return this.clientInfo.user.tariff.maxSharesCount === 0x7fffffff ? "Без ограничений" : String(this.clientInfo.user.tariff.maxSharesCount);
    }

    get tariffForeignShares(): boolean {
        return this.clientInfo.user.tariff.hasPermission(Permission.FOREIGN_SHARES);
    }

    /**
     * Возвращает true если текущие показатели пользователя превышают лимиты тарифа по портфелям/бумагам/содержанию
     */
    private get limitsExceeded(): boolean {
        if (this.newTariffsApplicable) {
            return this.exceedLimitByPortfolios || this.exceedLimitByShareCount;
        }
        return this.clientInfo.user.tariff === Tariff.FREE && (this.exceedLimitByPortfolios || this.exceedLimitByShareCount || this.exceedLimitByForeignShares);
    }

    private get tariffExpired(): boolean {
        return TariffUtils.isTariffExpired(this.clientInfo.user);
    }

    private get exceedLimitByPortfolios(): boolean {
        return this.clientInfo.user.portfoliosCount > this.clientInfo.user.tariff.maxPortfoliosCount;
    }

    private get exceedLimitByShareCount(): boolean {
        if (this.newTariffsApplicable) {
            return this.clientInfo.user.portfolios.some(portfolio => portfolio.sharesCount > this.clientInfo.user.tariff.maxSharesCountNew);
        }
        return this.clientInfo.user.sharesCount > this.clientInfo.user.tariff.maxSharesCount;
    }

    private get exceedLimitByForeignShares(): boolean {
        return !this.newTariffsApplicable && this.clientInfo.user.foreignShares && !this.clientInfo.user.tariff.hasPermission(Permission.FOREIGN_SHARES);
    }

    private get newTariffsApplicable(): boolean {
        return DateUtils.parseDate(this.clientInfo.user.regDate).isAfter(DateUtils.parseDate(this.systemProperties[SystemPropertyName.NEW_TARIFFS_DATE_FROM]));
    }
}
