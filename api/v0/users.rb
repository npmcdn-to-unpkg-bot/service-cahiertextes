# -*- coding: utf-8 -*-

module CahierDeTextesAPI
  module V0
    class UsersAPI < Grape::API

      desc 'renvoi les infos de l\'utilisateur identifié'
      get '/current' do
        utilisateur = env['rack.session'][:current_user]

        extra = Annuaire.get_user( utilisateur[ 'uid' ] )
        utilisateur[ 'classes' ] = extra[ 'classes' ].map { |classe|
          classe[ 'regroupement_id' ] = classe[ 'classe_id' ]

          classe
        }
        utilisateur[ 'profils' ] = extra['profils'].map { |profil|
          {  type: profil['profil_id'],
             uai: profil['etablissement_code_uai'],
             etablissement: profil['etablissement_nom'],
             nom: profil['profil_nom'] }
        }

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
