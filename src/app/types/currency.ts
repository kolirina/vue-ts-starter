/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2020
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2020
 */

/**
 * Допустимые валюты в приложении
 */
import {Enum, EnumType, IStaticEnum} from "../platform/enum";

/** Информация о валюте */
export interface CurrencyItem {
    /** Идентификатор */
    id: string;
    /** Числовой код валюты */
    numCode: string;
    /** Буквенный код валюты */
    charCode: string;
    /** Номинал валюты */
    nominal: string;
    /** Название валюты */
    name: string;
    /** Курс валюты */
    value: string;
}

export enum Currency {
    RUB = "RUB",
    USD = "USD",
    EUR = "EUR",
    GBP = "GBP"
}

/** Перечислению доступных валют */
@Enum("code")
export class CurrencyUnit extends (EnumType as IStaticEnum<CurrencyUnit>) {

    static readonly RUB = new CurrencyUnit(Currency.RUB, "RUBLE", "Рубль", "₽");
    static readonly USD = new CurrencyUnit(Currency.USD, "DOLLAR", "Доллар", "$");
    static readonly EUR = new CurrencyUnit(Currency.EUR, "EURO", "Евро", "€");
    static readonly GBP = new CurrencyUnit(Currency.GBP, "GBP", "Фунт", "£");

    private constructor(public code: string, public serverCode: string, public description: string, public symbol: string) {
        super();
    }

    /**
     * Возвращает валюту по ее числовому коду
     * @param code числовой код валюты
     */
    static valueByCode(code: string): CurrencyUnit {
        return this.values().find(currency => currency.code === code);
    }
}

export const ALLOWED_CURRENCIES = CurrencyUnit.values().map(currency => currency.code);

export function isCurrencyAllowed(currencyCode: string): boolean {
    return ALLOWED_CURRENCIES.includes(currencyCode);
}