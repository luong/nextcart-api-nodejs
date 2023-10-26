/*
  Warnings:

  - Made the column `quantity` on table `CartItem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `originalSubtotal` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `originalShipping` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `originalTotal` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `subtotal` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `coupon` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shipping` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `total` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `price` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `priceSet` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `price` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `quantity` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `CartItem` MODIFY `quantity` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Order` MODIFY `originalSubtotal` FLOAT NOT NULL DEFAULT 0,
    MODIFY `originalShipping` FLOAT NOT NULL DEFAULT 0,
    MODIFY `originalTotal` FLOAT NOT NULL DEFAULT 0,
    MODIFY `subtotal` FLOAT NOT NULL DEFAULT 0,
    MODIFY `coupon` FLOAT NOT NULL DEFAULT 0,
    MODIFY `shipping` FLOAT NOT NULL DEFAULT 0,
    MODIFY `total` FLOAT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `OrderItem` MODIFY `price` FLOAT NOT NULL DEFAULT 0,
    MODIFY `priceSet` FLOAT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Product` MODIFY `price` FLOAT NOT NULL DEFAULT 0,
    MODIFY `quantity` INTEGER NOT NULL DEFAULT 0;
