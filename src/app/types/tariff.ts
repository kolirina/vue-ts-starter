import {Decimal} from "decimal.js";
import {Enum, EnumType, IStaticEnum} from "../platform/enum";
import {Permission} from "./permission";

@Enum("name")
export class Tariff extends (EnumType as IStaticEnum<Tariff>) {

    static readonly STANDARD = new Tariff("STANDARD", "Стандарт", 0x7fffffff, 2, "99", "990", "1188", "199", "2388", "2388",
        Permission.COMBINED_PORTFOLIO | Permission.INVESTMENTS);

    static readonly PRO = new Tariff("PRO", "Профессионал", 0x7fffffff, 5, "199", "1990", "2388", "399", "4788", "4788",
        Permission.FOREIGN_SHARES | Permission.COMBINED_PORTFOLIO | Permission.INVESTMENTS | Permission.PROFF_MODE);

    static readonly PREMIUM = new Tariff("PREMIUM", "Премиум", 0x7fffffff, 20, "799", "7999", "9588", "799", "9588", "9588",
        Permission.FOREIGN_SHARES | Permission.COMBINED_PORTFOLIO | Permission.INVESTMENTS | Permission.PROFF_MODE);

    static readonly UNLIMITED = new Tariff("UNLIMITED", "Безлимитный", 0x7fffffff, 20, "799", "7999", "9588", "799", "9588", "9588",
        Permission.FOREIGN_SHARES | Permission.COMBINED_PORTFOLIO | Permission.INVESTMENTS | Permission.PROFF_MODE);

    static readonly FREE = new Tariff("FREE", "Бесплатный", 7, 1, "0", "0", "0", "0", "0", "0", 0);

    static readonly TRIAL = new Tariff("TRIAL", "Профессионал (демо)", 0x7fffffff, 0x7fffffff, "199",
        "1990", "2388", "399", "4788", "4788",
        Permission.FOREIGN_SHARES | Permission.COMBINED_PORTFOLIO | Permission.INVESTMENTS | Permission.PROFF_MODE);

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
    /** Цена за один год пользования сервисом */
    yearPrice: Decimal;
    /** Цена за один год пользования сервисом без учета скидки */
    yearFullPrice: Decimal;
    /** Цена за один месяц пользования сервисом */
    monthlyPriceNew: Decimal;
    /** Цена за один год пользования сервисом */
    yearPriceNew: Decimal;
    /** Цена за один год пользования сервисом без учета скидки */
    yearFullPriceNew: Decimal;

    private constructor(name: string, description: string, maxSharesCount: number, maxPortfoliosCount: number, monthlyPrice: string,
                        yearPrice: string, yearFullPrice: string, monthlyPriceNew: string,
                        yearPriceNew: string, yearFullPriceNew: string, permissions: number) {
        super();
        this.name = name;
        this.description = description;
        this.maxSharesCount = maxSharesCount;
        this.maxPortfoliosCount = maxPortfoliosCount;
        this.monthlyPrice = new Decimal(monthlyPrice);
        this.yearPrice = new Decimal(yearPrice);
        this.yearFullPrice = new Decimal(yearFullPrice);
        this.monthlyPriceNew = new Decimal(monthlyPriceNew);
        this.yearPriceNew = new Decimal(yearPriceNew);
        this.yearFullPriceNew = new Decimal(yearFullPriceNew);
        this.permissions = permissions;
    }

    hasPermission(perm: Permission): boolean {
        return (this.permissions & perm) === perm;
    }
}