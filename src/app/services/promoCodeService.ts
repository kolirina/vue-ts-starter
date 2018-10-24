import {Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {HTTP} from "../platform/services/http";

@Service("PromoCodeService")
@Singleton
export class PromoCodeService {

    /**
     * Отправляет запрос на смену типа вознаграждения промо-кода
     * @param {string} type
     * @returns {Promise<void>}
     */
    async changeReferralAwardType(type: string): Promise<void> {
        await HTTP.INSTANCE.post(`/user/promo-code`, type);
    }

    /**
     * Отправляет запрос на смену типа вознаграждения промо-кода
     * @param {string} userId
     * @returns {Promise<void>}
     */
    async getPromoCodeStatistics(userId: string): Promise<PromoCodeStatistics> {
        return await (await HTTP.INSTANCE.get(`/promo-code/statistics/${userId}`)).data as PromoCodeStatistics;
    }
}

/** Статистика по промо-коду пользователя */
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