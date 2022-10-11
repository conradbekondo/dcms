-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema dcms
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema dcms
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `dcms` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `dcms` ;

-- -----------------------------------------------------
-- Table `dcms`.`profiles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dcms`.`profiles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date_created` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `last_updated` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NULL DEFAULT NULL,
  `phone_number` VARCHAR(255) NULL DEFAULT NULL,
  `nat_id` VARCHAR(255) NULL DEFAULT NULL,
  `gender` INT NOT NULL DEFAULT '0',
  `notes` VARCHAR(500) NULL DEFAULT NULL,
  `address` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  FULLTEXT INDEX `IDX_a310e66b244a9b755a73fb35e0` (`first_name`) VISIBLE,
  FULLTEXT INDEX `IDX_9d3c5e5c4a1b53a630ac666070` (`last_name`) VISIBLE,
  FULLTEXT INDEX `IDX_b4914d605fd119c1046868effc` (`phone_number`) VISIBLE,
  FULLTEXT INDEX `IDX_ecbe090acc27b0076222e272ad` (`nat_id`) VISIBLE,
  FULLTEXT INDEX `IDX_6bb783ed1de0c389eeedb6c219` (`notes`) VISIBLE,
  FULLTEXT INDEX `IDX_2b72980cc3493eaf692293c288` (`address`) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `dcms`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dcms`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date_created` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `last_updated` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `username` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `is_locked` TINYINT NOT NULL DEFAULT '0',
  `profile_id` INT NOT NULL,
  `creator_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `IDX_fe0bb3f6520ee0469504521e71` (`username` ASC) VISIBLE,
  UNIQUE INDEX `REL_23371445bd80cb3e413089551b` (`profile_id` ASC) VISIBLE,
  INDEX `FK_eebaffddb3c6e049fa709e7de02` (`creator_id` ASC) VISIBLE,
  CONSTRAINT `FK_23371445bd80cb3e413089551bf`
    FOREIGN KEY (`profile_id`)
    REFERENCES `dcms`.`profiles` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `FK_eebaffddb3c6e049fa709e7de02`
    FOREIGN KEY (`creator_id`)
    REFERENCES `dcms`.`users` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `dcms`.`services`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dcms`.`services` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date_created` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `last_updated` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `name` VARCHAR(255) NOT NULL,
  `description` MEDIUMTEXT NULL DEFAULT NULL,
  `is_additional` TINYINT NOT NULL DEFAULT '0',
  `created_by` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `FK_c896350eb4a5969991bccfb0759` (`created_by` ASC) VISIBLE,
  CONSTRAINT `FK_c896350eb4a5969991bccfb0759`
    FOREIGN KEY (`created_by`)
    REFERENCES `dcms`.`users` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `dcms`.`clients`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dcms`.`clients` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date_created` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `last_updated` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NULL DEFAULT NULL,
  `phone` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NULL DEFAULT NULL,
  `address` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `IDX_aa22377d7d3e794ae4cd39cd9e` (`phone` ASC) VISIBLE,
  FULLTEXT INDEX `IDX_cfa8dd4f736cb38afb469fc09d` (`first_name`) VISIBLE,
  FULLTEXT INDEX `IDX_3567e933b1eef4720d92e9af2e` (`last_name`) VISIBLE,
  FULLTEXT INDEX `IDX_b48860677afe62cd96e1265948` (`email`) VISIBLE,
  FULLTEXT INDEX `IDX_663ef24cff96c52e43d3148f29` (`address`) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `dcms`.`orders`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dcms`.`orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date_created` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `last_updated` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `customer_id` INT NOT NULL,
  `description` MEDIUMTEXT NULL DEFAULT NULL,
  `status` INT NOT NULL DEFAULT '0',
  `due_date` DATETIME NOT NULL,
  `recorder_id` INT NOT NULL,
  `code` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `IDX_3e413c10c595c04c6c70e58a4d` (`code` ASC) VISIBLE,
  INDEX `FK_772d0ce0473ac2ccfa26060dbe9` (`customer_id` ASC) VISIBLE,
  INDEX `FK_8205d9bff228912ad5ac7d6b658` (`recorder_id` ASC) VISIBLE,
  FULLTEXT INDEX `IDX_6d111140745b1d64f2cdb7bbcc` (`description`) VISIBLE,
  CONSTRAINT `FK_772d0ce0473ac2ccfa26060dbe9`
    FOREIGN KEY (`customer_id`)
    REFERENCES `dcms`.`clients` (`id`),
  CONSTRAINT `FK_8205d9bff228912ad5ac7d6b658`
    FOREIGN KEY (`recorder_id`)
    REFERENCES `dcms`.`users` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `dcms`.`categories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dcms`.`categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date_created` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `last_updated` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `name` VARCHAR(255) NOT NULL,
  `description` MEDIUMTEXT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `IDX_8b0be371d28245da6e4f4b6187` (`name` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `dcms`.`products`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dcms`.`products` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date_created` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `last_updated` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `name` VARCHAR(255) NOT NULL,
  `category_id` INT NOT NULL,
  `description` MEDIUMTEXT NULL DEFAULT NULL,
  `icon_url` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `FK_9a5f6868c96e0069e699f33e124` (`category_id` ASC) VISIBLE,
  CONSTRAINT `FK_9a5f6868c96e0069e699f33e124`
    FOREIGN KEY (`category_id`)
    REFERENCES `dcms`.`categories` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `dcms`.`order_entries`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dcms`.`order_entries` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date_created` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `last_updated` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `order_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `product_id` INT NOT NULL,
  `service_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `FK_26dcb7b5e3f70bca0d41fb82f5c` (`order_id` ASC) VISIBLE,
  INDEX `FK_bed28ad03d0c828c850ac34b76c` (`product_id` ASC) VISIBLE,
  INDEX `FK_1912f03088bced42ff97753bce0` (`service_id` ASC) VISIBLE,
  CONSTRAINT `FK_1912f03088bced42ff97753bce0`
    FOREIGN KEY (`service_id`)
    REFERENCES `dcms`.`services` (`id`),
  CONSTRAINT `FK_26dcb7b5e3f70bca0d41fb82f5c`
    FOREIGN KEY (`order_id`)
    REFERENCES `dcms`.`orders` (`id`),
  CONSTRAINT `FK_bed28ad03d0c828c850ac34b76c`
    FOREIGN KEY (`product_id`)
    REFERENCES `dcms`.`products` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `dcms`.`order_entry_attributes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dcms`.`order_entry_attributes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date_created` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `last_updated` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `name` VARCHAR(255) NOT NULL,
  `value` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `dcms`.`attached_order_entry_attributes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dcms`.`attached_order_entry_attributes` (
  `order_entry_id` INT NOT NULL,
  `attribute_id` INT NOT NULL,
  PRIMARY KEY (`order_entry_id`, `attribute_id`),
  INDEX `IDX_101667309cfdba3abaed975959` (`order_entry_id` ASC) VISIBLE,
  INDEX `IDX_d388999b4db9e6da77c74edc35` (`attribute_id` ASC) VISIBLE,
  CONSTRAINT `FK_101667309cfdba3abaed9759591`
    FOREIGN KEY (`order_entry_id`)
    REFERENCES `dcms`.`order_entries` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `FK_d388999b4db9e6da77c74edc35a`
    FOREIGN KEY (`attribute_id`)
    REFERENCES `dcms`.`order_entry_attributes` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `dcms`.`invoices`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dcms`.`invoices` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date_created` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `last_updated` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `order_id` INT NOT NULL,
  `total` INT NOT NULL,
  `net_payable` INT NOT NULL,
  `amount_paid` INT NOT NULL,
  `balance` INT NOT NULL,
  `recorded_by_id` INT NOT NULL,
  `status` INT NOT NULL,
  `due_date` DATETIME NOT NULL,
  `tax` INT NOT NULL,
  `discount` INT NOT NULL,
  `payment_type` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `REL_ea83c3b911906a3578de2340fd` (`order_id` ASC) VISIBLE,
  INDEX `FK_50e8efae79fdbdcf045b33258b7` (`recorded_by_id` ASC) VISIBLE,
  FULLTEXT INDEX `IDX_18792501f742727ef576298f7f` (`payment_type`) VISIBLE,
  CONSTRAINT `FK_50e8efae79fdbdcf045b33258b7`
    FOREIGN KEY (`recorded_by_id`)
    REFERENCES `dcms`.`users` (`id`),
  CONSTRAINT `FK_ea83c3b911906a3578de2340fdf`
    FOREIGN KEY (`order_id`)
    REFERENCES `dcms`.`orders` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `dcms`.`invoice_items`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dcms`.`invoice_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date_created` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `last_updated` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `invoice_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `service_id` INT NOT NULL,
  `price_mode` VARCHAR(255) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `service_name` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL DEFAULT '1',
  `service_price_snapshot` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `FK_dc991d555664682cfe892eea2c1` (`invoice_id` ASC) VISIBLE,
  CONSTRAINT `FK_dc991d555664682cfe892eea2c1`
    FOREIGN KEY (`invoice_id`)
    REFERENCES `dcms`.`invoices` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `dcms`.`invoice_item_additional_services`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dcms`.`invoice_item_additional_services` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date_created` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `last_updated` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `invoice_item_id` INT NOT NULL,
  `service_id` INT NOT NULL,
  `service_name` VARCHAR(255) NOT NULL,
  `price` INT NOT NULL,
  `invoice_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `FK_7c2bd8cc99ba8205ab7fdfc9055` (`invoice_item_id` ASC) VISIBLE,
  CONSTRAINT `FK_7c2bd8cc99ba8205ab7fdfc9055`
    FOREIGN KEY (`invoice_item_id`)
    REFERENCES `dcms`.`invoice_items` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `dcms`.`product_prices`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dcms`.`product_prices` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date_created` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `last_updated` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `product_id` INT NOT NULL,
  `service_id` INT NOT NULL,
  `normal_price` DOUBLE NOT NULL DEFAULT '0',
  `fast_price` DOUBLE NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  INDEX `FK_8218c69c7f5a3706662101fa788` (`product_id` ASC) VISIBLE,
  INDEX `FK_804e92a0844598c6b30a6ade336` (`service_id` ASC) VISIBLE,
  CONSTRAINT `FK_804e92a0844598c6b30a6ade336`
    FOREIGN KEY (`service_id`)
    REFERENCES `dcms`.`services` (`id`),
  CONSTRAINT `FK_8218c69c7f5a3706662101fa788`
    FOREIGN KEY (`product_id`)
    REFERENCES `dcms`.`products` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `dcms`.`roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dcms`.`roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date_created` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `last_updated` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `role_name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `IDX_ac35f51a0f17e3e1fe12112603` (`role_name` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `dcms`.`typeorm_metadata`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dcms`.`typeorm_metadata` (
  `type` VARCHAR(255) NOT NULL,
  `database` VARCHAR(255) NULL DEFAULT NULL,
  `schema` VARCHAR(255) NULL DEFAULT NULL,
  `table` VARCHAR(255) NULL DEFAULT NULL,
  `name` VARCHAR(255) NULL DEFAULT NULL,
  `value` TEXT NULL DEFAULT NULL)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `dcms`.`user_logins`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dcms`.`user_logins` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date_created` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `last_updated` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `user_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `FK_b0133215faede166e3c8772e0d2` (`user_id` ASC) VISIBLE,
  CONSTRAINT `FK_b0133215faede166e3c8772e0d2`
    FOREIGN KEY (`user_id`)
    REFERENCES `dcms`.`users` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 1
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `dcms`.`user_roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dcms`.`user_roles` (
  `user_id` INT NOT NULL,
  `role_id` INT NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`),
  INDEX `IDX_87b8888186ca9769c960e92687` (`user_id` ASC) VISIBLE,
  INDEX `IDX_b23c65e50a758245a33ee35fda` (`role_id` ASC) VISIBLE,
  CONSTRAINT `FK_87b8888186ca9769c960e926870`
    FOREIGN KEY (`user_id`)
    REFERENCES `dcms`.`users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `FK_b23c65e50a758245a33ee35fda1`
    FOREIGN KEY (`role_id`)
    REFERENCES `dcms`.`roles` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

USE `dcms` ;

-- -----------------------------------------------------
-- Placeholder table for view `dcms`.`priced_categories_view`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dcms`.`priced_categories_view` (`product_id` INT, `category_id` INT, `category_name` INT, `icon_url` INT, `fast_price` INT, `normal_price` INT, `pricing_date` INT);

-- -----------------------------------------------------
-- Placeholder table for view `dcms`.`vw_orders`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `dcms`.`vw_orders` (`total` INT, `balance` INT, `tax` INT, `discount` INT, `invoice_status` INT, `order_id` INT, `code` INT, `order_status` INT, `recorder_id` INT, `customer` INT, `phone` INT, `number_of_services` INT, `number_of_entries` INT, `description` INT, `net_payable` INT, `amount_paid` INT, `date_recorded` INT, `due_date` INT, `recorded_by` INT);

-- -----------------------------------------------------
-- View `dcms`.`priced_categories_view`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `dcms`.`priced_categories_view`;
USE `dcms`;
CREATE  OR REPLACE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `dcms`.`priced_categories_view` AS select `p`.`id` AS `product_id`,`c`.`id` AS `category_id`,`c`.`name` AS `category_name`,`p`.`icon_url` AS `icon_url`,`pp`.`fast_price` AS `fast_price`,`pp`.`normal_price` AS `normal_price`,`pp`.`date_created` AS `pricing_date` from (((`dcms`.`product_prices` `pp` join `dcms`.`products` `p` on((`p`.`id` = `pp`.`product_id`))) join `dcms`.`services` `s` on((`s`.`id` = `pp`.`service_id`))) left join `dcms`.`categories` `c` on((`c`.`id` = `p`.`category_id`))) group by `c`.`id`,`p`.`id`,`s`.`id`;

-- -----------------------------------------------------
-- View `dcms`.`vw_orders`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `dcms`.`vw_orders`;
USE `dcms`;
CREATE  OR REPLACE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `dcms`.`vw_orders` AS select `i`.`total` AS `total`,`i`.`balance` AS `balance`,`i`.`tax` AS `tax`,`i`.`discount` AS `discount`,`i`.`status` AS `invoice_status`,`o`.`id` AS `order_id`,`o`.`code` AS `code`,`o`.`status` AS `order_status`,`u`.`id` AS `recorder_id`,trim(concat(`c`.`first_name`,' ',coalesce(`c`.`last_name`,''))) AS `customer`,coalesce(`c`.`phone`,'N/A') AS `phone`,(select ((select count(0) from `dcms`.`invoice_item_additional_services` `iias` where (`iias`.`invoice_id` = `i`.`id`)) + 1)) AS `number_of_services`,(select (select count(`oe`.`quantity`) from `dcms`.`order_entries` `oe` where (`oe`.`order_id` = `o`.`id`))) AS `number_of_entries`,coalesce(`o`.`description`,'N / A') AS `description`,`i`.`net_payable` AS `net_payable`,`i`.`amount_paid` AS `amount_paid`,`i`.`date_created` AS `date_recorded`,`i`.`due_date` AS `due_date`,trim(concat(`p`.`first_name`,' ',coalesce(`p`.`last_name`,''))) AS `recorded_by` from ((((`dcms`.`invoices` `i` join `dcms`.`orders` `o` on((`i`.`order_id` = `o`.`id`))) join `dcms`.`clients` `c` on((`c`.`id` = `o`.`customer_id`))) left join `dcms`.`users` `u` on((`u`.`id` = `i`.`recorded_by_id`))) left join `dcms`.`profiles` `p` on((`p`.`id` = `u`.`profile_id`))) order by `i`.`date_created` desc;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;


-- -----------------------------------------------------
-- Data for table `dcms`.`roles`
-- -----------------------------------------------------
START TRANSACTION;
USE `dcms`;
INSERT INTO `dcms`.`roles` (`id`, `date_created`, `last_updated`, `role_name`) VALUES (1, DEFAULT, DEFAULT, 'admin');
INSERT INTO `dcms`.`roles` (`id`, `date_created`, `last_updated`, `role_name`) VALUES (2, DEFAULT, DEFAULT, 'staff');
INSERT INTO `dcms`.`roles` (`id`, `date_created`, `last_updated`, `role_name`) VALUES (3, DEFAULT, DEFAULT, 'system');

COMMIT;

-- -----------------------------------------------------
-- Data for table `dcms`.`profiles`
-- -----------------------------------------------------
START TRANSACTION;
USE `dcms`;
INSERT INTO `dcms`.`profiles` (`id`, `date_created`, `last_updated`, `first_name`, `last_name`, `phone_number`, `nat_id`, `gender`, `notes`, `address`) VALUES (1, DEFAULT, DEFAULT, 'System', '', 'n/a', 'n/a', 2, NULL, NULL);

COMMIT;


-- -----------------------------------------------------
-- Data for table `dcms`.`users`
-- -----------------------------------------------------
START TRANSACTION;
USE `dcms`;
INSERT INTO `dcms`.`users` (`id`, `date_created`, `last_updated`, `username`, `password_hash`, `is_locked`, `profile_id`, `creator_id`) VALUES (1, DEFAULT, DEFAULT, 'system', '$2b$12$OuU7CXDBJzKLKyCG6mYMf.4yP1S21cqNtauS7BDBKYAxBwVqoA/r6', 0, 1, NULL);

COMMIT;


-- -----------------------------------------------------
-- Data for table `dcms`.`user_roles`
-- -----------------------------------------------------
START TRANSACTION;
USE `dcms`;
INSERT INTO `dcms`.`user_roles` (`user_id`, `role_id`) VALUES (1, 3);

COMMIT;

