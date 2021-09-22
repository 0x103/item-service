import { Item } from "../entities/item";

export interface ItemRepository {
    addItem(item: Item): Promise<number>;
    getItem(item_id: number): Promise<Item>;
    getItems(page: number): [Promise<Item>];
}
