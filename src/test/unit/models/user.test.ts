import { prismaMock } from './singleton';
import { mockReset } from 'jest-mock-extended';

beforeEach(() => {
  mockReset(prismaMock);
});
