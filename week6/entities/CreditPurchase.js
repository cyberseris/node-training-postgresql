const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
    name: 'CreditPurchase',
    tableName: 'CREDITPURCHASE',
    columns: {
        id: {
            primary:true,
            type: 'uuid',
            generated: 'uuid',
            nullable: false
        },
        user_id: {
            type: 'uuid',
            nullable: false
        },
        credit_package_id: {
            type: 'uuid',
            nullable: false
        },
        purchase_credits: {
            type: 'integer',
            nullable: false
        },
        price_paid: {
            type: 'numeric',
            precision: 10,
            scale: 1,
            nullable: false
        },
        created_at: {
            type: 'timestamp',
            nullable: false,
            createDate: true
        }
    },
    relations: {
        User: {
            target: 'User',
            type: 'one-to-one',
            inverseSide: 'CreditPurchase',
            joinColumn: {
                name: 'user_id', // CreditPurchase table
                referencedColumn: 'id', // User table
                foreignKeyConstraintName: 'creditpurchase_user_id_fk'
            }
        },
        CreditPackage: {
            target: 'CreditPackage',
            type: 'one-to-one',
            inverseSide: 'CreditPurchase',
            joinColumn: {
                name: 'credit_package_id', // CreditPurchase table
                referencedColumnName: 'id',  // CreditPackage Table
                foreignKeyConstraintName: 'creditpurchase_creditPackage_id_fk'
            }
        }
    }
})