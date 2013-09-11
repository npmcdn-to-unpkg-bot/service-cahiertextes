describe :keep_if, :shared => true do
  it "deletes elements for which the block returns a false value", ->
    array = [1, 2, 3, 4, 5]
    array.send(@method) {|item| item > 3 }.should equal(array)
    array.should == [4, 5]

  it "returns an enumerator if no block is given", ->
    [1, 2, 3].send(@method).should be_an_instance_of(enumerator_class)
end
