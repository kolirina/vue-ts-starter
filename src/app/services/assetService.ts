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

import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Enum, EnumType, IStaticEnum} from "../platform/enum";
import {Http} from "../platform/services/http";

@Service("AssetService")
@Singleton
export class AssetService {

    @Inject
    private http: Http;

    private readonly BASE = "/asset";

    /**
     * Возвращает данные по активам пользователя
     */
    async getUserAssets(): Promise<AssetModel[]> {
        const result = await this.http.get<AssetModelDto[]>(`${this.BASE}/user`);
        return result.map(asset => {
            return {
                ...asset,
                category: AssetCategory.valueByName(asset.category)
            } as AssetModel;
        });
    }

    /**
     * Возвращает данные по активам пользователя
     */
    async getCommonAssets(): Promise<AssetModel[]> {
        const result = await this.http.get<AssetModelDto[]>(`${this.BASE}/common`);
        return result.map(asset => {
            return {
                ...asset,
                category: AssetCategory.valueByName(asset.category)
            } as AssetModel;
        });
    }

    async saveAsset(asset: AssetModel): Promise<void> {
        return this.http.post(this.BASE, this.mapToRequest(asset));
    }

    async editAsset(asset: AssetModel): Promise<void> {
        return this.http.put(this.BASE, this.mapToRequest(asset));
    }

    async deleteAsset(assetId: number): Promise<void> {
        return this.http.delete(`${this.BASE}/${assetId}`);
    }

    private mapToRequest(asset: AssetModel): AssetModelDto {
        return {
            category: asset.category.code,
            ticker: asset.ticker,
            currency: asset.currency,
            name: asset.name,
            price: asset.price,
            source: asset.source,
            regex: asset.regex,
            tags: asset.tags,
            note: asset.note
        } as AssetModelDto;
    }
}

export interface AssetModelBase {
    /** Идентификатор актива */
    id?: number;
    /** Код актива (может быть ticker/isin или еще какой-то однозначно идентифицирцющий актив во внешней системе) */
    ticker: string;
    /** Валюта актива */
    currency: string;
    /** Название актива */
    name: string;
    /** Цена актива (текущая) */
    price: string;
    /** Url по которму можно парсить цену */
    source: string;
    /** Регулярное выражение для парсинга цены */
    regex: string;
    /** Список тэгов */
    tags: string;
    /** Заметка */
    note: string;
}

export interface AssetModel extends AssetModelBase {
    /** Тип актива */
    category: AssetCategory;
}

export interface AssetModelDto extends AssetModelBase {
    /** Тип актива */
    category: string;
}

@Enum("code")
export class AssetCategory extends (EnumType as IStaticEnum<AssetCategory>) {

    static readonly STOCK = new AssetCategory("STOCK", "Акции");
    static readonly BOND = new AssetCategory("BOND", "Облигации");
    static readonly MONEY = new AssetCategory("MONEY", "Деньги");
    static readonly ETF = new AssetCategory("ETF", "ETF/ПИФ");
    static readonly FUTURE = new AssetCategory("FUTURE", "Фьючерс");
    static readonly OPTION = new AssetCategory("OPTION", "Опцион");
    static readonly METALL = new AssetCategory("METALL", "Драгметаллы");
    static readonly REALTY = new AssetCategory("REALTY", "Недвижимость");
    static readonly CURRENCY = new AssetCategory("CURRENCY", "Деньги");
    static readonly CRYPTO_CURRENCY = new AssetCategory("CRYPTO_CURRENCY", "Криптовалюта");
    static readonly OTHER = new AssetCategory("OTHER", "Разное");

    private constructor(public code: string, public description: string) {
        super();
    }
}