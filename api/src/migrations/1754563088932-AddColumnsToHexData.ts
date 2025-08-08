import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddColumnsToHexData1754563088932 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns('hex_data', [
            new TableColumn({
                name: 'device_identifier',
                type: 'varchar',
                isNullable: true,
            }),
            new TableColumn({
                name: 'data_type',
                type: 'varchar',
                isNullable: true,
            }),
            new TableColumn({
                name: 'function_type',
                type: 'varchar',
                isNullable: true,
            }),
            new TableColumn({
                name: 'number_of_bytes',
                type: 'int',
                isNullable: true,
            }),
            new TableColumn({
                name: '1byte_1st_sensor',
                type: 'int',
                isNullable: true,
            }),
            new TableColumn({
                name: '1byte_2nd_sensor',
                type: 'int',
                isNullable: true,
            }),
            new TableColumn({
                name: '1byte_3rd_sensor',
                type: 'int',
                isNullable: true,
            }),
            new TableColumn({
                name: '1byte_4th_sensor',
                type: 'int',
                isNullable: true,
            }),
            new TableColumn({
                name: '2byte_crc',
                type: 'int',
                isNullable: true,
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns('hex_data', [
            'device_identifier',
            'data_type',
            'function_type',
            'number_of_bytes',
            '1byte_1st_sensor',
            '1byte_2nd_sensor',
            '1byte_3rd_sensor',
            '1byte_4th_sensor',
            '2byte_crc',
        ]);
    }

}
