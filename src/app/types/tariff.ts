import {Decimal} from "decimal.js";
import {Enum, EnumType, IStaticEnum} from "../platform/enum";
import {Permission} from "./permission";

export const MAX = 0x7fffffff;

@Enum("name")
export class Tariff extends (EnumType as IStaticEnum<Tariff>) {

    static readonly STANDARD = new Tariff("STANDARD", "Стандарт", MAX, 2, "199", "99", "2388", "2388",
        Permission.COMBINED_PORTFOLIO | Permission.INVESTMENTS, "Базовый функционал");

    static readonly PRO = new Tariff("PRO", "Профессионал", MAX, MAX, "399", "199", "4788", "4788",
        Permission.FOREIGN_SHARES | Permission.COMBINED_PORTFOLIO | Permission.INVESTMENTS | Permission.PROFF_MODE, "Расширенный функционал");

    static readonly FREE = new Tariff("FREE", "Бесплатный", 7, 1, "0", "0", "0", "0", 0,
        "Ограниченный функционал");

    static readonly TRIAL = new Tariff("TRIAL", "Профессионал (демо)", MAX, MAX, "399", "199", "4788", "4788",
        Permission.FOREIGN_SHARES | Permission.COMBINED_PORTFOLIO | Permission.INVESTMENTS | Permission.PROFF_MODE, "");

    /** Служебное название тарифа */
    name: string;
    /** Описание */
    description: string;
    /** Разрешения */
    permissions: number;
    /** Максимальное количество бумаг */
    maxSharesCount: number;
    /** Максимальное количество портфелей. NULL значит нет ограничений */
    maxPortfoliosCount: number;
    /** Цена за один месяц пользования сервисом */
    monthlyPrice: Decimal;
    /** Цена за один месяц пользования сервисом при расчете за год */
    monthlyYearPrice: Decimal;
    /** Цена за один год пользования сервисом */
    yearPrice: Decimal;
    /** Цена за один год пользования сервисом без учета скидки */
    yearFullPrice: Decimal;
    /** Функционал */
    functional: string;

    private constructor(name: string, description: string, maxSharesCount: number, maxPortfoliosCount: number, monthlyPrice: string, monthlyYearPrice: string,
                        yearPrice: string, yearFullPrice: string, permissions: number, functional: string) {
        super();
        this.name = name;
        this.description = description;
        this.maxSharesCount = maxSharesCount;
        this.maxPortfoliosCount = maxPortfoliosCount;
        this.monthlyPrice = new Decimal(monthlyPrice);
        this.monthlyYearPrice = new Decimal(monthlyYearPrice);
        this.yearPrice = new Decimal(yearPrice);
        this.yearFullPrice = new Decimal(yearFullPrice);
        this.permissions = permissions;
        this.functional = functional;
    }

    hasPermission(perm: Permission): boolean {
        return (this.permissions & perm) === perm;
    }
}
