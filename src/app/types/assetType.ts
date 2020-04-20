import {Enum, EnumType, IStaticEnum} from "../platform/enum";
import {Operation} from "./operation";

@Enum("description")
export class AssetType extends (EnumType as IStaticEnum<AssetType>) {

    static readonly STOCK = new AssetType("Акция", [Operation.BUY, Operation.SELL, Operation.DIVIDEND]);
    static readonly BOND = new AssetType("Облигация", [Operation.BUY, Operation.SELL, Operation.REPAYMENT, Operation.COUPON, Operation.AMORTIZATION]);
    static readonly MONEY = new AssetType("Деньги", [Operation.DEPOSIT, Operation.WITHDRAW, Operation.INCOME, Operation.LOSS, Operation.CURRENCY_BUY, Operation.CURRENCY_SELL]);
    static readonly ASSET = new AssetType("Прочий актив", [Operation.BUY, Operation.SELL, Operation.DIVIDEND]);

    private constructor(public description: string, public operations: Operation[]) {
        super();
    }
}
