import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import PocketBaseClient from '../../services/PocketBaseClient';

describe('PocketBaseClient', () => {
  afterEach(() => {
    PocketBaseClient.reset();
    localStorage.clear();
  });

  describe('getInstance()', () => {
    it('should create singleton instance', () => {
      const instance1 = PocketBaseClient.getInstance();
      const instance2 = PocketBaseClient.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBeDefined();
    });

    it('should return same instance on multiple calls', () => {
      const instances = [
        PocketBaseClient.getInstance(),
        PocketBaseClient.getInstance(),
        PocketBaseClient.getInstance()
      ];
      
      expect(instances[0]).toBe(instances[1]);
      expect(instances[1]).toBe(instances[2]);
    });
  });

  describe('initialize()', () => {
    it('should initialize with default config', () => {
      const instance = PocketBaseClient.initialize({
        url: 'http://localhost:8090'
      });

      expect(instance).toBeDefined();
      expect(instance).toBe(PocketBaseClient.getInstance());
    });

    it('should initialize with custom config', () => {
      const instance = PocketBaseClient.initialize({
        url: 'http://custom:8090',
        authMethod: 'oauth'
      });

      expect(instance).toBeDefined();
    });

    it('should return existing instance if already initialized', () => {
      const instance1 = PocketBaseClient.initialize({
        url: 'http://localhost:8090'
      });
      const instance2 = PocketBaseClient.initialize({
        url: 'http://custom:8090'
      });

      expect(instance1).toBe(instance2);
    });
  });

  describe('reset()', () => {
    it('should reset the singleton instance', () => {
      const instance1 = PocketBaseClient.getInstance();
      PocketBaseClient.reset();
      const instance2 = PocketBaseClient.getInstance();
      
      expect(instance1).not.toBe(instance2);
    });

    it('should allow re-initialization after reset', () => {
      PocketBaseClient.initialize({ url: 'http://first:8090' });
      const instance1 = PocketBaseClient.getInstance();
      
      PocketBaseClient.reset();
      
      PocketBaseClient.initialize({ url: 'http://second:8090' });
      const instance2 = PocketBaseClient.getInstance();
      
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('authStore', () => {
    it('should provide authStore with expected properties', () => {
      const instance = PocketBaseClient.initialize({
        url: 'http://localhost:8090'
      });
      
      expect(instance.authStore).toBeDefined();
      expect(instance.authStore).toHaveProperty('token');
      expect(instance.authStore).toHaveProperty('model');
      expect(instance.authStore).toHaveProperty('isValid');
    });
  });

  // PocketBase SDK natively handles localStorage persistence
  // The authStore automatically loads from localStorage on initialization
  // No need for custom loadFromStore() logic
});
