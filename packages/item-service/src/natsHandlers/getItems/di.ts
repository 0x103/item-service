module.exports = {
    services: {
        GetItemAirlock: {
            class: "./GetItems",
            main: "GetItemsAirlockHandler",
            tags: [{ name: "nats.handler" }],
            arguments: ["%config.SERVICE_NAME%", "@logger", "@natsConnection"]
        },
        GetItem: {
            class: "./GetItems",
            main: "GetItemsHandler",
            tags: [{ name: "nats.handler" }],
            arguments: ["%config.SERVICE_NAME%", "@itemRepository"]
        }
    }
};
