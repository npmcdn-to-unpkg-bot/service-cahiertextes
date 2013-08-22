# coding: utf-8

Sequel.migration do
  change do
    create_table(:salle) {
      primary_key :id
      String :etablissement
      String :identifiant
      String :nom
    }
  end
end
