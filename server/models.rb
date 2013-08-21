# -*- coding: utf-8 -*-
require 'sequel'
require 'sequel/extensions/migration'

# Connexion DB
DB = Sequel.sqlite('./cahier_de_texte.sqlite3')

# application des migrations
Sequel::Migrator.run(DB, 'migrations')

# tous les modèles sérialisent en JSON
Sequel::Model.plugin :json_serializer

# définition des modèles
class PlageHoraire < Sequel::Model(:plage_horaire)
end

class Salle < Sequel::Model(:salle)
end

class CreneauEmploiDuTemps < Sequel::Model(:creneau_emploi_du_temps)
  many_to_one :salle
  # FIXME: associations pour les plages horaires de début et de fin ?
end
class CreneauEmploiDuTempsSalle < Sequel::Model(:creneau_emploi_du_temps_salle)
end
class CreneauEmploiDuTempsEnseignant < Sequel::Model(:creneau_emploi_du_temps_enseignant)
end
class CreneauEmploiDuTempsRegroupement < Sequel::Model(:creneau_emploi_du_temps_regroupement)
end

class Ressource < Sequel::Model(:ressource)
end

class Cours < Sequel::Model(:cours)
  many_to_many :ressource
  many_to_one :creneau_emploi_du_temps
  many_to_one :cahier_de_textes
end
class CoursRessource < Sequel::Model(:cours_ressource)
end

class TypeDevoir < Sequel::Model(:type_devoir)
end

class Devoir < Sequel::Model(:devoir)
  many_to_many :ressource
end
class DevoirRessource < Sequel::Model(:devoir_ressource)
end

class CahierDeTextes < Sequel::Model(:cahier_de_textes)
end

class DevoirTodoItem < Sequel::Model(:devoir_todo_item)
  many_to_one :devoir
end

class Etablissement < Sequel::Model(:etablissement)
end
