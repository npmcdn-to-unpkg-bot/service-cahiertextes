# -*- coding: utf-8 -*-

module CahierDeTextesAPI
  class EnseignantAPI < Grape::API
    format :json

    resource :enseignant do

      resource :emploi_du_temps do

        desc 'contenu combiné des cahiers de textes concernant l\'élève durant l\'intervalle de dates données ou par défaut le jour courant'
        params {
          optional :debut, type: Time
          optional :fin, type: Time
        }
        get do
          # TODO
        end

      end

      resource :cahier_de_textes do

        desc 'contenu combiné des cahiers de textes concernant l\'enseignant durant l\'intervalle de dates données ou par défaut le jour courant'
        params {
          optional :debut, type: Time
          optional :fin, type: Time
        }
        get do
          # TODO: get this from actual (Enseignant) user
          regroupements_ids = [ 1, 2, 3, 4, 5, 12 ]

          regroupements_ids.map {
            |regroupement_id|
            CahierDeTextes[ regroupement_id: regroupement_id ].content( params[:debut] ? params[:debut] : Time.now,
                                                                        params[:fin] ? params[:fin] : Time.now )
          }.to_json
        end

      end

      resource :cours do

        desc 'renseigne une séquence pédagogique'
        params {
          requires :cahier_de_textes_id
          requires :creneau_emploi_du_temps_id
          requires :date_cours, type: Date
          requires :contenu
          optional :ressources
        }
        post do
          # TODO: gestion des droits
          Cours.create( cahier_de_textes_id: params[:cahier_de_textes_id],
                        creneau_emploi_du_temps_id: params[:creneau_emploi_du_temps_id],
                        date_cours: params[:date_cours].to_s,
                        date_creation: Time.now,
                        contenu: params[:contenu] )
          # TODO: loop sur params[:ressources]
        end

        desc 'renvoi une séquence pédagogique'
        get '/:id' do
          # FIXME: gestion des droits
          if Cours[ params[:id] ].nil? || Cours[ params[:id] ].deleted
            error!( 'Cours inconnu', 404 )
          else
            Cours[ params[:id] ]
          end
        end

        desc 'modifie une séquence pédagogique'
        params {
          requires :id
          requires :contenu
          optional :ressources
        }
        put '/:id' do
          # FIXME: gestion des droits
          cours = Cours[ params[:id] ]

          if cours
            cours.contenu = params[:contenu]
            cours.date_modification = Time.now
            # TODO: loop sur params[:ressources]

            cours.save
          end
        end

        desc 'efface une séquence pédagogique'
        params {
          requires :id
        }
        delete '/:id' do
          # FIXME: gestion des droits
          cours = Cours[ params[:id] ]
          if cours
            cours.update(deleted: true)
            cours.date_modification = Time.now

            cours.save
          end
        end

      end

    end

  end
end
