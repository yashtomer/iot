import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateHexDataTable1754563088931 implements MigrationInterface {
    name = 'CreateHexDataTable1754563088931'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`hex_data\` (\`id\` int NOT NULL AUTO_INCREMENT, \`data\` varchar(255) NOT NULL, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`hex_data\``);
    }

}
