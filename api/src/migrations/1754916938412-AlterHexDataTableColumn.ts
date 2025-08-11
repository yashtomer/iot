import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterHexDataTableColumn1754916938412 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE hex_data 
            MODIFY COLUMN \`number_of_bytes\` VARCHAR(255) NULL,
            MODIFY COLUMN \`1byte_1st_sensor\` VARCHAR(255) NULL,
            MODIFY COLUMN \`1byte_2nd_sensor\` VARCHAR(255) NULL,
            MODIFY COLUMN \`1byte_3rd_sensor\` VARCHAR(255) NULL,
            MODIFY COLUMN \`1byte_4th_sensor\` VARCHAR(255) NULL,
            MODIFY COLUMN \`2byte_crc\` VARCHAR(255) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE hex_data 
            MODIFY COLUMN \`number_of_bytes\` INT NULL,
            MODIFY COLUMN \`1byte_1st_sensor\` INT NULL,
            MODIFY COLUMN \`1byte_2nd_sensor\` INT NULL,
            MODIFY COLUMN \`1byte_3rd_sensor\` INT NULL,
            MODIFY COLUMN \`1byte_4th_sensor\` INT NULL,
            MODIFY COLUMN \`2byte_crc\` INT NULL
        `);
    }
}
