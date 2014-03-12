# -*- coding: utf-8 -*-

module CahierDeTextesAPI
   module V0
      class EtablissementsAPI < Grape::API
         format :json

         desc 'statistiques des cahiers de textes par classes/mois/matières'
         params {
            requires :uai, desc: 'Code UAI de l\'établissement'
         }
         get '/:uai/classes' do
            Etablissement.where(uai: params[:uai]).first.statistiques_classes
         end

         desc 'statistiques du cahier de textes d\'une classe'
         params {
            requires :uai, desc: 'Code UAI de l\'établissement'
            requires :classe_id, desc: 'identifiant annuaire de la classe'
         }
         get '/:uai/classes/:classe_id' do
            cahier_de_textes = CahierDeTextes[ regroupement_id: params[:classe_id] ]

            error!( 'Classe inconnue', 404 ) if cahier_de_textes.nil?

            cahier_de_textes.statistiques
         end

         desc 'statistiques des cahiers de textes par enseignants/mois'
         params {
            requires :uai, desc: 'Code UAI de l\'établissement'
         }
         get '/:uai/enseignants' do
            Etablissement.where(UAI: params[:uai]).first.statistiques_enseignants
         end

         desc 'saisies détaillées d\'un enseignant dans les cahiers de textes par mois/classes'
         params {
            requires :uai, desc: 'Code UAI de l\'établissement'
            requires :enseignant_id, desc: 'identifiant annuaire de l\'enseignant'
         }
         get '/:uai/enseignants/:enseignant_id' do
            Etablissement.where(uai: params[:uai]).first.saisies_enseignant( params[:enseignant_id] )
         end

      end
   end
end