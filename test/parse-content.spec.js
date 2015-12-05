import {TemplatingBindingLanguage} from '../src/binding-language';
import {InterpolationBindingExpression} from '../src/interpolation-binding-expression';
import * as LogManager from 'aurelia-logging';
import {initialize} from 'aurelia-pal-browser';

var logger = LogManager.getLogger('templating-binding');

describe('TemplatingBindingLanguage', () => {
  beforeAll(() => initialize());

  describe('parseContent', () => {
    var language, resources;
    beforeAll(() => {
      var parser = { parse: expression => '!' + expression },
          observerLocator = { getObserver: () => null, getAccessor: () => null },
          syntaxInterpreter = {};
      language = new TemplatingBindingLanguage(parser, observerLocator, syntaxInterpreter);
      resources = { lookupFunctions: { valueConverters: name => null, bindingBehaviors: name => null } };
    });

    it('parses interpolation expressions', () => {
      var i, ii, aggregate, test, tests = [
        { attrValue: '${name}', parts: ['', '!name', ''] },
        { attrValue: '${\'foo\\\'\'}', parts: ['', '!\'foo\\\'\'', ''] },
        { attrValue: '${name}', parts: ['', '!name', ''] },
        { attrValue: '${\'name\'}', parts: ['', '!\'name\'', ''] },
        { attrValue: '${\'name\\\'\'}', parts: ['', '!\'name\\\'\'', ''] },
        { attrValue: '${"name"}', parts: ['', '!"name"', ''] },
        { attrValue: '${"name\\\""}', parts: ['', '!"name\\\""', ''] },
        { attrValue: '\\${name}', parts: ['${name}', '!\'\'', ''] },
        { attrValue: '\\\\${"name"}', parts: ['\\\\', '!"name"', ''] },
        { attrValue: 'foo${name}baz', parts: ['foo', '!name', 'baz'] },
        { attrValue: ' ${name} ', parts: [' ', '!name', ' '] },
        { attrValue: '\'${name}\'', parts: ['\'', '!name', '\''] },
        { attrValue: '"${name}"', parts: ['"', '!name', '"'] },
        { attrValue: 'foo bar baz', parts: null },
        { attrValue: '${foo.bar.baz}', parts: ['', '!foo.bar.baz', ''] },
        { attrValue: '${ name }', parts: ['', '! name ', ''] },
        { attrValue: '${name | foo}', parts: ['', '!name | foo', ''] },
        { attrValue: '${name | foo:bar}', parts: ['', '!name | foo:bar', ''] },
        { attrValue: '${name|test:{}}', parts: ['', '!name|test:{}', ''] },
        { attrValue: '${name|test:\'{}\'}', parts: ['', '!name|test:\'{}\'', ''] },
        { attrValue: '${name | test: { foo: 4, bar, 9 } }', parts: ['', '!name | test: { foo: 4, bar, 9 } ', ''] },
        { attrValue: 'foo ${name | test: { foo: 4, bar, 9 } } bar', parts: ['foo ', '!name | test: { foo: 4, bar, 9 } ', ' bar'] },
        { attrValue: '${firstName}${lastName}', parts: ['', '!firstName', '', '!lastName', ''] },
        { attrValue: ' ${firstName} ${lastName} ', parts: [' ', '!firstName', ' ', '!lastName', ' '] },
        { attrValue: '\\ ${foo}\\', parts: ['\\ ', '!foo', '\\'] },
      ];

      aggregate = { attrValue: '', parts: [''] };

      for (i = 0, ii = tests.length; i < ii; i++) {
        test = tests[i];
        if (test.parts) {
          expect(language.parseContent(resources, 'textContent', test.attrValue).parts).toEqual(test.parts);
          aggregate.attrValue += test.attrValue;
          aggregate.parts[aggregate.parts.length - 1] += test.parts[0];
          aggregate.parts = aggregate.parts.concat(test.parts.slice(1));
        } else {
          expect(language.parseContent(resources, 'textContent', test.attrValue)).toBe(null);
          aggregate.attrValue += test.attrValue;
          aggregate.parts[aggregate.parts.length - 1] += test.attrValue;
        }
        expect(language.parseContent(resources, 'textContent', aggregate.attrValue).parts).toEqual(aggregate.parts);
      }
    });

    it('warns on interpolation in style attribute', () => {
      var expression = language.parseContent(resources, 'style', "${name}"),
          binding;
      spyOn(logger, 'info').and.callThrough();
      binding = expression.createBinding(document.createElement('div'));
      expect(logger.info).toHaveBeenCalled();
    });
  });
});
