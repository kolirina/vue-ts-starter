/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2019
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2019
 */

import {Enum, EnumType, IStaticEnum} from "../platform/enum";
import {AssetType} from "./assetType";
import {CurrencyUnit} from "./currency";

/**
 * Тип актива, используемый в таблице "Активы" представления портфеля
 */
@Enum("description")
export class PortfolioAssetType extends (EnumType as IStaticEnum<PortfolioAssetType>) {

    static readonly STOCK = new PortfolioAssetType("Акции", AssetType.STOCK, null);
    static readonly BOND = new PortfolioAssetType("Облигации", AssetType.BOND, null);
    static readonly RUBLES = new PortfolioAssetType("Рубли", AssetType.MONEY, CurrencyUnit.RUB);
    static readonly DOLLARS = new PortfolioAssetType("Доллары", AssetType.MONEY, CurrencyUnit.USD);
    static readonly EURO = new PortfolioAssetType("Евро", AssetType.MONEY, CurrencyUnit.EUR);
    static readonly GBP = new PortfolioAssetType("Фунты", AssetType.MONEY, CurrencyUnit.GBP);
    static readonly ETF = new PortfolioAssetType("ETF/ПИФ", AssetType.STOCK, null);
    static readonly METALL = new PortfolioAssetType("Драгметаллы", AssetType.ASSET, null);
    static readonly REALTY = new PortfolioAssetType("Недвижимость", AssetType.ASSET, null);
    static readonly OTHER = new PortfolioAssetType("Прочие активы", AssetType.ASSET, null);

    private constructor(public description: string, public assetType: AssetType, public currency: CurrencyUnit) {
        super();
    }
}
