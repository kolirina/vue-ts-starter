/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2020
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2020
 */

/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2020
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2020
 */

import {ShareType} from "./types";

export interface ShareTagsData {
    ticker: string;
    shareId: number;
    data: PortfolioTag[];
    shareType: ShareType;
}

export interface NewTagCategoryRequest {
    /** Название категории */
    name: string;
}

export interface NewTagRequest {
    /** Название категории */
    name: string;
    /** Идентификатор категории */
    categoryId: number;
}

/** Запрос на обновление категории */
export interface UpdateTagCategoryRequest {
    /** Название категории */
    name: string;
    /** Идентификатор категории */
    categoryId: number;
}

/** Запрос на обновление тэга */
export interface UpdateTagRequest {
    /** Название тэга */
    name: string;
    /** Идентификатор тэга */
    tagId: number;
}

export interface TagCategory {
    /** Идентификатор категории */
    id: number;
    /** Название категории */
    name: string;
    /** Список тэгов */
    tags: Tag[];
}

export interface Tag {
    /** Идентификатор тэга */
    id: number;
    /** Название тэга */
    name: string;
    /** Идентификатор родительской категории */
    categoryId: number;
}

export interface PortfolioTag {
    categoryId: number;
    tagId: number;
}
