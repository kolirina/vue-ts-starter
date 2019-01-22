import {Enum, EnumType, IStaticEnum} from "../platform/enum";

@Enum("description")
export class ListType extends (EnumType as IStaticEnum<ListType>) {
    static readonly FULL = new ListType("Полный");
    static readonly STOCK = new ListType("Акции");
    static readonly BOND = new ListType("Облигации");
    static readonly MONEY = new ListType("Доходы и Расходы");

    private constructor(public description: string) {
        super();
    }
}