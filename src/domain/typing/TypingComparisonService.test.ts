import { describe, it, expect, beforeEach } from 'vitest';
import { TypingComparisonService } from './TypingComparisonService';
import { LenientMatchStrategy } from './LenientMatchStrategy';
import { StrictMatchStrategy } from './StrictMatchStrategy';
import { FuzzyMatchStrategy } from './FuzzyMatchStrategy';

describe('TypingComparisonService', () => {
    let service: TypingComparisonService;

    beforeEach(() => {
        service = new TypingComparisonService();
    });

    describe('compare', () => {
        describe('with LenientMatchStrategy', () => {
            const strategy = new LenientMatchStrategy();

            it('should return match when input matches target (case-insensitive)', () => {
                const result = service.compare('Hello World', 'hello world', strategy);
                
                expect(result.input).toBe('Hello World');
                expect(result.target).toBe('hello world');
                expect(result.isMatch).toBe(true);
                expect(result.strategyName).toBe('lenient');
            });

            it('should return match when input matches with extra whitespace', () => {
                const result = service.compare('  Hello  ', 'Hello', strategy);
                
                expect(result.isMatch).toBe(true);
            });

            it('should return no match when input differs from target', () => {
                const result = service.compare('Goodbye', 'Hello', strategy);
                
                expect(result.isMatch).toBe(false);
            });
        });

        describe('with StrictMatchStrategy', () => {
            const strategy = new StrictMatchStrategy();

            it('should return match only on exact match', () => {
                const result = service.compare('Hello', 'Hello', strategy);
                
                expect(result.isMatch).toBe(true);
                expect(result.strategyName).toBe('strict');
            });

            it('should return no match for different case', () => {
                const result = service.compare('Hello', 'hello', strategy);
                
                expect(result.isMatch).toBe(false);
            });

            it('should return no match for different whitespace', () => {
                const result = service.compare('Hello ', 'Hello', strategy);
                
                expect(result.isMatch).toBe(false);
            });
        });

        describe('with FuzzyMatchStrategy', () => {
            const strategy = new FuzzyMatchStrategy(2); // Allow 2 typos

            it('should return match for exact match', () => {
                const result = service.compare('Hello', 'Hello', strategy);
                
                expect(result.isMatch).toBe(true);
                expect(result.strategyName).toBe('fuzzy');
            });

            it('should return match for input with minor typos', () => {
                const result = service.compare('Helo', 'Hello', strategy); // 1 char missing
                
                expect(result.isMatch).toBe(true);
            });

            it('should return no match when typos exceed threshold', () => {
                const result = service.compare('Ho', 'Hello', strategy); // 3 edit distance (delete l, l, e)
                
                expect(result.isMatch).toBe(false);
            });

            it('should handle transposition typos', () => {
                const result = service.compare('Hlelo', 'Hello', strategy); // transposed 'le'
                
                expect(result.isMatch).toBe(true); // Levenshtein distance = 2
            });
        });

        describe('edge cases', () => {
            const strategy = new LenientMatchStrategy();

            it('should handle empty strings', () => {
                const result = service.compare('', '', strategy);
                
                expect(result.isMatch).toBe(true);
                expect(result.input).toBe('');
                expect(result.target).toBe('');
            });

            it('should handle whitespace-only strings', () => {
                const result = service.compare('   ', '', strategy);
                
                expect(result.isMatch).toBe(true); // Lenient trims both
            });

            it('should handle very long strings', () => {
                const longText = 'a'.repeat(10000);
                const result = service.compare(longText, longText, strategy);
                
                expect(result.isMatch).toBe(true);
            });

            it('should handle special characters', () => {
                const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
                const result = service.compare(specialChars, specialChars, strategy);
                
                expect(result.isMatch).toBe(true);
            });

            it('should handle unicode characters', () => {
                const unicode = '你好世界 🌍';
                const result = service.compare(unicode, unicode, strategy);
                
                expect(result.isMatch).toBe(true);
            });

            it('should handle newlines and tabs', () => {
                const multiline = 'Hello\nWorld\tTest';
                const result = service.compare(multiline, multiline, strategy);
                
                expect(result.isMatch).toBe(true);
            });
        });

        describe('strategy switching', () => {
            const input = 'Hello';
            const target = 'hello';

            it('should use different strategies on same input/target', () => {
                const lenientResult = service.compare(input, target, new LenientMatchStrategy());
                const strictResult = service.compare(input, target, new StrictMatchStrategy());
                
                expect(lenientResult.isMatch).toBe(true);
                expect(strictResult.isMatch).toBe(false);
            });

            it('should record correct strategy name in result', () => {
                const strategies = [
                    new LenientMatchStrategy(),
                    new StrictMatchStrategy(),
                    new FuzzyMatchStrategy()
                ];

                const results = strategies.map(s => service.compare(input, target, s));
                
                expect(results[0].strategyName).toBe('lenient');
                expect(results[1].strategyName).toBe('strict');
                expect(results[2].strategyName).toBe('fuzzy');
            });
        });
    });

    describe('compareBatch', () => {
        const strategy = new LenientMatchStrategy();

        it('should compare multiple input-target pairs', () => {
            const pairs = [
                { input: 'Hello', target: 'hello' },
                { input: 'World', target: 'world' },
                { input: 'Test', target: 'test' }
            ];

            const results = service.compareBatch(pairs, strategy);

            expect(results).toHaveLength(3);
            expect(results.every(r => r.isMatch)).toBe(true);
        });

        it('should maintain order of results', () => {
            const pairs = [
                { input: 'First', target: 'first' },
                { input: 'Wrong', target: 'second' },
                { input: 'Third', target: 'third' }
            ];

            const results = service.compareBatch(pairs, strategy);

            expect(results[0].input).toBe('First');
            expect(results[0].isMatch).toBe(true);
            expect(results[1].input).toBe('Wrong');
            expect(results[1].isMatch).toBe(false);
            expect(results[2].input).toBe('Third');
            expect(results[2].isMatch).toBe(true);
        });

        it('should handle empty batch', () => {
            const results = service.compareBatch([], strategy);

            expect(results).toHaveLength(0);
        });

        it('should handle single pair', () => {
            const pairs = [{ input: 'Hello', target: 'hello' }];
            const results = service.compareBatch(pairs, strategy);

            expect(results).toHaveLength(1);
            expect(results[0].isMatch).toBe(true);
        });

        it('should apply same strategy to all pairs', () => {
            const pairs = [
                { input: 'Hello', target: 'hello' },
                { input: 'World', target: 'world' }
            ];

            const results = service.compareBatch(pairs, new StrictMatchStrategy());

            expect(results.every(r => !r.isMatch)).toBe(true); // All fail with strict
            expect(results.every(r => r.strategyName === 'strict')).toBe(true);
        });

        it('should handle large batches efficiently', () => {
            const pairs = Array.from({ length: 1000 }, (_, i) => ({
                input: `text${i}`,
                target: `text${i}`
            }));

            const startTime = performance.now();
            const results = service.compareBatch(pairs, strategy);
            const endTime = performance.now();

            expect(results).toHaveLength(1000);
            expect(results.every(r => r.isMatch)).toBe(true);
            expect(endTime - startTime).toBeLessThan(100); // Should be fast
        });
    });

    describe('service instantiation', () => {
        it('should create independent service instances', () => {
            const service1 = new TypingComparisonService();
            const service2 = new TypingComparisonService();

            expect(service1).not.toBe(service2);
        });

        it('should be stateless (no side effects between calls)', () => {
            const strategy = new LenientMatchStrategy();
            
            const result1 = service.compare('Hello', 'hello', strategy);
            const result2 = service.compare('World', 'world', strategy);

            // Results should be independent
            expect(result1.input).toBe('Hello');
            expect(result2.input).toBe('World');
            expect(result1).not.toBe(result2);
        });
    });

    describe('performance characteristics', () => {
        const strategy = new LenientMatchStrategy();

        it('should handle rapid successive comparisons', () => {
            const iterations = 10000;
            const startTime = performance.now();

            for (let i = 0; i < iterations; i++) {
                service.compare('test', 'test', strategy);
            }

            const endTime = performance.now();
            const avgTime = (endTime - startTime) / iterations;

            expect(avgTime).toBeLessThan(0.1); // < 0.1ms per comparison
        });

        it('should scale linearly with input length', () => {
            const shortText = 'test';
            const longText = 'test'.repeat(1000);

            const shortStart = performance.now();
            service.compare(shortText, shortText, strategy);
            const shortTime = performance.now() - shortStart;

            const longStart = performance.now();
            service.compare(longText, longText, strategy);
            const longTime = performance.now() - longStart;

            // Long text should take proportionally longer, but not exponentially
            expect(longTime / shortTime).toBeLessThan(1000); // Not 1000x slower
        });
    });
});

