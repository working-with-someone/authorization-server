import joi from 'joi';

class JoiBaseSchema<T extends joi.AnySchema> {
  protected schema: T;

  constructor(schema: T) {
    this.schema = schema;
  }
}

class JoiStringBaseSchema extends JoiBaseSchema<joi.StringSchema> {
  private specialCharacters = /[[\]!"#$%&'()*+,./:;<=>?@^_`{|}~-]/;

  constructor() {
    super(joi.string());
  }

  public withoutSpecialChar(): joi.StringSchema {
    const stringSchema = this.schema.regex(this.specialCharacters, {
      invert: true,
    });

    return stringSchema;
  }
}

export const stringBase = new JoiStringBaseSchema();

type PatchOperation = 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';

/* 
  value, from은 operation의 종류에 따라 포함되지 않을 수 있지만
  op, path는 모든 patch document의 operator에서 require되는 property다.
 */
interface PatchDocumentConfig {
  op: Array<PatchOperation>;
  path: string;
  from?: string;
  value?: Array<string> | boolean; // value라는 property자체가 허용되는지를 boolean으로 나타낼 수 있으며, 지정된 value들만을 허용한다면 array의 아이템으로 표현할 수 있다.
}

class JoiObjectBaseSchema extends JoiBaseSchema<joi.ObjectSchema> {
  constructor() {
    super(joi.object());
  }

  public patchDocument(config: PatchDocumentConfig): joi.ObjectSchema {
    let valueSchema;

    // value의 type이 boolean이라면 value가 포함되어야하는지 여부를 나타낸다.
    if (typeof config.value === 'boolean') {
      valueSchema = config.value === true ? joi.string().required() : undefined;
    }

    // value의 type이 array라면 value는 array의 element에 해당하는 string만이 허용된다.
    if (Array.isArray(config.value)) {
      valueSchema = joi.string().valid(config.value).required();
    }

    // generate validation schema
    const schema = this.schema.keys({
      op: joi
        .string()
        .valid(...config.op)
        .required(),
      path: joi
        .string()
        .valid(...config.path)
        .required(),
      value: valueSchema,
    });

    return schema;
  }
}

export const objectBase = new JoiObjectBaseSchema();
