# -*- coding: utf-8 -*-

require 'rubygems'
require 'bundler/setup'

require 'grape'
require 'grape-swagger'
require 'nokogiri'
require 'sequel'
require 'sequel/extensions/migration'

require_relative './models/models'
require_relative './lib/pronote'

require_relative './api/pronote'
require_relative './api/etablissement'
require_relative './api/cours'
require_relative './api/devoirs'
require_relative './api/type_de_devoir'
require_relative './api/emploi_du_temps'
require_relative './api/cahier_de_textes'

module CahierDeTextesAPI
  class API < Grape::API
    version 'v0', using: :path, vendor: 'laclasse.com'
    prefix 'api'
    format :json
    rescue_from :all

    helpers do
      def current_user
        # TODO: @current_user ||= User.authorize!(env)
        true
      end

      def authenticate!
        error!('401 Unauthorized', 401) unless current_user
      end
    end

    resource( :pronote )          { mount ::CahierDeTextesAPI::ProNoteAPI }
    resource( :etablissement )    { mount ::CahierDeTextesAPI::EtablissementAPI }
    resource( :cours )            { mount ::CahierDeTextesAPI::CoursAPI }
    resource( :devoirs )           { mount ::CahierDeTextesAPI::DevoirsAPI }
    resource( :types_de_devoir )   { mount ::CahierDeTextesAPI::TypeDeDevoirAPI }
    resource( :emploi_du_temps )  { mount ::CahierDeTextesAPI::EmploiDuTempsAPI }
    resource( :cahier_de_textes ) { mount ::CahierDeTextesAPI::CahierDeTextesAPI }

    add_swagger_documentation
  end
end
