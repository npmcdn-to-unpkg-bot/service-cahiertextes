# -*- coding: utf-8 -*-

module CahierDeTextesAPI
  module V0
    # API d'accès aux devoirs
    # Utilisée par les :
    #   - élèves pour consultation et gestion todo-list
    #   - enseignants pour consultation et édition
    #   - principaux pour consultation
    class DevoirsAPI < Grape::API

      desc 'renvoi tous les devoirs concernant l\'utilisateur durant la période donnée'
      get '/' do
        return [] unless user.methods.include? :classes

        regroupements_ids = user.classes.map {
          |classe|
          classe['classe_id']
        }.uniq

        Devoir
          .join(:creneaux_emploi_du_temps_regroupements, creneau_emploi_du_temps_id: :id)
          .where( regroupement_id: regroupements_ids )
          .map { |devoir|
          hash = devoir.to_hash
          hash[:ressources] = devoir.ressources.map { |rsrc| rsrc.to_hash }
          hash[:fait] = devoir.fait_par?( user.uid )

          hash
        }
      end

      desc 'renvoi le détail d\'un devoir'
      params {
        requires :id
      }
      get '/:id' do
        devoir = Devoir[ params[:id] ]
        if devoir.nil?
          error!( 'Devoir inconnu', 404 )
        else
          hash = devoir.to_hash
          hash[:ressources] = devoir.ressources

          unless user.nil?
            eleve_id = user.uid
            hash[:fait] = devoir.fait_par?( eleve_id )
          end

          hash
        end
      end

      desc 'renseigne un devoir'
      params {
        requires :cours_id
        requires :type_devoir_id
        requires :contenu
        requires :creneau_emploi_du_temps_id
        requires :date_due, type: Date
        optional :ressources
        optional :temps_estime
      }
      post  do
        error!( '401 Unauthorized', 401 ) unless user.is?( 'ENS' )

        if Cours[ params[:cours_id] ].nil? || CreneauEmploiDuTemps[ params[:creneau_emploi_du_temps_id] ].nil?
          # TODO: test concordance entre params[:creneau_emploi_du_temps_id] et params[:date_due]
          error!( 'Paramètres invalides', 404 )
        else
          devoir = Devoir.create(  cours_id: params[:cours_id],
                                   type_devoir_id: params[:type_devoir_id],
                                   creneau_emploi_du_temps_id: params[:creneau_emploi_du_temps_id],
                                   contenu: params[:contenu],
                                   date_due: params[:date_due],
                                   temps_estime: params[:temps_estime],
                                   date_creation: Time.now)

          # 3. traitement des ressources
          params[:ressources] && params[:ressources].each do
            |ressource|
            devoir.add_ressource( Ressource.create(  name: ressource['name'],
                                                     hash: ressource['hash'] ) )
          end

          devoir
        end
      end

      desc 'modifie un devoir'
      params {
        requires :id
        requires :type_devoir_id
        requires :contenu
        requires :creneau_emploi_du_temps_id
        requires :date_due, type: Date
        optional :ressources
        optional :temps_estime
      }
      put '/:id' do
        error!( '401 Unauthorized', 401 ) unless user.is?( 'ENS' )

        devoir = Devoir[ params[:id] ]
        if devoir.nil?
          error!( 'Devoir inconnu', 404 )
        else

          # TODO: test concordance entre params[:creneau_emploi_du_temps_id] et params[:date_due]
          devoir.date_due = params[:date_due] if devoir.date_due != params[:date_due]
          devoir.creneau_emploi_du_temps_id = params[:creneau_emploi_du_temps_id] if devoir.creneau_emploi_du_temps_id != params[:creneau_emploi_du_temps_id]

          devoir.type_devoir_id = params[:type_devoir_id] if devoir.type_devoir_id != params[:type_devoir_id]
          devoir.contenu = params[:contenu] if devoir.contenu != params[:contenu]
          devoir.temps_estime = params[:temps_estime] if devoir.temps_estime != params[:temps_estime]

          params[:ressources].each do
            |ressource|
            devoir.add_ressource( Ressource.create(  name: ressource['name'],
                                                     hash: ressource['hash'] ) )
          end if params[:ressources]

          devoir.date_modification = Time.now
          devoir.save
        end
      end

      desc 'marque un devoir comme fait'
      params {
        requires :id
      }
      put '/:id/fait' do
        error!( '401 Unauthorized', 401 ) unless user.is? 'ELV'

        Devoir[ params[:id] ].fait_par!( user.uid )
      end
    end
  end
end
