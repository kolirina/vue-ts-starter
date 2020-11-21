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

/**
 * Компонент для настройки тэгов по бумаге
 */
import {Inject} from "typescript-ioc";
import {namespace} from "vuex-class";
import {Component, Prop, UI, Watch} from "../app/ui";
import {ShowProgress} from "../platform/decorators/showProgress";
import {ClientInfo} from "../services/clientService";
import {PortfolioService} from "../services/portfolioService";
import {TagsService} from "../services/tagsService";
import {PortfolioTag, ShareTagsData, Tag, TagCategory} from "../types/tags";
import {Tariff} from "../types/tariff";
import {Portfolio, Share} from "../types/types";
import {CommonUtils} from "../utils/commonUtils";
import {TariffUtils} from "../utils/tariffUtils";
import {StoreType} from "../vuex/storeType";
import {TagItem} from "./tags/tagItem";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-menu :close-on-content-click="false" v-model="showComponent" offset-y transition="slide-y-transition" max-width="600px" min-width="260px" z-index="300"
                class="tags-menu" content-class="tags-menu">
            <v-tooltip bottom slot="activator">
                <div class="relative" slot="activator" @click="showTagsPanel">
                    <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.4813 18.943L6.33644 13.7981C6.00561 13.4673 5.80123 13.0309 5.75887 12.565L5.33461 7.89807C5.22153 6.6542 6.26359 5.61213 7.50746 5.72521L12.1744
                     6.14947C12.6403 6.19183 13.0767 6.39621 13.4075 6.72705L18.5523 11.8719C19.3334 12.6529 19.3334 13.9193 18.5523 14.7003L14.3097 18.943C13.5287 19.724 12.2623
                      19.724 11.4813 18.943Z" :stroke="selectedTags.length ? selectedTags[0].color : '#84ABEF'" stroke-width="2"/>
                        <circle cx="10.0671" cy="10.4575" r="1" transform="rotate(-45 10.0671 10.4575)" :stroke="selectedTags.length ? selectedTags[0].color : '#84ABEF'"
                                stroke-width="2"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M17.8453 5.50796C18.2358 5.11743 18.8689 5.11743 19.2595 5.50796L24.9163 11.1648C26.0879 12.3364 26.0879
                     14.2359 24.9163 15.4075L19.2595 21.0643C18.8689 21.4548 18.2358 21.4548 17.8453 21.0643C17.4547 20.6738 17.4547 20.0406 17.8453 19.6501L23.5021 13.9932C23.8926
                      13.6027 23.8926 12.9696 23.5021 12.579L17.8453 6.92217C17.4547 6.53165 17.4547 5.89848 17.8453 5.50796Z"
                              :fill="selectedTags.length > 1 ? selectedTags[1].color : '#84ABEF'"/>
                    </svg>
                    <span v-if="shareTagsCount" class="tags-counter">{{ shareTagsCount }}</span>
                </div>
                <span v-if="allowActions">Настройте тэги для данного актива</span>
                <span v-else>Назначенные тэги по активу</span>
            </v-tooltip>
            <div class="tags-menu__content">
                <div v-if="selectedTags.length" class="tags-menu__selected">
                    <tag-item v-for="tag in selectedTags" :key="tag.id" :tag="tag" @deleteTag="onDeleteSelectedTag" @select="switchCategory"></tag-item>
                </div>
                <div v-if="allowActions" class="tags-menu__tabs">
                    <v-tabs v-if="selectedCategory">
                        <v-tab v-for="tagCategory in tagCategories" :key="tagCategory.id" @change="onTabSelected(tagCategory)"
                               :class="{'active': tagCategory.id === selectedCategory.id}" :ripple="false">
                            {{ tagCategory.name }}
                        </v-tab>
                    </v-tabs>
                    <span @click="goToTagSettings($event)" title="Настройка категорий" class="intel-icon icon-m-portfolio-management"></span>
                </div>
                <div v-if="!allowActions && selectedTags.length === 0">
                    Нет назначенных тэгов
                </div>

                <div v-if="selectedCategory && allowActions" class="tags-list-item__body">
                    <tag-item v-for="tag in selectedCategory.tags" :key="tag.id" :tag="tag" @deleteTag="onDeleteTag" @select="onSelectTag"
                              :selected="tagSelected(tag)"></tag-item>
                    <div @click="showCreateTagField" class="tags__add-btn" title="Добавить тэг"></div>
                    <div v-show="createTag" class="field-with-btns w100pc">
                        <v-text-field label="Введите новый тэг" v-model="tagName" :counter="50" ref="tagNameInput"
                                      v-validate="'required|max:50'" :error-messages="errors.collect('tagName')" name="tagName"
                                      @keydown.enter="addTag" @keydown.esc="closeAddTag" class="small-size"></v-text-field>
                        <div class="field-with-btns__actions">
                            <div @click="addTag" :disabled="!isTagValid" class="intel-icon icon-check"></div>
                            <div @click="closeAddTag" class="intel-icon icon-cancel"></div>
                        </div>
                    </div>
                </div>
                <div v-if="allowActions" class="margT16 alignR">
                    <v-btn color="primary" @click.native="saveTagsSettings">Сохранить</v-btn>
                </div>
            </div>
        </v-menu>
    `,
    components: {TagItem}
})
export class ShareTags extends UI {

    $refs: {
        tagNameInput: any;
    };

    @Prop({type: Object, required: true})
    private share: Share;

    @Prop({type: Object, required: true})
    private portfolioTags: { [key: string]: PortfolioTag[] };

    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Getter
    private clientInfo: ClientInfo;
    @Inject
    private tagsService: TagsService;

    @Inject
    private portfolioService: PortfolioService;

    /** Текущие категории */
    private tagCategories: TagCategory[] = [];
    /** Выбранная категория */
    private selectedCategory: TagCategory = null;
    /** Выбранные тэги */
    private selectedTags: Tag[] = [];
    /** Признак отображения компонента */
    private showComponent = false;
    /** Признак создания тэга */
    private createTag = false;
    /** Название тэга */
    private tagName = "";

    /**
     * Инициализирует данные компонента
     * @inheritDoc
     */
    async created(): Promise<void> {
        await this.loadTagCategories();
        this.selectedCategory = this.tagCategories.length ? this.tagCategories[0] : null;
        this.initSelectedTags();
    }

    @Watch("portfolio")
    private onPortfolioChange(): void {
        this.initSelectedTags();
    }

    /**
     * Восстанавливает выбранные тэги из данных портфеля
     */
    private initSelectedTags(): void {
        this.selectedTags = [];
        this.selectedTags = this.getShareTags();
    }

    /**
     * Загружает категории пользователя
     */
    @ShowProgress
    private async loadTagCategories(): Promise<void> {
        this.tagCategories = await this.tagsService.getTagCategories();
    }

    /**
     * Инициализирует выбранные тэги при открытии панели
     */
    private showTagsPanel(): void {
        this.initSelectedTags();
        setTimeout(() => {
            window.dispatchEvent(new Event("resize"));
        }, 100);
    }

    @Watch("showComponent")
    private onShowComponentChange(): void {
        if (!this.showComponent) {
            this.initSelectedTags();
        }
    }

    /**
     * Выставляет выбранную категорию
     * @param selected выбранная категория
     */
    private onTabSelected(selected: TagCategory): void {
        this.selectedCategory = selected;
    }

    /**
     * Удаляет тэг из пользовательских
     * @param tag тэг
     */
    @ShowProgress
    private async onDeleteTag(tag: Tag): Promise<void> {
        await this.tagsService.deleteTag(tag.id);
        const tagCategory = this.tagCategories.find(tagCategoryItem => tagCategoryItem.id === tag.categoryId);
        tagCategory.tags = tagCategory.tags.filter(tagItem => tagItem.id !== tag.id);
        this.selectedTags = this.selectedTags.filter(t => t.id !== tag.id);
    }

    /**
     * Навешивает тэг
     * @param tag тэг
     */
    private onSelectTag(tag: Tag): void {
        const creationAllowed = this.clientInfo.user.tariff === Tariff.PRO || (this.clientInfo.user.tariff === Tariff.TRIAL && !TariffUtils.isTariffExpired(this.clientInfo.user));
        if (this.selectedTags.length >= 1 && !creationAllowed && !this.selectedTags.some(t => t.categoryId === tag.categoryId)) {
            this.$snotify.warning("На вашем тарифном плане нельзя присвоить больше одного тэга на бумагу. Подключите тариф Профессионал, чтобы устанавливать" +
                "неограниченное количество тэгов.");
            return;
        }
        const index = this.selectedTags.findIndex(value => value.categoryId === tag.categoryId);
        if (index !== -1) {
            this.selectedTags.splice(index, 1, tag);
        } else {
            this.selectedTags.push(tag);
        }
    }

    /**
     * Переключает категорию при клике на уже выбранный тэг
     * @param tag тэг
     */
    private switchCategory(tag: Tag): void {
        this.selectedCategory = this.tagCategories.find(category => category.id === tag.categoryId);
    }

    /**
     * Снимает навешенный тэг с бумаги
     * @param tag тэг
     */
    private async onDeleteSelectedTag(tag: Tag): Promise<void> {
        this.selectedTags = this.selectedTags.filter(t => t.id !== tag.id);
    }

    /**
     * Сохраняет настройки тэгов для портфеля
     */
    @ShowProgress
    private async saveTagsSettings(): Promise<void> {
        const shareTags: ShareTagsData = {
            data: this.selectedTags.map(tag => {
                return {
                    categoryId: tag.categoryId,
                    tagId: tag.id
                } as PortfolioTag;
            }),
            shareId: this.share.id,
            shareType: this.share.shareType,
            ticker: this.share.ticker
        };
        await this.portfolioService.updateTags(this.portfolio.id, this.portfolio.portfolioParams.tags, shareTags);
        this.initSelectedTags();
        this.$snotify.info("Настройки тэгов успешно сохранены");
        this.showComponent = false;
    }

    /**
     * Отображает поле для ввода нового тэга
     */
    private showCreateTagField(): void {
        this.createTag = true;
        this.$nextTick(() => {
            try {
                this.$refs.tagNameInput?.$refs?.input?.focus();
                this.$validator.errors.clear();
            } catch (e) {
                // mute
            }
        });
    }

    /**
     * Добавляет новый тэг пользователя
     */
    private async addTag(): Promise<void> {
        if (!this.isTagValid()) {
            return;
        }
        const tagId = await this.tagsService.createTag({categoryId: this.selectedCategory.id, name: this.tagName});
        const tagCategory = this.tagCategories.find(tagCategoryItem => tagCategoryItem.id === this.selectedCategory.id);
        const newTag: Tag = {id: tagId, name: this.tagName, categoryId: this.selectedCategory.id, color: tagCategory.color};
        tagCategory.tags.push(newTag);
        this.onSelectTag(newTag);
        this.closeAddTag();
    }

    /**
     * Закрывает поле ввода нового тэга и очищает поле
     */
    private closeAddTag(): void {
        this.createTag = false;
        this.tagName = "";
    }

    /**
     * Проверяет название новго тэга
     */
    private isTagValid(): boolean {
        return !CommonUtils.isBlank(this.tagName);
    }

    /**
     * Возвращает признак того что тэг выбран
     * @param tag тэг
     */
    private tagSelected(tag: Tag): boolean {
        return this.selectedTags.some(selected => selected.id === tag.id);
    }

    /**
     * Осуществляет переход на страницу настроек тэгов
     */
    private async goToTagSettings(): Promise<void> {
        this.$router.push({name: "tags"});
        // todo разобраться почему закрывается диалог
        // if (this.hasNoChanges()) {
        //     this.$router.push("tags");
        // } else {
        //     const result = await new ConfirmDialog().show("Настройки тэгов по бумаге не сохранены.");
        //     if (result === BtnReturn.YES) {
        //         this.$router.push("tags");
        //     }
        // }
    }

    /**
     * Проверяет на изменений исходных тэгов
     */
    private hasNoChanges(): boolean {
        const tagIds = this.selectedTags.map(tag => tag.id);
        return Object.keys(this.portfolioTags).every(shareKey => {
            const tags = this.portfolioTags[shareKey];
            return tags.every(tag => tagIds.includes(tag.tagId));
        });
    }

    private getShareTags(): Tag[] {
        const tags: Tag[] = [];
        const key = `${this.share.shareType}:${this.share.id}`;
        const shareTags = this.portfolioTags[key];
        if (shareTags) {
            const tagsByCategoryIdAndByTagId: { [key: number]: { [key: number]: Tag } } = {};
            this.tagCategories.forEach(tagCategory => {
                const tagsById: { [key: number]: Tag } = {};
                tagCategory.tags.forEach(tag => tagsById[tag.id] = tag);
                tagsByCategoryIdAndByTagId[tagCategory.id] = tagsById;
            });
            shareTags.forEach(shareTag => {
                const tagsById = tagsByCategoryIdAndByTagId[shareTag.categoryId];
                if (tagsById) {
                    const tag = tagsById[shareTag.tagId];
                    if (tag) {
                        tags.push(tag);
                    }
                }
            });
        }
        return tags;
    }

    private get shareTagsCount(): number {
        return this.getShareTags().length;
    }

    private get allowActions(): boolean {
        return !this.portfolio.portfolioParams.combinedFlag;
    }
}
