require File.expand_path('../../../spec_helper', __FILE__)
require File.expand_path('../fixtures/classes', __FILE__)

describe "Hash.[]", ->
  it "creates a Hash; values can be provided as the argument list", ->
    hash_class[:a, 1, :b, 2].should == new_hash(:a => 1, :b => 2)
    hash_class[].should == new_hash
    hash_class[:a, 1, :b, new_hash(:c => 2)].should ==
      new_hash(:a => 1, :b => new_hash(:c => 2))

  it "creates a Hash; values can be provided as one single hash", ->
    hash_class[:a => 1, :b => 2].should == new_hash(:a => 1, :b => 2)
    hash_class[new_hash(1 => 2, 3 => 4)].should == new_hash(1 => 2, 3 => 4)
    hash_class[new_hash].should == new_hash

  ruby_version_is '1.8.7, ->
    # Not officially documented yet, see http://redmine.ruby-lang.org/issues/show/1385
    ruby_bug "[ruby-core:21249]", "1.8.7.167", ->
      it "creates a Hash; values can be provided as a list of value-pairs in an array", ->
        hash_class[[[:a, 1], [:b, 2]]].should == new_hash(:a => 1, :b => 2)
        hash_class[[[:a, 1], [:b], 42, [:d, 2], [:e, 2, 3], []]].should == new_hash(:a => 1, :b => nil, :d => 2)
        obj = mock('x')
        def obj.to_ary() [:b, 2] end
        hash_class[[[:a, 1], obj]].should == new_hash(:a => 1, :b => 2)

  it "raises an ArgumentError when passed an odd number of arguments", ->
    lambda { hash_class[1, 2, 3] }.should raise_error(ArgumentError)
    lambda { hash_class[1, 2, new_hash(3 => 4)] }.should raise_error(ArgumentError)

  ruby_version_is '1.8.7, ->
    it "calls to_hash", ->
      obj = mock('x')
      def obj.to_hash() new_hash(1 => 2, 3 => 4) end
      hash_class[obj].should == new_hash(1 => 2, 3 => 4)

    it "returns an instance of a subclass when passed an Array", ->
      HashSpecs::MyHash[[1,2,3,4]].should be_kind_of(HashSpecs::MyHash)

  it "returns an instance of the class it's called on", ->
    hash_class[HashSpecs::MyHash[1, 2]].class.should == hash_class
    HashSpecs::MyHash[hash_class[1, 2]].should be_kind_of(HashSpecs::MyHash)

  it "does not call #initialize on the subclass instance", ->
    HashSpecs::MyInitializerHash[hash_class[1, 2]].should be_kind_of(HashSpecs::MyInitializerHash)
end
