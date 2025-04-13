const { EntitySchema, JoinColumn } = require('typeorm')

module.exports = new EntitySchema({
    name: 'Course',
    tableName: 'COURSE',
    columns:{
        id:{
            primary: true,
            type: 'uuid',
            generated: 'uuid',
            nullable: false,
        },
        user_id: {
            type: 'uuid',
            nullable: false,
            foreignKey: {
                name: 'course_user_id_fk',
                columnNames: ['user_id'],  //table COURSE
                referenceTableName: 'USER',
                referenceColumnName: ['id'] //table USER
            }
        },
        skill_id: {
            type: 'uuid',
            nullable: false,
            foreignKey: {
                name: 'course_skill_id_fk',
                columnNames: ['skill_id'],  //table COURSE
                referenceTableName: 'SKILL',
                referenceColumnName: ['id'] //table SKILL
            }
        },
        name: {
            type: 'varchar',
            length: 100,
            nullable: false,
        },
        description: {
            type: 'text',
            nullable: false
        },
        start_at: {
            type: 'timestamp',
            nullable: false
        },
        end_at: {
            type: 'timestamp',
            nullable: false
        },
        max_participants: {
            type:'integer',
            nullable: false,
        },
        meeting_url: {
            type: 'varchar',
            length: 2048,
            nullable: false
        },
        created_at: {
            type: 'timestamp',
            createDate: true,
            nullable: false
        },
        updated_at: {
            type: 'timestamp',
            createDate: true,
            nullable: false
        },
    },
    relations: {
        CourseBooking: {
            target: 'CourseBooking',
            type: 'one-to-many',
            inverseSide: 'Course',
            joinColumn: {
                name: 'id',
                referencedColumn: 'course_id',
                foreignKeyConstraintName: 'course_coursebooking_course_id_fk'
            }
        }
    }
})