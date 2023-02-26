-- Kévin Ferreira

-- Supprimer si existante 
DROP DATABASE IF EXISTS ecole;
 
-- Création de la base de données
CREATE DATABASE ecole;

-- Utilisation de la bdd
USE ecole;

-- Nettoyage 
DROP TABLE IF EXISTS Societe;
DROP TABLE IF EXISTS Enseignant;
DROP TABLE IF EXISTS Parcours;
DROP TABLE IF EXISTS Classe;
DROP TABLE IF EXISTS Etudiant;
DROP TABLE IF EXISTS Matière;
DROP TABLE IF EXISTS Cours;
DROP TABLE IF EXISTS Programme;
DROP TABLE IF EXISTS Prestation;
DROP TABLE IF EXISTS Note;
DROP TRIGGER IF EXISTS after_enseignant_create;

-- Création de la table société
CREATE TABLE IF NOT EXISTS Societe (
    Soc_id INT AUTO_INCREMENT,
    Soc_nom VARCHAR(50) NOT NULL,
    CONSTRAINT PK_Soc_id PRIMARY KEY(Soc_id),
    CONSTRAINT U_Soc_nom UNIQUE(Soc_nom)
);

-- Création de table enseignant
CREATE TABLE IF NOT EXISTS Enseignant (
    Ens_id INT NOT NULL AUTO_INCREMENT,
    Ens_prenom VARCHAR(50) NOT NULL,
    Ens_nom VARCHAR(50) NOT NULL,
    Ens_date_naissance DATE NOT NULL,
    Ens_societe_id INT,
    Ens_statut ENUM('interne', 'externe'),
    CONSTRAINT PK_Ens_id PRIMARY KEY (Ens_id),
    CONSTRAINT CK_Ens_date_naissance CHECK (Ens_date_naissance <= '2005-01-01'),
    CONSTRAINT FK_Ens_societe_id FOREIGN KEY (Ens_societe_id)
        REFERENCES Societe (Soc_id)
);

-- Création de la table parcours
CREATE TABLE IF NOT EXISTS Parcours (
	Par_id 				INT NOT NULL AUTO_INCREMENT,
    Par_intitule		VARCHAR(50) NOT NULL,
    Par_responsable_id 	INT,
    Par_annee_lmd 			INT NOT NULL,
    CONSTRAINT PK_Par_id PRIMARY KEY(Par_id),
    CONSTRAINT U_Par_intitule UNIQUE(Par_intitule),
    CONSTRAINT FK_Par_responsable_id FOREIGN KEY(Par_responsable_id) REFERENCES Enseignant(Ens_id),
    CONSTRAINT CK_Par_annee_lmd CHECK(Par_annee_lmd BETWEEN 1 AND 5)
);

-- Création de la table classe
CREATE TABLE IF NOT EXISTS Classe (
    Cla_id INT NOT NULL AUTO_INCREMENT,
    Cla_intitule VARCHAR(10) NOT NULL,
    Cla_annee_promo YEAR NOT NULL, -- DATE NOT NULL,
    Cla_parcours_id INT NOT NULL,
    CONSTRAINT PK_Cla_id PRIMARY KEY (Cla_id),
    CONSTRAINT FK_Cla_parcours_id FOREIGN KEY (Cla_parcours_id)
        REFERENCES Parcours (Par_id)
);

-- Création de la table etudiant
CREATE TABLE IF NOT EXISTS Etudiant (
    Etu_id INT NOT NULL AUTO_INCREMENT,
    Etu_prenom VARCHAR(50) NOT NULL,
    Etu_nom VARCHAR(50) NOT NULL,
    Etu_date_naissance DATE NOT NULL,
    Etu_id_classe INT NOT NULL,
    CONSTRAINT PK_Etu_id PRIMARY KEY (Etu_id),
    CONSTRAINT CK_Etu_date_naissance CHECK (Etu_date_naissance <= '2006-01-01'),
    CONSTRAINT FK_Etu_id_classe FOREIGN KEY(Etu_id_classe) REFERENCES Classe(Cla_id)
);

-- Création de la table Matière
CREATE TABLE IF NOT EXISTS Matiere (
    Mat_id INT NOT NULL AUTO_INCREMENT,
    Mat_intitule VARCHAR(50) NOT NULL,
    CONSTRAINT PK_mat_id PRIMARY KEY (Mat_id)
);

-- Création de la table cours
CREATE TABLE IF NOT EXISTS Cours (
	Cou_id INT NOT NULL AUTO_INCREMENT,
    Cou_classe_id INT,
    Cou_enseignant_id INT,
    Cou_matiere_id INT,
    Cou_intitule VARCHAR(50) NOT NULL,
    Cou_datetime_debut DATETIME NOT NULL,
    Cou_datetime_fin DATETIME NOT NULL,
    CONSTRAINT PK_Cou_id PRIMARY KEY(Cou_id),
    CONSTRAINT FK_Cou_classe_id FOREIGN KEY(Cou_classe_id) REFERENCES Classe(Cla_id),
    CONSTRAINT FK_Cou_enseignant_id FOREIGN KEY(Cou_enseignant_id) REFERENCES Enseignant(Ens_id),
    CONSTRAINT FK_Cou_matiere_id FOREIGN KEY(Cou_matiere_id) REFERENCES Matiere(Mat_id),
	CONSTRAINT CK_duree_min CHECK(TIMEDIFF(Cou_datetime_fin, Cou_datetime_debut) > "00:59")
);

-- Création de la table programme
CREATE TABLE IF NOT EXISTS Programme (
	Pro_parcours_id INT NOT NULL,
    Pro_matiere_id INT NOT NULL,
    CONSTRAINT PK_programme PRIMARY KEY(Pro_parcours_id, Pro_matiere_id),
    CONSTRAINT FK_Pro_parcours_id FOREIGN KEY (Pro_parcours_id) REFERENCES Parcours(Par_id),
    CONSTRAINT FK_Pro_matiere_id FOREIGN KEY (Pro_matiere_id) REFERENCES Matiere(Mat_id)
);

-- Création de prestation
CREATE TABLE IF NOT EXISTS Prestation (
	Pre_matiere_id INT NOT NULL,
    Pre_enseignant_id INT NOT NULL,
    Pre_prix_heure DOUBLE,
    CONSTRAINT PK_Prestation PRIMARY KEY(Pre_matiere_id, Pre_enseignant_id),
    CONSTRAINT FK_pre_matiere_id FOREIGN KEY(Pre_matiere_id) REFERENCES Matiere(Mat_id),
    CONSTRAINT FK_enseignant_id FOREIGN KEY(Pre_enseignant_id) REFERENCES Enseignant(Ens_id)
);

-- Creation de note 
CREATE TABLE IF NOT EXISTS Note (
	Not_id INT AUTO_INCREMENT,
    Not_value DOUBLE NOT NULL,
    Not_coefficient DOUBLE NOT NULL,
    Not_etu_id INT NOT NULL,
    Not_matiere_id INT NOT NULL,
    CONSTRAINT PK_Not_id PRIMARY KEY(Not_id),
    CONSTRAINT FK_Not_id FOREIGN KEY(Not_etu_id) REFERENCES Etudiant(Etu_id),
    CONSTRAINT FK_Not_matiere_id FOREIGN KEY(Not_matiere_id) REFERENCES Matiere(Mat_id)
);

-- Création trigger after_enseignant_create
DROP TRIGGER IF EXISTS after_enseignant_create;
DELIMITER //
CREATE TRIGGER after_enseignant_create   
BEFORE INSERT ON Enseignant
FOR EACH ROW
BEGIN
	IF New.Ens_societe_id IS NULL THEN
		SET New.Ens_statut = 'interne';
		-- UPDATE Enseignant SET New.Ens_statut = 'interne' ;
	ELSE
		SET New.Ens_statut = 'externe';
		-- UPDATE Enseignant SET Ens_statut = 'externe' ;
	END IF;
END; //
DELIMITER ;

