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
import {StoreType} from "../vuex/storeType";
import {TagItem} from "./tags/tagItem";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-menu :close-on-content-click="false" v-model="showComponent" offset-y transition="slide-y-transition" max-width="600px" min-width="260px" z-index="300"
            class="tags-menu" content-class="tags-menu">
            <v-tooltip bottom slot="activator">
                <span class="intel-icon icon-tag fs16 relative" slot="activator">
                    <span v-if="selectedTags.length" class="tags-counter">{{ selectedTags.length }}</span>
                </span>
                <span>Настройте тэги для данного актива</span>
            </v-tooltip>
            <div class="tags-menu__content">
                <div v-if="selectedTags.length" class="tags-menu__selected">
                    <tag-item v-for="tag in selectedTags" :key="tag.id" :tag="tag" @deleteTag="onDeleteSelectedTag"></tag-item>
                </div>
                <div class="tags-menu__tabs">
                    <div style="width: 100%">
                        <v-tabs v-if="selectedCategory" show-arrows>
                            <v-tab v-for="tagCategory in tagCategories" :key="tagCategory.id" @change="onTabSelected(tagCategory)"
                                   :class="{'active': tagCategory.id === selectedCategory.id}" :ripple="false">
                                {{ tagCategory.name }}
                            </v-tab>
                        </v-tabs>
                    </div>
                    <span @click="goToTagSettings($event)" class="intel-icon icon-m-portfolio-management"></span>
                </div>

                <div v-if="selectedCategory" class="tags-list-item__body">
                    <tag-item v-for="tag in selectedCategory.tags" :key="tag.id" :tag="tag" @deleteTag="onDeleteTag" @select="onSelectTag"
                              :class="{'selected': tagSelected(tag)}"></tag-item>
                    <div @click="showCreateTagField" class="tags__add-btn"></div>
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
                <div class="margT4 alignR">
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
    private data: { [key: string]: PortfolioTag[] };

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
        const key = `${this.share.shareType}:${this.share.id}`;
        const shareTags = this.data[key];
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
                        this.selectedTags.push(tag);
                    }
                }
            });
        }
    }

    /**
     * Загружает категории пользователя
     */
    @ShowProgress
    private async loadTagCategories(): Promise<void> {
        this.tagCategories = await this.tagsService.getTagCategories();
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
    }

    /**
     * Навешивает тэг
     * @param tag тэг
     */
    private onSelectTag(tag: Tag): void {
        if (this.selectedTags.length >= 1 && ![Tariff.PRO, Tariff.TRIAL].includes(this.clientInfo.user.tariff)) {
            this.$snotify.warning("На вашем тарифном плане нельзя присвоить больше одного тэга на бумагу. Подключите тариф Профессионал, чтобы устанавливать" +
                "неограниченное количество тэгов.");
            return;
        }
        if (!this.selectedTags.some(t => t.categoryId === tag.categoryId)) {
            this.selectedTags.push(tag);
        }
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
        const newTag: Tag = {id: tagId, name: this.tagName, categoryId: this.selectedCategory.id};
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
        return Object.keys(this.data).every(shareKey => {
            const tags = this.data[shareKey];
            return tags.every(tag => tagIds.includes(tag.tagId));
        });
    }
}
