import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Enum, EnumType, IStaticEnum} from "../platform/enum";
import {Http} from "../platform/services/http";

@Service("PromoCodeService")
@Singleton
export class PromoCodeService {

    @Inject
    private http: Http;

    /**
     * Отправляет запрос на смену типа вознаграждения промокода
     * @param {string} type
     * @returns {Promise<void>}
     */
    async changeReferralAwardType(type: string): Promise<void> {
        await this.http.post(`/promo-code`, type);
    }

    /**
     * Возвращает данные по реферальной программе
     * @returns данные по реферальной программе
     */
    async getPromoCodeStatistics(): Promise<PromoCodeStatistics> {
        return this.http.get<PromoCodeStatistics>(`/promo-code/statistics`);
    }

    /**
     * Возвращает настройки вывода
     * @returns настройки
     */
    async getPayoutSettings(): Promise<PartnerPayoutSettings> {
        return this.http.get<PartnerPayoutSettings>(`/promo-code/payout-settings`);
    }

    /**
     * Сохраняет настройки вывода
     * @returns идентификатор созданных настроек
     */
    async savePayoutSettings(settingsRequest: PartnerPayoutSettings): Promise<number> {
        if (settingsRequest.id) {
            return this.http.put<number>(`/promo-code/payout-settings`, settingsRequest);
        }
        return this.http.post<number>(`/promo-code/payout-settings`, settingsRequest);
    }
}

/** Статистика по промокоду пользователя */
export interface PromoCodeStatistics {
    /** Всего оплачено пользователями от партнера */
    referralPaymentTotalAmount: string;
    /** Всего выплачено партнеру на текущий момент */
    referrerPaymentsTotalPaid: string;
    /** Всего заработано реферрером (партнером) */
    referrerPaymentsTotal: string;
    /** Невыплаченный остаток реферреру (партнеру) */
    referrerPaymentsTotalUnpaid: string;
    /** Всего пользователей */
    referralCount: number;
    /** всего пользователей, которые хоть раз оплачивали */
    hasPaymentsReferralCount: number;
}

/** Запрос на вывод партнерского вознаграждения */
export interface PartnerPayoutSettings {
    /** id */
    id: number;
    /** Контакт */
    contact: string;
    /** ФИО */
    fio: string;
    /** Тип настроек */
    type: string;
    /** ИНН */
    inn: string;
    /** КПП */
    kpp: string;
    /** Номер счета получателя */
    account: string;
    /** БИК банка */
    bankBic: string;
    /** Комментарий */
    comment: string;
}

/** Тип вознаграждения */
@Enum("code")
export class ReferralAwardType extends (EnumType as IStaticEnum<ReferralAwardType>) {

    static readonly PAYMENT = new ReferralAwardType("PAYMENT", "Партнерам");
    static readonly SUBSCRIPTION = new ReferralAwardType("SUBSCRIPTION", "Пользователям");

    private constructor(public code: string, public description: string) {
        super();
    }
}

/** Тип получения выплаты */
@Enum("code")
export class PayoutType extends (EnumType as IStaticEnum<PayoutType>) {

    static readonly WIRE = new PayoutType("WIRE", "По банковским реквизитам");
    static readonly OTHER = new PayoutType("OTHER", "Прочее");

    private constructor(public code: string, public description: string) {
        super();
    }
}
