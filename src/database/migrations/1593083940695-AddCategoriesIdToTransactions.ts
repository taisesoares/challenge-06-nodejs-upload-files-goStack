import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export default class AddCategoriesIdToTransactions1593083940695 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.addColumn('transactions', new TableColumn(
        {
          name: 'category_id',
          type: 'uuid',
          isNullable: true
        }
      ))

      await queryRunner.createForeignKey(
        'transactions',
        new TableForeignKey({
          name: 'TransactionsCategories',
          columnNames: ['category_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'categories',
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        })
      )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropForeignKey('transactions', 'TransactionsCategories')
      await queryRunner.dropColumn('transations', 'category_id')
    }

}
