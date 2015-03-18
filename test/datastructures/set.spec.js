var FESet = require('../../src/fejs/datastructures/set');

describe('Entity Set Tests', function() {
    "use strict";

    // Test for set functionality.
    var testSet = new FESet();

    it('Only a single object was added from duplicates.', function() {
        testSet.add(1);
        testSet.add(1);
        testSet.add(1);
        expect(testSet.size()).toBe(1);
    });
    it('Another object added to the set.', function() {
        testSet.add(2);
        expect(testSet.size()).toBe(2);
    });
    it('Set contains 1.', function() {
        expect(testSet.contains(1)).toBe(true);
    });
    it('Set contains 2.', function() {
        expect(testSet.contains(2)).toBe(true);
    });
    it('Set does not contain 3.', function() {
        expect(testSet.contains(3)).toBe(false);
    });
    it('Set no longer contains 1.', function() {
        testSet.remove(1);
        expect(testSet.contains(1)).toBe(false);
    });
    it('Each test: Sum of all numbers in the set equals 5 after adding 3 to the set.', function() {
        testSet.add(3);
        var sum = 0;
        testSet.each(function(num) {
            sum += num;
        });
        expect(sum).toBe(5);
    });
    it('After clear nothing should remain in the set.', function() {
        testSet.clear();
        expect(testSet.size()).toBe(0);
    });
});