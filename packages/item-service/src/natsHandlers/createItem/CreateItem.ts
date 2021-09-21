import { JSONCodec, NatsConnection, SubscriptionOptions } from "nats";
import {
    AirlockHandler,
    PrivateHandler,
    AIRLOCK_VERBS,
    AirlockMessage,
    Message,
    Logger,
    EventBus,
    isStudio
} from "common";

import { Item, itemSchema } from "../../entities/item";
import { ItemRepository } from "../../repositories/ItemRepository";
import { ItemCreatedEvent } from "../../events/item";

export class CreateItemAirlockHandler extends AirlockHandler {
    readonly subject = "item";
    readonly verb = AIRLOCK_VERBS.POST;

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

    async handle(msg: AirlockMessage): Promise<{ item_id: number }> {
        if (!isStudio(msg.headers)) {
            throw new Error("INVALID_JWT_STUDIO");
        }

        const itemProps = {
            ...msg.body as { [key: string]: unknown },
            "studio_id": msg.headers?.studio_id
        };
        const item = new Item(itemProps as Item);

        await itemSchema.validateAsync(item);

        this.logger.info(`adding item ${JSON.stringify(item)}`);

        const response = await this.natsConnection.request(
            `${this.SERVICE_NAME}.create-item`,
            JSONCodec().encode(item)
        );

        return JSONCodec<{ item_id: number }>().decode(response.data);
    }
}

export class CreateItemHandler extends PrivateHandler {
    readonly subject = "create-item";

    getSubscriptionOptions(): SubscriptionOptions {
        return {
            queue: this.SERVICE_NAME
        };
    }

    constructor(
        private SERVICE_NAME: string,
        private logger: Logger,
        private itemRepository: ItemRepository,
        private eventBus: EventBus
    ) {
        super();
    }

    async handle(msg: Message): Promise<{ item_id: number }> {
        const item_id = await this.itemRepository.addItem(
            new Item(msg.data as Item)
        );

        this.logger.info(`item added with id ${item_id}`);

        this.eventBus.publish(new ItemCreatedEvent(item_id));

        return {
            item_id
        };
    }
}
