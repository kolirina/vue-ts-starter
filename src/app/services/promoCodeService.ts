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
     * Создает запрос на вывод партнерского вознаграждения
     * @returns идентификатор созданного запроса
     */
    async createPartnershipWithdrawalRequest(withdrawalRequest: PartnershipWithdrawalRequest): Promise<number> {
        return this.http.post<number>(`/promo-code/withdrawal-request`, withdrawalRequest);
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
export interface PartnershipWithdrawalRequest {
    /** Всего оплачено пользователями от партнера */
    amount: string;
    /** Всего оплачено пользователями от партнера */
    contact: string;
    /** Всего оплачено пользователями от партнера */
    fio: string;
    /** Всего оплачено пользователями от партнера */
    inn: string;
    /** Всего оплачено пользователями от партнера */
    account: string;
    /** Всего оплачено пользователями от партнера */
    bankBic: string;
}

/** Тип доступа к портфелю */
@Enum("code")
export class ReferralAwardType extends (EnumType as IStaticEnum<ReferralAwardType>) {

    static readonly PAYMENT = new ReferralAwardType("PAYMENT", "Партнерам");
    static readonly SUBSCRIPTION = new ReferralAwardType("SUBSCRIPTION", "Пользователям");

    private constructor(public code: string, public description: string) {
        super();
    }
}
