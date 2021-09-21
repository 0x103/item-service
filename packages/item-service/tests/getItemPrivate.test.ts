import { GetItemHandler } from "../src/natsHandlers/getItem/GetItem";

describe("Given GetItem Handler", () => {
    let getItemHandler;
    let itemRepository;

    beforeEach(() => {
        itemRepository = {
            getItem: jest.fn().mockReturnValue({
                item_id: 1,
                studio_id: "studio_id",
                name: "laboris ut eu",
                available_quantity: 10,
                total_quantity: 10,
                is_frozen: false,
                data: {}
            })
        };

        getItemHandler = new GetItemHandler("test-service", itemRepository);
    });

    describe("When called with an item id by an invalid studio", () => {
        it("Then throws an error about the given token.", () => {
            expect(
                getItemHandler.handle({
                    data: {
                        item_id: 1,
                        studio_id: "studio_id_2",
                        is_studio: true
                    }
                })
            ).rejects.toThrow("INVALID_STUDIO_ID");
        });
    });

    describe("When called with an item id", () => {
        let response;

        beforeEach(async () => {
            response = await getItemHandler.handle({
                data: {
                    item_id: 1,
                    studio_id: "studio_id",
                    is_studio: true
                }
            });
        });

        it("Then returns the data of the requested item", () => {
            expect(response).toEqual({
                item_id: 1,
                studio_id: "studio_id",
                name: "laboris ut eu",
                available_quantity: 10,
                total_quantity: 10,
                is_frozen: false,
                data: {}
            });
        });
    });
});
