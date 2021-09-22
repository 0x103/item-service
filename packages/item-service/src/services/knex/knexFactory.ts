// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Knex, knex } from "knex";



import { attachPaginate } from "knex-paginate";


export function makeKnexClient(
    PGSQL_HOST: string,
    PGSQL_USER: string,
    PGSQL_PASSWORD: string,
    PGSQL_DATABASE: string
): Knex {
    attachPaginate();

    return knex({
        client: "pg",
        connection: {
            host: PGSQL_HOST,
            user: PGSQL_USER,
            password: PGSQL_PASSWORD,
            database: PGSQL_DATABASE
        }
    });
}
