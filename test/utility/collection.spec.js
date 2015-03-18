var Collections = require('../../src/fejs/utility/collections');

describe('Test Array Contains', function() {
    "use strict";

    var testArray = [0, 1, 5, 9];
    it('contains 0', function() {
        expect(Collections.contains(testArray, 0)).toBe(true);
    });
    it('does not contain 2.', function() {
        expect(Collections.contains(testArray, 2)).toBe(false);
    });
    testArray.splice(1, 1);
    it('does not contain 1 after removal.', function() {
        expect(Collections.contains(testArray, 1)).toBe(false);
    });
});

describe('Test Object Contains', function() {
    "use strict";

    var testObject = {
        "A": 1,
        "B": 2,
        "C": 3
    }
    it('contains value 1', function() {
        expect(Collections.objectContainsValue(testObject, 1)).toBe(true);
    });
    it('does not contain value 4.', function() {
        expect(Collections.objectContainsValue(testObject, 4)).toBe(false);
    });
    it('Contains key A', function() {
        expect(Collections.objectContainsKey(testObject, "A")).toBe(true);
    });
    it('does not contain key D', function() {
        expect(Collections.objectContainsValue(testObject, "D")).toBe(false);
    });
    delete testObject["C"];
    it('does not contain value 3 after delete.', function() {
        expect(Collections.objectContainsValue(testObject, 3)).toBe(false);
    });
    it('does not contain C after delete.', function() {
        expect(Collections.objectContainsValue(testObject, "C")).toBe(false);
    });
});