# -*- coding: utf-8 -*-

module CahierDeTextesAPI
   module V0
      class UsersAPI < Grape::API

         desc 'renvoi les infos de l\'utilisateur identifié'
         get '/current' do
            utilisateur = env['rack.session'][:current_user]

            utilisateur[ 'extra' ] = Annuaire.get_user( utilisateur[ 'uid' ] )
            utilisateur[ 'classes' ] = utilisateur[ 'extra' ][ 'classes' ].map { |classe|
               classe[ 'regroupement_id' ] = classe[ 'classe_id' ]

               classe
            }

            # FIXME: DEBUG
            if utilisateur['uid'] == 'VAA62559'
               utilisateur[ 'classes' ] = []
               utilisateur['extra']['profils'] = [ { 'etablissement_code_uai' => '0699999Z',
                                                       'etablissement_id' => 1,
                                                       'etablissement_nom' => 'ERASME',
                                                       'profil_id' => 'DIR',
                                                       'profil_nom' => 'Personel de direction de l\'etablissement' },
                                                     { 'etablissement_code_uai' => '0699999Z',
                                                         'etablissement_id' => 1,
                                                         'etablissement_nom' => 'ERASME',
                                                         'profil_id' => 'ENS',
                                                         'profil_nom' => 'Enseignant' },
                                                     { 'etablissement_code_uai' => '0699999Z',
                                                         'etablissement_id' => 1,
                                                         'etablissement_nom' => 'ERASME',
                                                         'profil_id' => 'ELV',
                                                         'profil_nom' => 'Élève' } ]
            end

            utilisateur
         end

         desc 'efface toute trace de l\'utilisateur identifié'
         delete '/:id' do
            # TODO
            STDERR.puts "Deleteing all traces of #{params[:id]}"
         end

         desc 'Merge les données de l\'utilisateur source_id vers l\'utilisateur target_id'
         put '/:target_id/merge/:source_id' do
            # TODO
            STDERR.puts "Merging all data of #{params[:source_id]} into #{params[:target_id]}"
         end

      end
   end
end