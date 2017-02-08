exports.up = function(knex, Promise) {
  return knex.schema.createTable('parks', function(table){
    table.increments('id').primary();
    table.string('name').notNullable().unique();
    table.string('reserveworld_camp_ids').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at');
  }).then(function() {
    return knex.schema.createTable('sites', function(table){
      table.increments('id').primary();
      table.string('type').notNullable();
      table.boolean('pet').notNullable();
      table.boolean('electric').notNullable();
      table.boolean('water').notNullable();
      table.boolean('sewer').notNullable();
      table.boolean('amps').nullable();
      table.integer('park_id').unsigned().references('id').inTable('parks');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at');
    });
  }).then(function() {
    return knex.schema.createTable('camp_dates', function(table){
      table.increments('id').primary();
      table.dateTime('date').notNullable();
      table.integer('available').notNullable();
      table.integer('site_id').unsigned().references('id').inTable('sites');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at');
    });
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('camp_dates')
    .then(() => knex.schema.dropTableIfExists('sites'))
    .then(() => knex.schema.dropTableIfExists('parks'));
};
