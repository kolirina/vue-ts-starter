import {Enum, EnumType, IStaticEnum} from "../platform/enum";

@Enum("description")
export class TradeListType extends (EnumType as IStaticEnum<TradeListType>) {
    static readonly FULL = new TradeListType("Все");
    static readonly STOCK = new TradeListType("Акции");
    static readonly BOND = new TradeListType("Облигации");
    static readonly MONEY = new TradeListType("Денежные средства");

    private constructor(public description: string) {
        super();
    }
}