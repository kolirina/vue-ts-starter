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

/**
 * Компонент для отображения тэга
 */
import {namespace} from "vuex-class";
import {Component, Prop, UI} from "../../app/ui";
import {Tag} from "../../types/tags";
import {Portfolio} from "../../types/types";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <div class="tag-item" :style="getRgbaBg()">
            <span @click="selectTag" class="tag-item__name">{{ tag.name }}</span>
            <span v-if="allowActions" @click="$emit('deleteTag', tag)" class="intel-icon icon-remove" :style="'color:' + tag.color"></span>
        </div>
    `
})
export class TagItem extends UI {

    @Prop({type: Object, required: true})
    private tag: Tag;

    @MainStore.Getter
    private portfolio: Portfolio;

    private selectTag(): void {
        if (!this.allowActions) {
            return;
        }
        this.$emit("select", this.tag);
    }

    private get allowActions(): boolean {
        return !this.portfolio.portfolioParams.combinedFlag;
    }

    /** Возвращает цвет фона с прозрачностью */
    private getRgbaBg(): string {
        const r = parseInt(this.tag.color.slice(1, 3), 16);
        const g = parseInt(this.tag.color.slice(3, 5), 16);
        const b = parseInt(this.tag.color.slice(5, 7), 16);
        return `background-color: rgba(${r}, ${g}, ${b}, 0.2)`;
    }
}
