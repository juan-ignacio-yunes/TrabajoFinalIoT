-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Servidor: mysql-server
-- Tiempo de generación: 30-11-2020 a las 23:27:10
-- Versión del servidor: 5.7.27
-- Versión de PHP: 7.2.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


--
-- Base de datos: 'smart'
--

CREATE DATABASE IF NOT EXISTS `smart` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `smart`;

-- --------------------------------------------------------

--
-- Estructura de tabla 'mascotas'
--

CREATE TABLE `mascotas` (
  `pet_id` int NOT NULL AUTO_INCREMENT,
  `pet_nombre` varchar(50) DEFAULT NULL,
  `raza` varchar(50) DEFAULT NULL,
  `alturaHombros_cm` float DEFAULT NULL,
  `peso_kg` float DEFAULT NULL,
  `limites` JSON DEFAULT NULL, -- {límite inferior, límite superior}
  `fechaNacimiento` date DEFAULT NULL,
  `observaciones` varchar(400) DEFAULT NULL,
  PRIMARY KEY (`pet_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla 'mascotas'
-- No debería ser necesario explicitar pet_id porque es autocomplete

INSERT INTO `mascotas` (`pet_nombre`, `raza`, `alturaHombros_cm`, `peso_kg`, `limites`, `fechaNacimiento`, `observaciones`) VALUES
('Pichicho', 'callejero', 40, 1.5, '{"limite_inferior": 1, "limite_superior": 2}', '2024-12-01', 'problemas crónicos por leishmaniasis'),
('Fenômeno', 'Fila brasileño', 70, 50, '{"limite_inferior": 45, "limite_superior": 55}','2014-07-01',NULL);


-- --------------------------------------------------------

--
-- Estructura de tabla 'dispositivos'
--

CREATE TABLE dispositivos (
  `device_id` int NOT NULL AUTO_INCREMENT,
  `device_nombre` varchar(20) DEFAULT NULL,
  `modelo` varchar(10) DEFAULT NULL,
  PRIMARY KEY (device_id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Carga de datos a la tabla 'dispositivos'
-- Como device_id es autocomplete, no debería necesitar que se lo explicite al cargar datos 

INSERT INTO `dispositivos` (`device_nombre`, `modelo`) VALUES
('comedero Pepe',  'v1'),
('feeder',         'v1');

-- --------------------------------------------------------

--
-- Estructura de tabla 'usuarios'
--

CREATE TABLE usuarios (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `user_email` varchar(50) NOT NULL,
  `contraseña` varchar(255) NOT NULL,
  `user_nombre` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY (`user_email`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


--
-- Volcado de datos para la tabla 'usuarios'
--

INSERT INTO `usuarios` (`user_email`, `contraseña`, `user_nombre`) VALUES
('prueba1@gmail.com', '01234', 'prueba1'),
('prueba2@gmail.com', '56789', 'prueba2');

-- --------------------------------------------------------

--
-- Estructura de tabla 'mediciones'
--

CREATE TABLE `mediciones` (
  `measure_id` int NOT NULL AUTO_INCREMENT,
  `pet_id` int NOT NULL,
  `fechaHora_medicion` datetime NOT NULL,
  `valor` JSON NOT NULL, -- {peso animal en kg, peso porciónen g}
  PRIMARY KEY (`measure_id`),
  KEY `fk_measureId_petId_idx` (`pet_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla 'mediciones'
--

INSERT INTO `mediciones` (`pet_id`, `fechaHora_medicion`, `valor`) VALUES
(2 ,'2020-11-26 21:01:41', '{"peso_animal":51.01, "peso_racion":502}'),
(2, '2020-11-26 22:02:06', '{"peso_animal":50.65, "peso_racion":499}');

-- --------------------------------------------------------

--
-- Estructura de tabla 'relaciones'
--

CREATE TABLE `relaciones` (
  `relation_id` int NOT NULL AUTO_INCREMENT,
  `pet_id` int DEFAULT NULL, -- no siempre bva a estar relacionado algún animal. Por ejemplo, cuando reién se conecta un usuario a un alientador
  `device_id` int NOT NULL,
  `user_id` int NOT NULL,
  `user_permisos` varchar(20) NOT NULL, -- admin, editor, lector
  PRIMARY KEY (`relation_id`),
  KEY `fk_relationId_petId_idx` (`pet_id`),
  KEY `fk_relationId_deviceId_idx` (`device_id`),
  KEY `fk_relationId_userId_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla 'relaciones'
--

INSERT INTO `relaciones` (`pet_id`, `device_id`, `user_id`, `user_permisos`) VALUES
(1, 1, 1, 'admin'),
(2, 1, 2, 'admin');

-- --------------------------------------------------------

--
-- Estructura de tabla 'anotaciones'
--

CREATE TABLE `anotaciones` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `relation_id` int NOT NULL, -- no siempre va a estar relacionado a algún animal. Por ejemplo, cuando recién se conecta un usuario a un alimentador
  `fechaHora_anotacion` datetime NOT NULL,
  `anotacion` varchar(500) NOT NULL,
  PRIMARY KEY (log_id),
  KEY fk_logId_relationId_idx (relation_id)

) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos a la tabla 'anotaciones'
--

INSERT INTO `anotaciones` (`relation_id`, `fechaHora_anotacion`, `anotacion`) VALUES
(2, '2024-01-21 14:32:15', 'llevé a Fenômeno a desparasitación'),
(2, '2024-02-24 08:49:47', 'el control de desparasitación dió ok');

-- --------------------------------------------------------

--
-- Estructura de tabla 'raciones'
--

CREATE TABLE `raciones` (
  `ration_id` int NOT NULL AUTO_INCREMENT,
  `relation_id` int NOT NULL,
  `fechaHora_ultima_modif` datetime NOT NULL,
  `racion_peso_gr` float NOT NULL,
  `racion_hora` time NOT NULL,
  `alimento_marca` varchar(50) DEFAULT NULL,
  `alimento_nombre` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`ration_id`),
  KEY `fk_rationId_relationId_idx` (`relation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos a la tabla 'raciones'
--

INSERT INTO `raciones` (`relation_id`, `fechaHora_ultima_modif`, `racion_peso_gr`, `racion_hora`, `alimento_marca`, `alimento_nombre`) VALUES
(2, '2024-01-25 17:00:40', 200, '08:00:00', NULL, NULL);

-- --------------------------------------------------------

--
-- Filtros para la tabla 'mediciones'
--
ALTER TABLE `mediciones`
  ADD CONSTRAINT `fk_mediciones_petId` FOREIGN KEY (`pet_id`) REFERENCES `mascotas` (`pet_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Filtros para la tabla 'relaciones'
--
ALTER TABLE `relaciones`
  ADD CONSTRAINT `fk_relaciones_petId` FOREIGN KEY (`pet_id`) REFERENCES `mascotas` (`pet_id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_relaciones_deviceId` FOREIGN KEY (`device_id`) REFERENCES `dispositivos` (`device_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_relaciones_userEmail` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla 'anotaciones'
--
ALTER TABLE `anotaciones`
  ADD CONSTRAINT `fk_anotaciones_relationId` FOREIGN KEY (`relation_id`) REFERENCES `relaciones` (`relation_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Filtros para la tabla 'raciones'
--
ALTER TABLE `raciones`
  ADD CONSTRAINT `fk_raciones_relationId` FOREIGN KEY (`relation_id`) REFERENCES `relaciones` (`relation_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- --------------------------------------------------------

--
-- trigger para actualización del peso de la mascota de acuerdo a última medición
--

DELIMITER //

CREATE TRIGGER actualizar_peso_mascota
AFTER INSERT ON `mediciones`
FOR EACH ROW
BEGIN
  -- Extraer el valor JSON del campo `valor` (peso_animal)
  DECLARE `peso_actual` FLOAT;
  SET `peso_actual` = JSON_UNQUOTE(JSON_EXTRACT(NEW.`valor`, '$.peso_animal'));

  -- Actualizar el campo `peso` en la tabla `mascotas`
  UPDATE `mascotas`
  SET `peso_kg` = `peso_actual`
  WHERE `pet_id` = NEW.`pet_id`;
END; //

DELIMITER ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
