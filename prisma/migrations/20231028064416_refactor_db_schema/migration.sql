/*
  Warnings:

  - Made the column `firstName` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address1` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Made the column `state` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Made the column `country` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isDefault` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `amount` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Address` MODIFY `firstName` VARCHAR(45) NOT NULL,
    MODIFY `lastName` VARCHAR(45) NOT NULL,
    MODIFY `address1` VARCHAR(200) NOT NULL,
    MODIFY `state` VARCHAR(45) NOT NULL,
    MODIFY `country` VARCHAR(20) NOT NULL,
    MODIFY `isDefault` TINYINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Order` MODIFY `status` ENUM('Pending', 'Completed', 'Cancelled') NOT NULL;

-- AlterTable
ALTER TABLE `Payment` MODIFY `amount` FLOAT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Product` MODIFY `status` ENUM('Active', 'Archieved') NOT NULL;
