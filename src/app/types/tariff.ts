import {Decimal} from "decimal.js";
import {Enum, EnumType, IStaticEnum} from "../platform/enum";
import {Permission} from "./permission";

@Enum("name")
export class Tariff extends (EnumType as IStaticEnum<Tariff>) {

    static readonly FREE = new Tariff("FREE", "Бесплатный", 7, 1, new Decimal("0"), new Decimal("0"),
        new Decimal("0"), new Decimal("0"), new Decimal("0"), new Decimal("0"), 0);
    static readonly STANDARD = new Tariff("STANDARD", "Стандарт", 0x7fffffff, 2, new Decimal("99"), new Decimal("990"),
        new Decimal("1188"), new Decimal("199"), new Decimal("2388"), new Decimal("2388"), Permission.COMBINED_PORTFOLIO | Permission.INVESTMENTS);
    static readonly PRO = new Tariff("PRO", "Профессионал", 0x7fffffff, 0x7fffffff, new Decimal("199"),
        new Decimal("1990"), new Decimal("2388"), new Decimal("399"), new Decimal("4788"), new Decimal("4788"),
        Permission.FOREIGN_SHARES | Permission.COMBINED_PORTFOLIO | Permission.INVESTMENTS | Permission.PROFF_MODE);
    static readonly TRIAL = new Tariff("TRIAL", "Профессионал (демо)", 0x7fffffff, 0x7fffffff, new Decimal("199"),
        new Decimal("1990"), new Decimal("2388"), new Decimal("399"), new Decimal("4788"), new Decimal("4788"),
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

    private constructor(name: string, description: string, maxSharesCount: number, maxPortfoliosCount: number, monthlyPrice: Decimal,
                        yearPrice: Decimal, yearFullPrice: Decimal, monthlyPriceNew: Decimal,
                        yearPriceNew: Decimal, yearFullPriceNew: Decimal, permissions: number) {
        super();
        this.name = name;
        this.description = description;
        this.maxSharesCount = maxSharesCount;
        this.maxPortfoliosCount = maxPortfoliosCount;
        this.monthlyPrice = monthlyPrice;
        this.yearPrice = yearPrice;
        this.yearFullPrice = yearFullPrice;
        this.monthlyPriceNew = monthlyPriceNew;
        this.yearPriceNew = yearPriceNew;
        this.yearFullPriceNew = yearFullPriceNew;
        this.permissions = permissions;
    }

    hasPermission(perm: Permission): boolean {
        return (this.permissions & perm) === perm;
    }
}