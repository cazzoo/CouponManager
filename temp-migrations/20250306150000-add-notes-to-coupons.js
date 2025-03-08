'use strict';

exports.shorthands = undefined;

exports.up = async function(pgm) {
  // Add notes column to coupons table
  pgm.addColumn('coupons', {
    notes: { type: 'text' }
  });
  
  // Add comment to notes column
  pgm.sql(`COMMENT ON COLUMN public.coupons.notes IS 'Additional notes about the coupon'`);
}

exports.down = async function(pgm) {
  // Remove notes column from coupons table
  pgm.dropColumn('coupons', 'notes');
} 