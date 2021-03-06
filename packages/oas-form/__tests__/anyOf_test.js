import React from 'react';
import { Simulate } from 'react-dom/test-utils';
import { createFormComponent, setProps } from './test_utils';

describe('anyOf', () => {
  it('should not render a select element if the anyOf keyword is not present', () => {
    const schema = {
      type: 'object',
      properties: {
        foo: { type: 'string' },
      },
    };

    const { node } = createFormComponent({
      schema,
    });

    expect(node.querySelectorAll('select')).toHaveLength(0);
  });

  it('should render a select element if the anyOf keyword is present', () => {
    const schema = {
      type: 'object',
      anyOf: [
        {
          properties: {
            foo: { type: 'string' },
          },
        },
        {
          properties: {
            bar: { type: 'string' },
          },
        },
      ],
    };

    const { node } = createFormComponent({
      schema,
    });

    expect(node.querySelectorAll('select')).toHaveLength(1);
    expect(node.querySelector('select').id).toBe('root__anyof_select');
  });

  it('should assign a default value and set defaults on option change', () => {
    const { node, onChange } = createFormComponent({
      schema: {
        anyOf: [
          {
            type: 'object',
            properties: {
              foo: { type: 'string', default: 'defaultfoo' },
            },
          },
          {
            type: 'object',
            properties: {
              foo: { type: 'string', default: 'defaultbar' },
            },
          },
        ],
      },
    });
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        formData: { foo: 'defaultfoo' },
      })
    );

    const $select = node.querySelector('select');

    Simulate.change($select, {
      target: { value: $select.options[1].value },
    });

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        formData: { foo: 'defaultbar' },
      })
    );
  });

  it("should assign a default value and set defaults on option change with 'type': 'object' missing", () => {
    const { node, onChange } = createFormComponent({
      schema: {
        type: 'object',
        anyOf: [
          {
            properties: {
              foo: { type: 'string', default: 'defaultfoo' },
            },
          },
          {
            properties: {
              foo: { type: 'string', default: 'defaultbar' },
            },
          },
        ],
      },
    });

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        formData: { foo: 'defaultfoo' },
      })
    );

    const $select = node.querySelector('select');

    Simulate.change($select, {
      target: { value: $select.options[1].value },
    });

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        formData: { foo: 'defaultbar' },
      })
    );
  });

  it('should render a custom widget', () => {
    const schema = {
      type: 'object',
      anyOf: [
        {
          properties: {
            foo: { type: 'string' },
          },
        },
        {
          properties: {
            bar: { type: 'string' },
          },
        },
      ],
    };
    const widgets = {
      SelectWidget: () => {
        return <section id="CustomSelect">Custom Widget</section>;
      },
    };

    const { node } = createFormComponent({
      schema,
      widgets,
    });

    expect(node.querySelector('#CustomSelect')).not.toBeNull();
  });

  it('should change the rendered form when the select value is changed', () => {
    const schema = {
      type: 'object',
      anyOf: [
        {
          properties: {
            foo: { type: 'string' },
          },
        },
        {
          properties: {
            bar: { type: 'string' },
          },
        },
      ],
    };

    const { node } = createFormComponent({
      schema,
    });

    expect(node.querySelectorAll('#root_foo')).toHaveLength(1);
    expect(node.querySelectorAll('#root_bar')).toHaveLength(0);

    const $select = node.querySelector('select');

    Simulate.change($select, {
      target: { value: $select.options[1].value },
    });

    expect(node.querySelectorAll('#root_foo')).toHaveLength(0);
    expect(node.querySelectorAll('#root_bar')).toHaveLength(1);
  });

  it('should handle change events', () => {
    const schema = {
      type: 'object',
      anyOf: [
        {
          properties: {
            foo: { type: 'string' },
          },
        },
        {
          properties: {
            bar: { type: 'string' },
          },
        },
      ],
    };

    const { node, onChange } = createFormComponent({
      schema,
    });

    Simulate.change(node.querySelector('input#root_foo'), {
      target: { value: 'Lorem ipsum dolor sit amet' },
    });

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        formData: { foo: 'Lorem ipsum dolor sit amet' },
      })
    );
  });

  it('should clear previous data when changing options', () => {
    const schema = {
      type: 'object',
      properties: {
        buzz: { type: 'string' },
      },
      anyOf: [
        {
          properties: {
            foo: { type: 'string' },
          },
        },
        {
          properties: {
            bar: { type: 'string' },
          },
        },
      ],
    };

    const { node, onChange } = createFormComponent({
      schema,
    });

    Simulate.change(node.querySelector('input#root_buzz'), {
      target: { value: 'Lorem ipsum dolor sit amet' },
    });

    Simulate.change(node.querySelector('input#root_foo'), {
      target: { value: 'Consectetur adipiscing elit' },
    });

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        formData: {
          buzz: 'Lorem ipsum dolor sit amet',
          foo: 'Consectetur adipiscing elit',
        },
      })
    );

    const $select = node.querySelector('select');

    Simulate.change($select, {
      target: { value: $select.options[1].value },
    });

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        formData: {
          buzz: 'Lorem ipsum dolor sit amet',
          foo: undefined,
        },
      })
    );
  });

  it('should support options with different types', () => {
    const schema = {
      type: 'object',
      properties: {
        userId: {
          anyOf: [
            {
              type: 'number',
            },
            {
              type: 'string',
            },
          ],
        },
      },
    };

    const { node, onChange } = createFormComponent({
      schema,
    });

    Simulate.change(node.querySelector('input#root_userId'), {
      target: { value: 12345 },
    });

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        formData: { userId: 12345 },
      })
    );

    const $select = node.querySelector('select');

    Simulate.change($select, {
      target: { value: $select.options[1].value },
    });

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        formData: { userId: undefined },
      })
    );

    Simulate.change(node.querySelector('input#root_userId'), {
      target: { value: 'Lorem ipsum dolor sit amet' },
    });

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        formData: { userId: 'Lorem ipsum dolor sit amet' },
      })
    );
  });

  it('should support custom fields', () => {
    const schema = {
      type: 'object',
      properties: {
        userId: {
          anyOf: [
            {
              type: 'number',
            },
            {
              type: 'string',
            },
          ],
        },
      },
    };

    const CustomField = () => {
      return <div id="custom-anyof-field" />;
    };

    const { node } = createFormComponent({
      schema,
      fields: {
        AnyOfField: CustomField,
      },
    });

    expect(node.querySelectorAll('#custom-anyof-field')).toHaveLength(1);
  });

  it('should select the correct field when the form is rendered from existing data', () => {
    const schema = {
      type: 'object',
      properties: {
        userId: {
          anyOf: [
            {
              type: 'number',
            },
            {
              type: 'string',
            },
          ],
        },
      },
    };

    const { node } = createFormComponent({
      schema,
      formData: {
        userId: 'foobarbaz',
      },
    });

    expect(node.querySelector('select').value).toBe('1');
  });

  it.skip('should select the correct field when the formData property is updated', () => {
    const schema = {
      type: 'object',
      properties: {
        userId: {
          anyOf: [
            {
              type: 'number',
            },
            {
              type: 'string',
            },
          ],
        },
      },
    };

    const { comp, node } = createFormComponent({
      schema,
    });

    expect(node.querySelector('select').value).toBe('0');

    setProps(comp, {
      schema,
      formData: {
        userId: 'foobarbaz',
      },
    });

    expect(node.querySelector('select').value).toBe('1');
  });

  it('should not change the selected option when entering values', () => {
    const schema = {
      type: 'object',
      anyOf: [
        {
          title: 'First method of identification',
          properties: {
            firstName: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
          },
        },
        {
          title: 'Second method of identification',
          properties: {
            idCode: {
              type: 'string',
            },
          },
        },
      ],
    };

    const { node } = createFormComponent({
      schema,
    });

    const $select = node.querySelector('select');

    expect($select.value).toBe('0');

    Simulate.change($select, {
      target: { value: $select.options[1].value },
    });

    expect($select.value).toBe('1');

    Simulate.change(node.querySelector('input#root_idCode'), {
      target: { value: 'Lorem ipsum dolor sit amet' },
    });

    expect($select.value).toBe('1');
  });

  it('should not change the selected option when entering values and the subschema uses `anyOf`', () => {
    const schema = {
      type: 'object',
      anyOf: [
        {
          title: 'First method of identification',
          properties: {
            firstName: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
          },
        },
        {
          title: 'Second method of identification',
          properties: {
            idCode: {
              type: 'string',
            },
          },
          anyOf: [
            {
              properties: {
                foo: {
                  type: 'string',
                },
              },
            },
            {
              properties: {
                bar: {
                  type: 'string',
                },
              },
            },
          ],
        },
      ],
    };

    const { node } = createFormComponent({
      schema,
    });

    const $select = node.querySelector('select');

    expect($select.value).toBe('0');

    Simulate.change($select, {
      target: { value: $select.options[1].value },
    });

    expect($select.value).toBe('1');

    Simulate.change(node.querySelector('input#root_idCode'), {
      target: { value: 'Lorem ipsum dolor sit amet' },
    });

    expect($select.value).toBe('1');
  });

  it('should not change the selected option when entering values and the subschema uses `allOf`', () => {
    const schema = {
      type: 'object',
      anyOf: [
        {
          title: 'First method of identification',
          properties: {
            firstName: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
          },
        },
        {
          title: 'Second method of identification',
          properties: {
            idCode: {
              type: 'string',
            },
          },
          allOf: [
            {
              properties: {
                foo: {
                  type: 'string',
                },
              },
            },
            {
              properties: {
                bar: {
                  type: 'string',
                },
              },
            },
          ],
        },
      ],
    };

    const { node } = createFormComponent({
      schema,
    });

    const $select = node.querySelector('select');

    expect($select.value).toBe('0');

    Simulate.change($select, {
      target: { value: $select.options[1].value },
    });

    expect($select.value).toBe('1');

    Simulate.change(node.querySelector('input#root_idCode'), {
      target: { value: 'Lorem ipsum dolor sit amet' },
    });

    expect($select.value).toBe('1');
  });

  it('should not mutate a schema that contains nested anyOf and allOf', () => {
    const schema = {
      type: 'object',
      anyOf: [
        {
          properties: {
            foo: { type: 'string' },
          },
          allOf: [
            {
              properties: {
                baz: { type: 'string' },
              },
            },
          ],
          anyOf: [
            {
              properties: {
                buzz: { type: 'string' },
              },
            },
          ],
        },
      ],
    };

    createFormComponent({
      schema,
    });

    expect(schema).toStrictEqual({
      type: 'object',
      anyOf: [
        {
          properties: {
            foo: { type: 'string' },
          },
          allOf: [
            {
              properties: {
                baz: { type: 'string' },
              },
            },
          ],
          anyOf: [
            {
              properties: {
                buzz: { type: 'string' },
              },
            },
          ],
        },
      ],
    });
  });

  describe('Arrays', () => {
    it('should correctly render form inputs for anyOf inside array items', () => {
      const schema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              anyOf: [
                {
                  properties: {
                    foo: {
                      type: 'string',
                    },
                  },
                },
                {
                  properties: {
                    bar: {
                      type: 'string',
                    },
                  },
                },
              ],
            },
          },
        },
      };

      const { node } = createFormComponent({
        schema,
      });

      expect(node.querySelector('.array-item-add button')).not.toBeNull();

      Simulate.click(node.querySelector('.array-item-add button'));

      expect(node.querySelectorAll('select')).toHaveLength(1);

      expect(node.querySelectorAll('input#root_foo')).toHaveLength(1);
    });

    it('should correctly render mixed types for anyOf inside array items', () => {
      const schema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              anyOf: [
                {
                  type: 'string',
                },
                {
                  type: 'object',
                  properties: {
                    foo: {
                      type: 'integer',
                    },
                    bar: {
                      type: 'string',
                    },
                  },
                },
              ],
            },
          },
        },
      };

      const { node } = createFormComponent({
        schema,
      });

      expect(node.querySelector('.array-item-add button')).not.toBeNull();

      Simulate.click(node.querySelector('.array-item-add button'));

      const $select = node.querySelector('select');
      expect($select).not.toBeNull();
      Simulate.change($select, {
        target: { value: $select.options[1].value },
      });

      expect(node.querySelectorAll('input#root_foo')).toHaveLength(1);
      expect(node.querySelectorAll('input#root_bar')).toHaveLength(1);
    });
  });
});
