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
import {DataFilter, FilterPeriod, FilterPeriodType} from "../../cp/cp.types";
import {TradesFilterComponent} from "../components/tradesFilter";
import {Service} from "../platform/decorators/service";
import {Storage} from "../platform/services/storage";
import {Operation} from "../types/operation";
import {TradeListType} from "../types/tradeListType";
import {TradesFilter, TradesFilterRequest} from "./tradeService";

/**
 * Сервис по работе с фильтром данных. Позволяет сохранять настройки фильтра в сессионном хранилище
 */
@Service("FilterService")
@Singleton
export class FilterService {

    static readonly TRADES_FILTER_SETTINGS_KEY = "trades_filter_settings";
    @Inject
    private storageService: Storage;

    /**
     * Возвращает данные фильтра из хранилища
     * @return данные фильтра
     */
    getFilter(stateKey: string): TradesFilter {
        const filterString = this.storageService.get(stateKey, null);
        if (filterString) {
            const filter: TradesFilter = this.getTradeFilterFromPlainObject(JSON.parse(filterString) as TradesFilterRequest);
            return {
                ...this.getDefaultFilter(),
                ...filter
            };
        }
        return this.getDefaultFilter();
    }

    getTradesFilterRequest(filter: TradesFilter): TradesFilterRequest {
        return {
            operation: filter.operation.map(operation => operation.enumName),
            listType: filter.listType.enumName,
            showLinkedMoneyTrades: filter.showLinkedMoneyTrades,
            showMoneyTrades: filter.showMoneyTrades,
            search: filter.search || ""
        } as TradesFilterRequest;
    }

    /**
     * Сохраняет данные фильтра в хранилище
     * @param stateKey ключ для сохранения фильтра в хранилище
     * @param filter данные фильтра
     */
    saveFilter(stateKey: string, filter: TradesFilter): void {
        this.storageService.set(stateKey, JSON.stringify(this.getTradesFilterRequest(filter)));
    }

    /**
     * Возвращает состояние фильтра по умолчанию
     */
    getDefaultFilter(): TradesFilter {
        return {
            operation: TradesFilterComponent.DEFAULT_OPERATIONS,
            listType: TradeListType.FULL,
            showMoneyTrades: true,
            showLinkedMoneyTrades: true,
            search: ""
        };
    }

    private getTradeFilterFromPlainObject(filter: TradesFilterRequest): TradesFilter {
        return {
            operation: filter.operation.map(operation => Operation.valueByName(operation)),
            listType: TradeListType.valueByName(filter.listType),
            showLinkedMoneyTrades: filter.showLinkedMoneyTrades,
            showMoneyTrades: filter.showMoneyTrades,
            search: filter.search
        } as TradesFilter;
    }
}
