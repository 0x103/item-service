import { JSONCodec } from "nats";
import { CreateItemAirlockHandler } from "../src/natsHandlers/createItem/CreateItem";
import logger from "./utils/mockLogger";

describe("Given CreateItem Airlock Handler", () => {
    let createItemAirlockHandler;
    let natsConnection;
    const DEFAULT_STUDIO_HEADERS = {
        studio_id: "studio_id",
        is_studio: true
    };

    beforeEach(() => {
        natsConnection = {
            request: jest.fn()
        };

        createItemAirlockHandler = new CreateItemAirlockHandler(
            "test-service",
            logger,
            natsConnection
        );
    });

    describe("When called with an invalid token type", () => {
        it("Then throws an error indicating a bad token", () => {
            expect(
                createItemAirlockHandler.handle({
                    body: {
                        name: "test",
                        total_quantity: 10,
                        available_quantity: 10,
                        data: {},
                        frozen: false
                    },
                    headers: {
                        studio_id: "studio_id",
                        is_studio: false
                    }
                })
            ).rejects.toThrow(
                "Invalid token type, a studio token is required."
            );
        });
    });

    describe("When called with an invalid message body", () => {
        it("Then throws an error when name is missing", () => {
            expect(
                createItemAirlockHandler.handle({
                    body: {
                        total_quantity: 10,
                        available_quantity: 10,
                        data: {},
                        frozen: false
                    },
                    headers: DEFAULT_STUDIO_HEADERS
                })
            ).rejects.toThrow('"name" is required');
        });

        it("Then throws an error when name is too long", () => {
            expect(
                createItemAirlockHandler.handle({
                    body: {
                        name: new Array(101).fill("a").join(""),
                        total_quantity: 10,
                        data: {},
                        frozen: false
                    },
                    headers: DEFAULT_STUDIO_HEADERS
                })
            ).rejects.toThrow(
                '"name" length must be less than or equal to 100 characters long'
            );
        });

        it("Then throws an error when available_quantity is missing", () => {
            expect(
                createItemAirlockHandler.handle({
                    body: {
                        name: "hello",
                        total_quantity: 10,
                        data: {},
                        frozen: false
                    },
                    headers: DEFAULT_STUDIO_HEADERS
                })
            ).rejects.toThrow('"available_quantity" is required');
        });

        it("Then throws an error when available_quantity is negative", () => {
            expect(
                createItemAirlockHandler.handle({
                    body: {
                        name: "hello",
                        total_quantity: 10,
                        available_quantity: -1,
                        data: {},
                        frozen: false
                    },
                    headers: DEFAULT_STUDIO_HEADERS
                })
            ).rejects.toThrow(
                '"available_quantity" must be greater than or equal to 0'
            );
        });

        it("Then throws an error when data values are not strings", () => {
            expect(
                createItemAirlockHandler.handle({
                    body: {
                        name: "hello",
                        total_quantity: 10,
                        available_quantity: 10,
                        data: {
                            test: true
                        },
                        frozen: false
                    },
                    headers: DEFAULT_STUDIO_HEADERS
                })
            ).rejects.toThrow('"data.test" must be a string');
        });
    });

    describe("When called with a valid message body", () => {
        let response;

        beforeEach(async () => {
            natsConnection.request.mockReturnValue(
                Promise.resolve({
                    data: JSONCodec().encode({
                        item_id: 1
                    })
                })
            );

            response = await createItemAirlockHandler.handle({
                body: {
                    name: "hello",
                    total_quantity: 10,
                    available_quantity: 10,
                    data: {},
                    frozen: false
                },
                headers: DEFAULT_STUDIO_HEADERS
            });
        });

        it("Then calls the private handler", () => {
            expect(natsConnection.request.mock.calls[0][0]).toBe(
                "test-service.create-item"
            );
        });

        it("Then returns the item_id of the newly created item", () => {
            expect(response).toEqual({
                item_id: 1
            });
        });
    });
});
