import {Decimal} from "decimal.js";
import {Enum, EnumType, IStaticEnum} from "../platform/enum";
import {Permission} from "./permission";

export const MAX = 0x7fffffff;

@Enum("name")
export class Tariff extends (EnumType as IStaticEnum<Tariff>) {

    static readonly STANDARD = new Tariff("STANDARD", "Стандарт", MAX, 30, 2, "199", "99", "299", "149",
        Permission.COMBINED_PORTFOLIO | Permission.INVESTMENTS, "Основной функционал", 2);

    static readonly PRO = new Tariff("PRO", "Профессионал", MAX, MAX, MAX, "399", "199", "499", "249",
        Permission.FOREIGN_SHARES | Permission.COMBINED_PORTFOLIO | Permission.INVESTMENTS | Permission.PROFF_MODE, "Расширенный функционал", 3);

    static readonly FREE = new Tariff("FREE", "Бесплатный", 7, 7, 1, "0", "0", "0", "0", 0,
        "Базовый функционал", 1);

    static readonly TRIAL = new Tariff("TRIAL", "Профессионал (демо)", MAX, MAX, MAX, "399", "199", "499", "249",
        Permission.FOREIGN_SHARES | Permission.COMBINED_PORTFOLIO | Permission.INVESTMENTS | Permission.PROFF_MODE, "", 0);

    /** Служебное название тарифа */
    name: string;
    /** Описание */
    description: string;
    /** Разрешения */
    permissions: number;
    /** Максимальное количество бумаг */
    maxSharesCount: number;
    /** Максимальное количество бумаг */
    maxSharesCountNew: number;
    /** Максимальное количество портфелей. NULL значит нет ограничений */
    maxPortfoliosCount: number;
    /** Цена за один месяц пользования сервисом */
    monthlyPrice: Decimal;
    /** Цена за один месяц пользования сервисом при расчете за год */
    monthlyYearPrice: Decimal;
    /** Цена за один месяц пользования сервисом */
    monthlyPriceNew: Decimal;
    /** Цена за один месяц пользования сервисом при расчете за год */
    monthlyYearPriceNew: Decimal;
    /** Функционал */
    functional: string;
    /** Функционал */
    weight: number;

    private constructor(name: string, description: string, maxSharesCount: number, maxSharesCountNew: number, maxPortfoliosCount: number,
                        monthlyPrice: string, monthlyYearPrice: string, monthlyPriceNew: string, monthlyYearPriceNew: string, permissions: number,
                        functional: string, weight: number) {
        super();
        this.name = name;
        this.description = description;
        this.maxSharesCount = maxSharesCount;
        this.maxSharesCountNew = maxSharesCountNew;
        this.maxPortfoliosCount = maxPortfoliosCount;
        this.monthlyPrice = new Decimal(monthlyPrice);
        this.monthlyPriceNew = new Decimal(monthlyPriceNew);
        this.monthlyYearPrice = new Decimal(monthlyYearPrice);
        this.monthlyYearPriceNew = new Decimal(monthlyYearPriceNew);
        this.permissions = permissions;
        this.functional = functional;
        this.weight = weight;
    }

    hasPermission(perm: Permission): boolean {
        return (this.permissions & perm) === perm;
    }

    compare(tariff: Tariff): number {
        return this.weight - tariff.weight;
    }
}
