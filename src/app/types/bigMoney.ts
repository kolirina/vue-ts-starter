import {Decimal} from "decimal.js";

export class BigMoney {

    private amountValue: Decimal;

    private currencyValue: string;

    constructor(private value: string) {
        if (value) {
            const ar = value.split(" ");
            this.amountValue = new Decimal(ar[1]);
            this.currencyValue = ar[0];
        }
    }

    static isEmptyOrZero(value: string): boolean {
        if (value) {
            const result = new BigMoney(value);
            return result.amount.isZero();
        }
        return true;
    }

    get amount(): Decimal {
        return this.amountValue;
    }

    get currency(): string {
        return this.currencyValue;
    }

    get currencySymbol(): string {
        return this.currencyValue === "RUB" ? "₽" :
            this.currencyValue === "EUR" ? "€" :
                this.currencyValue === "USD" ? "$" : "";
    }
}
