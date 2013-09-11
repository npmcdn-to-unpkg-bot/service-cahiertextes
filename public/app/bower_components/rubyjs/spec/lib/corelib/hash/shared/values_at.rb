describe :hash_values_at, :shared => true do
  it "returns an array of values for the given keys", ->
    h = new_hash(:a => 9, :b => 'a', :c => -10, :d => nil)
    h.send(@method).should be_kind_of(Array)
    h.send(@method).should == []
    h.send(@method, :a, :d, :b).should be_kind_of(Array)
    h.send(@method, :a, :d, :b).should == [9, nil, 'a']
end
