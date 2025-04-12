const { EntitySchema, JoinColumn } = require('typeorm')

module.exports = new EntitySchema({
    name: 'CourseBooking',
    tableName:'COURSE_BOOKING',
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid',
            nullable: false
        },
        user_id: {
            type: 'uuid',
            nullable: false
        },
        course_id: {
            type: 'uuid',
            nullable: false
        },
        booking_at: {
            type: 'timestamp',
            createDate: true,
            nullable: false
        },
        status: {
            type: 'varchar',
            length: 20,
            nullable: false
        },
        join_at: {
            type: 'timestamp',
            nullable: true
        },
        leave_at: {
            type: 'timestamp',
            nullable: true
        },
        cancelled_at: {
            type: 'timestamp',
            nullable: true
        },
        cancellation_reason: {
            type: 'varchar',
            length: 250,
            nullable: true
        },
        created_at: {
            type: 'timestamp',
            createDate: true,
            nullable: false
        }
    },
    relations: {
      User: {
        target: 'User',
        type: 'one-to-one',
        inverseSide: 'CourseBooking',
        JoinColumn: {
          name: 'skill_id',
          referencedColumn: 'id',
          foreignKeyConstraintName: 'coursebooking_user_id_ fk'
        }
      },
      Course: {
        target: 'Course',
        type: 'one-to-one',
        inverseSide: 'CourseBooking',
        joinColumn: {
          name: 'course_id',
          referencedColumn: 'id',
          foreignKeyConstraintName: 'coursebooking_course_id_fk' 
        }
      }
    }

})
