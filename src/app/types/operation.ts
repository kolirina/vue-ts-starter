import {Enum, EnumType, IStaticEnum} from "../platform/enum";

@Enum("description")
export class Operation extends (EnumType as IStaticEnum<Operation>) {
    static readonly BUY = new Operation("Купить", 1);
    static readonly SELL = new Operation("Продать", 0);
    static readonly COUPON = new Operation("Купон", 2);
    static readonly AMORTIZATION = new Operation("Амортизация", 3);
    static readonly REPAYMENT = new Operation("Погашение", 0);
    static readonly DIVIDEND = new Operation("Дивиденд", 1);
    static readonly DEPOSIT = new Operation("Внести", 1);
    static readonly WITHDRAW = new Operation("Вывести", 0);
    static readonly INCOME = new Operation("Доход", 5);
    static readonly LOSS = new Operation("Расход", 6);

    private constructor(public description: string, public code: number) {
        super();
    }
}

@Enum("description")
export class FilterOperation extends (EnumType as IStaticEnum<FilterOperation>) {
    static readonly BUY = new FilterOperation("Купить", 1);
    static readonly SELL = new FilterOperation("Продать", 0);
    static readonly COUPON = new FilterOperation("Купон", 2);
    static readonly AMORTIZATION = new FilterOperation("Амортизация", 3);
    static readonly DIVIDEND = new FilterOperation("Дивиденд", 1);
    static readonly INCOME = new FilterOperation("Доход", 5);
    static readonly LOSS = new FilterOperation("Расход", 6);

    private constructor(public description: string, public code: number) {
        super();
    }
}