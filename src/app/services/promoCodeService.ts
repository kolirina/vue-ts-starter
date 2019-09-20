import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
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