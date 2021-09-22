import { Knex } from "knex";

import { Item } from "../entities/item";

import { ItemRepository } from "./ItemRepository";

export class KnexItemRepository implements ItemRepository {
    private readonly itemTable = "items";

    constructor(private knex: Knex) {}

    async addItem(item: Item): Promise<number> {
        const result = await this.knex(this.itemTable).insert(item, [
            "item_id"
        ]);

        return result[0].item_id;
    }

    async getItem(item_id: number): Promise<Item> {
        const result = await this.knex(this.itemTable)
            .select()
            .where("item_id", item_id);

        return new Item(result[0]);
    }

    async getItems(page: number): Promise<[Promise<Item>]> {


    }
}
