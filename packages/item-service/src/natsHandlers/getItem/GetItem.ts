import { JSONCodec, NatsConnection, SubscriptionOptions } from "nats";

import {
    AIRLOCK_VERBS,
    AirlockHandler,
    AirlockMessage,
    Logger,
    Message,
    PrivateHandler,
    isStudio
} from "common";

import { Item } from "../../entities/item";
import { ItemRepository } from "../../repositories/ItemRepository";

interface GetItemPayloadInterface {
    item_id: number;
    is_studio: string;
    studio_id: string;
}

export class GetItemAirlockHandler extends AirlockHandler {
    readonly subject = "item.*";
    readonly verb = AIRLOCK_VERBS.GET;

    getSubscriptionOptions(): SubscriptionOptions {
        return {
            queue: this.SERVICE_NAME
        };
    }

    constructor(
        private SERVICE_NAME: string,
        private logger: Logger,
        private natsConnection: NatsConnection
    ) {
        super();
    }

    async handle(msg: AirlockMessage): Promise<Item> {
        if (!isStudio(msg.headers)) {
            throw new Error("Invalid token type, a studio token is required.");
        }

        const item_id = Number(msg.subject.split(".")[2]);

        this.logger.info(`Getting item ${item_id}`);

        const response = await this.natsConnection.request(
            "item-service.get-item",
            JSONCodec().encode({
                item_id,
                is_studio: msg.headers?.is_studio,
                studio_id: msg.headers?.studio_id
            })
        );

        return JSONCodec<Item>().decode(response.data);
    }
}

export class GetItemHandler extends PrivateHandler {
    readonly subject = "get-item";

    getSubscriptionOptions(): SubscriptionOptions {
        return {
            queue: this.SERVICE_NAME
        };
    }

    constructor(
        private SERVICE_NAME: string,
        private itemRepository: ItemRepository
    ) {
        super();
    }

    async handle(msg: Message): Promise<Item> {
        const data = msg.data as GetItemPayloadInterface;
        const fetchedItem = await this.itemRepository.getItem(data.item_id);

        if (data?.is_studio !== "true") {
            throw new Error("INVALID_JWT_STUDIO");
        } else {
            if (fetchedItem.studio_id !== data?.studio_id) {
                throw new Error("INVALID_STUDIO_ID");
            }
        }

        return fetchedItem;
    }
}
