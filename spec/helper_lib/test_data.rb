# encoding: utf-8

def load_test_data
  system 'mysql -u ' + DB_CONFIG[:user] + ' -p' + DB_CONFIG[:password] + ' ' + DB_CONFIG[:name] + ' < spec/fixtures/db_dump3.sql'
end

def generate_test_data
  # STDERR.puts 'Remplissage des Cahiers de textes'
  # [ [ 'DS', 'Devoir surveillé' ],
  #   [ 'DM', 'Devoir à la maison' ],
  #   [ 'Leçon', 'Leçon à apprendre' ],
  #   [ 'Exposé', 'Exposé à préparer' ],
  #   [ 'Recherche', 'Recherche à faire' ],
  #   [ 'Exercice', 'Exercice à faire' ] ].each { |type|
  #   TypeDevoir.create(label: type[0],
  #                     description: type[1] )
  #   STDERR.putc '.'
  # }

  CahierDeTextes.all.each do |cahier_de_textes|
    12.times do
      |month|
      rand(2..4).times do
        creneau = CreneauEmploiDuTempsEnseignant.all.sample

        cours = Cours.create(cahier_de_textes_id: cahier_de_textes.id,
                             creneau_emploi_du_temps_id: creneau.creneau_emploi_du_temps_id,
                             date_cours: '2013-' + (month + 1).to_s + '-29',
                             contenu: 'Exemple de séquence pédagogique.',
                             enseignant_id: creneau.enseignant_id )
        STDERR.putc '.'

        if rand > 0.25
          creneau_emploi_du_temps = CreneauEmploiDuTemps
                                    .where(matiere_id: CreneauEmploiDuTemps[ creneau.creneau_emploi_du_temps_id ].matiere_id)
                                    .where(jour_de_la_semaine: Date.tomorrow.wday)
                                    .join(:creneaux_emploi_du_temps_enseignants, creneau_emploi_du_temps_id: :id)
                                    .where(enseignant_id: cours.enseignant_id)
                                    .first                # FIXME: arbitrairement on choisi d'attacher le devoir au premier créneau

          Devoir.create(cours_id: cours.id,
                        type_devoir_id: TypeDevoir.all.sample.id,
                        creneau_emploi_du_temps_id: creneau_emploi_du_temps.id,
                        date_due: Date.tomorrow,
                        contenu: 'Exemple de devoir.',
                        temps_estime: rand(0..120) ) unless creneau_emploi_du_temps.nil?
          STDERR.putc '.'
        else
          next
        end
      end
    end
  end
  STDERR.puts
end