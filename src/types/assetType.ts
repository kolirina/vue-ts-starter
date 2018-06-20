import {Enum, EnumType, IStaticEnum} from "../platform/enum";
import {Operation} from "./operation";

@Enum("description")
export class AssetType extends (<IStaticEnum<AssetType>> EnumType) {

    static readonly STOCK = new AssetType("Акции", [Operation.BUY, Operation.SELL, Operation.DIVIDEND]);
    static readonly BOND = new AssetType("Облигации", [Operation.BUY, Operation.SELL, Operation.REPAYMENT, Operation.COUPON, Operation.AMORTIZATION]);
    static readonly MONEY = new AssetType("Деньги", [Operation.DEPOSIT, Operation.WITHDRAW, Operation.INCOME, Operation.LOSS]);

    private constructor(public description: string, public operations: Operation[]) {
        super();
    }
}