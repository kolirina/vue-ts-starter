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

export const COLORS: { [key: number]: string } = {
    0: "#84ABEF",
    1: "#91DA4A",
    2: "#FF3E70",
    3: "#B2BFD4",
    4: "#FF9A51",
    5: "#4C9F70",
    6: "#A566E4",
    7: "#B8B8F3",
    8: "#63CCCA",
    9: "#EC5766",
};

export const DEFAULT_TAG_CATEGORY_NAME = "Страны";

export const DEFAULT_TAGS: NewTagRequest[] = [
    {
        categoryId: null,
        name: "Россия"
    },
    {
        categoryId: null,
        name: "Германия"
    },
    {
        categoryId: null,
        name: "Великобритания"
    },
    {
        categoryId: null,
        name: "Италия"
    },
    {
        categoryId: null,
        name: "США"
    },
    {
        categoryId: null,
        name: "Китай"
    },
];

export interface ShareTagsData {
    ticker: string;
    shareId: number;
    data: PortfolioTag[];
    shareType: ShareType;
}

export interface NewTagCategoryRequest {
    /** Название категории */
    name: string;
    /** Цвет категории */
    color: string;
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
    /** Цвет категории */
    color: string;
    /** Список тэгов */
    tags: Tag[];
}

export interface Tag {
    /** Идентификатор тэга */
    id: number;
    /** Название тэга */
    name: string;
    /** Цвет категории */
    color: string;
    /** Идентификатор родительской категории */
    categoryId: number;
}

export interface PortfolioTag {
    categoryId: number;
    tagId: number;
}
