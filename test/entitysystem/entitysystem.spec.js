var Collections = require('../../src/fejs/utility/collections');
var EntitySet = require('../../src/fejs/entitysystem/entityset');
var Entity = require('../../src/fejs/entitysystem/entity');
var EntitySystem = require('../../src/fejs/entitysystem/entitysystem');

describe('Entity Set Tests', function() {
    "use strict";

    // Test for entity set functionality.
    var entitySet = new EntitySet();
    // Check for duplicates.
    var ent0;
    it('only a single entity was added from duplicates.', function() {
        ent0 = new Entity(0);
        entitySet.add(ent0);
        entitySet.add(ent0);
        expect(entitySet.size()).toBe(1);
    });
    // Check for adding and removal.
    it('new unique entity added.', function() {
        entitySet.add(new Entity(1));
        expect(entitySet.size()).toBe(2);
    });
    it('removed entity not within set does nothing.', function() {
        entitySet.remove(new Entity(0));
        expect(entitySet.size()).toBe(2);
    });
    it('removed entity.', function() {
        entitySet.remove(ent0);
        expect(entitySet.size()).toBe(1);
    });
    // Check for change set list.
    var count = 0;
    it('check for added entities (re-added entities should not be counted twice).', function() {
        entitySet.add(ent0);
        var count = 0;
        entitySet.eachAdded(function (ent) {
            count++;
        });
        expect(count).toBe(2);
    });
    it('check for removed entities (removed then added entities should not be removed).', function() {
        count = 0;
        entitySet.eachRemoved(function (ent) {
            count++;
        });
        expect(count).toBe(0);
    });
    it('check for changed entities (removed entities should not be counted).', function() {
        entitySet.change(ent0);
        count = 0;
        entitySet.eachChanged(function (ent) {
            count++;
        });
        expect(count).toBe(1);
    });
    it('check for removed entities.', function() {
        entitySet.remove(ent0);
        count = 0;
        entitySet.eachRemoved(function (ent) {
            count++;
        });
        expect(count).toBe(1);
    });
    it('check for changed entities.', function() {
        count = 0;
        entitySet.eachChanged(function (ent) {
            count++;
        });
        expect(count).toBe(0);
    });
});

describe("Entity System Tests", function() {
    "use strict";

    var TEST = {};
    TEST.Component1 = function() {};
    TEST.Component1.type = "Component 1";
    TEST.Component2 = function() {};
    TEST.Component2.type = "Component   2";
    TEST.Component3 = function() {};
    TEST.Component3.type = "Component3";

    var entitySystem = new EntitySystem();
    entitySystem.useUUID = false;
    entitySystem.isLazySets = false;
    // Test entity adding.
    var ent0;
    var ent1;

    it('entity ID should be incremented and different each time.', function() {
        // ID should start at 0.
        ent0 = entitySystem.createEntity();
        ent0.name = "ent";
        expect(ent0.getID()).toBe(0);

        // ID should be incremented.
        ent1 = entitySystem.createEntity();
        expect(ent1.getID()).toBe(1);
        // Should not be the same entity.
        expect(ent0 === ent1).toBe(false);
        // Has entity 0.
        expect(entitySystem.hasEntity(ent0)).toBe(true);
        // Does not have entity created outside the system.
        expect(entitySystem.hasEntity(new Entity(0))).toBe(false);
        // Test entity retrieval.
        // Found entity 0 by ID.
        expect(entitySystem.getEntityByID(0)).toBe(ent0);
        // Found entity 0 by name.
        expect(entitySystem.getEntityByName("ent")).toBe(ent0);
    });

    // Test component adding.
    it('testing component editing', function() {
        // Add the components.
        entitySystem.setComponent(ent0, TEST.Component1.type, new TEST.Component1());
        entitySystem.setComponent(ent0, TEST.Component2.type, new TEST.Component2());
        entitySystem.setComponent(ent0, TEST.Component3.type, new TEST.Component3());

        entitySystem.setComponent(ent1, TEST.Component2.type, new TEST.Component2());
        entitySystem.setComponent(ent1, TEST.Component3.type, new TEST.Component3());

        // Ent0 has Component1.
        expect(entitySystem.hasComponent(ent0, TEST.Component1.type)).toBe(true);
        // Ent0 has Component2.
        expect(entitySystem.hasComponent(ent0, TEST.Component2.type)).toBe(true);
        // Ent0 has Component3.
        expect(entitySystem.hasComponent(ent0, TEST.Component3.type)).toBe(true);
        // Ent1 does not have Component1.
        expect(entitySystem.hasComponent(ent1, TEST.Component1.type)).toBe(false);
        // Ent1 has Component2.
        expect(entitySystem.hasComponent(ent1, TEST.Component2.type)).toBe(true);
        // Ent1 has Component3.
        expect(entitySystem.hasComponent(ent1, TEST.Component3.type)).toBe(true);
        // Test removal (make sure components are still available before flush).
        entitySystem.removeComponent(ent1, TEST.Component3.type);
        // Ent1 does not have Component3.
        expect(entitySystem.hasComponent(ent1, TEST.Component3.type)).toBe(false);
        // Ent1 has Component3 information.
        expect(entitySystem.getComponent(ent1, TEST.Component3.type)).toBeDefined();
        // Ent1 has no Component1 get.
        expect(entitySystem.getComponent(ent1, TEST.Component1.type)).toBeFalsy();
    });

    it('test sets', function() {
        // Test sets.
        var testSetCount = function(func) {
            var count = 0;
            func(function(e) {
                count++;
            });
            return count;
        };
        var entitySet = entitySystem.getEntities(TEST.Component1.type);
        // Set Component1 has one entity.
        expect(entitySet.size()).toBe(1);
        // Set Component2 has two entities.
        entitySet = entitySystem.getEntities(TEST.Component2.type);
        expect(entitySet.size()).toBe(2);
        // Set Component3 has one entity (Ent1 removed).
        entitySet = entitySystem.getEntities(TEST.Component3.type);
        expect(entitySet.size()).toBe(1);
        // Test set adds.
        // One added entity for Component1.
        expect(testSetCount(entitySet.eachAdded)).toBe(1);
        // Two added entities for Component2.
        entitySet = entitySystem.getEntities(TEST.Component2.type);
        expect(testSetCount(entitySet.eachAdded)).toBe(2);
        // One added entity for Component3 (removal of Ent1).
        entitySet = entitySystem.getEntities(TEST.Component3.type);
        expect(testSetCount(entitySet.eachAdded)).toBe(1);
        // Test set changes.
        // One changed entity for Component1.
        entitySystem.setComponent(ent0, TEST.Component1.type, new TEST.Component1());
        entitySet = entitySystem.getEntities(TEST.Component1.type);
        expect(testSetCount(entitySet.eachChanged)).toBe(1);
        // No changed entity for Component2.
        entitySet = entitySystem.getEntities(TEST.Component2.type);
        expect(testSetCount(entitySet.eachChanged)).toBe(0);
        // No changed entity for Component3.
        entitySet = entitySystem.getEntities(TEST.Component3.type);
        expect(testSetCount(entitySet.eachChanged)).toBe(0);
        // Test removals.
        // No removed for entity for Component1.
        entitySet = entitySystem.getEntities(TEST.Component1.type);
        expect(testSetCount(entitySet.eachRemoved)).toBe(0);
        // No removed for entity for Component2.
        entitySet = entitySystem.getEntities(TEST.Component2.type);
        expect(testSetCount(entitySet.eachRemoved)).toBe(0);
        // No removed for entity for Component3 - will be 0 if lazy.
        entitySet = entitySystem.getEntities(TEST.Component3.type);
        expect(testSetCount(entitySet.eachRemoved)).toBe(1);
        // One removed entity for Component3.
        entitySystem.setComponent(ent1, TEST.Component3.type, new TEST.Component3());
        entitySystem.removeComponent(ent1, TEST.Component3.type);
        expect(testSetCount(entitySet.eachRemoved)).toBe(1);

        // Test for entity removals.
        // Does not have removed entity.
        entitySystem.removeEntity(ent0);
        expect(entitySystem.hasEntity(ent0)).toBe(false);
        // One removed entity for Component1.
        entitySet = entitySystem.getEntities(TEST.Component1.type);
        expect(testSetCount(entitySet.eachRemoved)).toBe(1);
        // No added entity for Component1.
        entitySet = entitySystem.getEntities(TEST.Component1.type);
        expect(testSetCount(entitySet.eachAdded)).toBe(0);
    });
});