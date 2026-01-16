-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: pgl_libros
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `books`
--

DROP TABLE IF EXISTS `books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `books` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `author` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `cover_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `books`
--

LOCK TABLES `books` WRITE;
/*!40000 ALTER TABLE `books` DISABLE KEYS */;
INSERT INTO `books` VALUES (1,'Los pilares de la Tierra','Ken Follett','Un enorme fresco histórico ambientado en la Inglaterra del siglo XII.','https://covers.openlibrary.org/b/isbn/9788401337208-L.jpg','2025-11-19 15:01:47'),(2,'Juego de tronos','George R.R. Martin','Primera parte de la saga Canción de hielo y fuego.','https://covers.openlibrary.org/b/isbn/9780553386790-L.jpg','2025-11-19 15:01:47'),(3,'Choque de reyes','George R.R. Martin','Segunda parte de Canción de hielo y fuego.','https://covers.openlibrary.org/b/isbn/9780553381696-L.jpg','2025-11-19 15:01:47'),(4,'Tormenta de espadas','George R.R. Martin','Tercera parte de Canción de hielo y fuego.','https://covers.openlibrary.org/b/isbn/9780553381702-L.jpg','2025-11-19 15:01:47'),(5,'El nombre del viento','Patrick Rothfuss','Primera parte de la Crónica del Asesino de Reyes.','https://covers.openlibrary.org/b/isbn/9788401352836-L.jpg','2025-11-19 15:01:47'),(6,'El temor de un hombre sabio','Patrick Rothfuss','Segunda parte de la Crónica del Asesino de Reyes.','https://covers.openlibrary.org/b/isbn/9788401339639-L.jpg','2025-11-19 15:01:47'),(7,'El señor de los anillos: La comunidad del anillo','J.R.R. Tolkien','Primera parte de la trilogía de la Tierra Media.','https://covers.openlibrary.org/b/isbn/9788445071416-L.jpg','2025-11-19 15:01:47'),(8,'El señor de los anillos: Las dos torres','J.R.R. Tolkien','Segunda parte de la trilogía de la Tierra Media.','https://covers.openlibrary.org/b/isbn/9788445071423-L.jpg','2025-11-19 15:01:47'),(9,'El señor de los anillos: El retorno del rey','J.R.R. Tolkien','Tercera parte de la trilogía de la Tierra Media.','https://covers.openlibrary.org/b/isbn/9788445071430-L.jpg','2025-11-19 15:01:47');
/*!40000 ALTER TABLE `books` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rating` tinyint unsigned NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int NOT NULL,
  `book_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_reviews_users` (`user_id`),
  KEY `fk_reviews_books` (`book_id`),
  CONSTRAINT `fk_reviews_books` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (5,7,'777',NULL,'2025-11-20 16:48:52',7,6),(6,7,'777',NULL,'2025-11-20 23:09:44',8,1),(12,6,'ejemplo post',NULL,'2026-01-16 12:31:46',13,4);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `profile_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `uq_users_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'prueba1','prueba1@example.com','$2b$10$6Ms4nldv5Tt8w7mBVzm1kONRFkk4hO8ARa3pYyD.pYGFfkH6XTIhq','2025-11-16 21:45:08',NULL),(2,'prueba2','prueba2@example.com','$2b$10$ddcIq17qIM9/UA.fUeTSAOgTZEi0xB.Lmk0fMOTITPtA9BM1fiida','2025-11-17 17:39:58',NULL),(3,'eduardo10','eduardo@gmail.com','$2b$10$v.FWOz1CmewD4vpLdmT8MuPwLmtQBb15drFhMhmeZ/yYqVAHE8i1e','2025-11-17 17:40:53',NULL),(4,'prueba5','prueba5@example.com','$2b$10$nCG/SsJ6ld2bYg.jJL6OuuIwPfEC/uhWgRzP/JQnxv4LKsSktanQ2','2025-11-17 18:16:04',NULL),(5,'eeeeeeeeeeeeee','eduromero@gmail.com','$2b$10$0OTaFHXhb6ExIOOVPnW/e.FrSJAhwLjbIDnQ9jI/18c18My3tliP6','2025-11-18 03:56:35','http://localhost:3000/uploads/1763438195107.jpg'),(6,'eeeedu','romer@gmail.com','$2b$10$7KorY3KbXWqR/qc03cyy0.3hftmqT8CjXmmcYrKFrboC0bzha1ck.','2025-11-18 04:00:14','http://localhost:3000/uploads/1763438414084.jpg'),(7,'eduprueba','eduprueba@gmail.com','$2b$10$V6ip9PsDmIrVcr5hB0MkF.BSK1lRjjXWjsQyrIpTZG.OFiSRu5zhK','2025-11-19 00:12:38','http://localhost:3000/uploads/1763511158817.jpg'),(8,'eduprueba2','eduprueba2@gmail.com','$2b$10$PrelHU4tRoep6MHTrngcferBrN8wV/3e7yYwbOGQV2e7S2v8/eO3m','2025-11-20 20:49:52','http://localhost:3000/uploads/1763671792810.jpg'),(9,'eduprueba2.0@gmail.com','eeeduuu@gmail.com','$2b$10$SwgxSL0M.JxceNxu88v6Ju1QZKgRjvkpJerYjV38Hp1UEHfj/iESq','2025-11-20 23:32:38',NULL),(10,'pruebafacil','pruebafacil@gmail.com','$2b$10$XwYUBUZ88Pq7W64sik70l.8/Jep/XcrJsnvDlR.TSZRqcEx2l77kK','2025-11-20 23:33:25',NULL),(11,'eduejemplo','eduromeroejemplo@gmail.com','$2b$10$MX2Hzrhgh8E9HOyf6xH04ekDj4iBvL4J.qk222Twx1vBGZoj0TINy','2026-01-12 12:16:46','http://localhost:3000/uploads/1768220206034.webp'),(12,'eduromeropost','eduromeropost@gmail.com','$2b$10$3cQ2Q2bvPfNT4U7.ul6IVuKzbIED/bgnbkdYP91.7rN.WYc6Dqelm','2026-01-16 01:51:28','http://192.168.120.150:3000/uploads/1768528288717.webp'),(13,'eduromeropostprueba','eduromeropostprueba@gmail.com','$2b$10$4LbAN1Aq9AOGCmRAly.bwOQgWrvMNmf.yJEemYV3m4B2G.rbHgmby','2026-01-16 01:58:39','http://192.168.120.150:3000/uploads/1768528719483.webp'),(14,'crearcuentapost','crearcuentapost@gmail.com','$2b$10$oMjJVyk3KiLu6CK2cij0heZhd4SaE8u4NYiKPjnc6FmRfEtJ.vcUi','2026-01-16 12:34:56',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-16 14:02:23
