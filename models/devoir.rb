# -*- coding: utf-8 -*-

require_relative './ToDeepHashMixin'

class Devoir < Sequel::Model( :devoirs )
  include ToDeepHashMixin

  many_to_many :ressources
  many_to_one :creneau_emploi_du_temps
  many_to_one :type_devoir
  one_to_many :devoir_todo_items
  many_to_one :cours

  def fait_par!( eleve_id )
    add_devoir_todo_item( eleve_id: eleve_id, date_fait: Time.now )
  end

  def fait_par?( eleve_id )
    # FIXME: peut sûrement mieux faire
    devoir_todo_items_dataset.where(eleve_id: eleve_id).count > 0
  end

  def a_faire_par!( eleve_id )
    # FIXME: peut sûrement mieux faire
    devoir_todo_items_dataset.where(eleve_id: eleve_id).destroy
  end
end

class TypeDevoir < Sequel::Model( :types_devoir )
  one_to_many :devoirs
end

class DevoirRessource < Sequel::Model( :devoirs_ressources )

end

class DevoirTodoItem < Sequel::Model( :devoir_todo_items )
  many_to_one :devoir
end
