exports.up = function(knex, Promise) {
  return knex.schema.table('sites', function(table){
    table.string('reserveworld_camp_id').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('sites', function(table){
    table.dropColumn('reserveworld_camp_id');
  });
};
