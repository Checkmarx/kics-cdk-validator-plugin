# CDK Kics Validator Plugin

<!--BEGIN STABILITY BANNER-->

---

![cdk-constructs: Experimental](https://img.shields.io/badge/cdk--plugin-experimental-important.svg?style=for-the-badge)

> The APIs of higher level constructs in this module are experimental and under active development.
> They are subject to non-backward compatible changes or removal in any future version. These are
> not subject to the [Semantic Versioning](https://semver.org/) model and breaking changes will be
> announced in the release notes. This means that while you may use them, you may need to update
> your source code when upgrading to a newer version of this package.
---

<!--END STABILITY BANNER-->


## Installing

### TypeScript/JavaScript

```bash
npm install @checkmarx/cdk-validator-kics
```

## Usage

To use this plugin in your CDK application add it to the CDK App.

```ts
import { KicsValidator } from '@checkmarx/cdk-validator-kics/lib/plugin';
```

```ts
new App({
  policyValidationBeta1: [
    new KicsValidator(),
  ],
});
```

By default the `KicsValidator` plugin comes with the [kics CloudFormation
queries](https://docs.kics.io/latest/queries/all-queries/) builtin.

To disable specific [categories](https://docs.kics.io/latest/queries/#query_categories)
provide the `excludeCategories` property.

```ts
new KicsValidator({
  excludeCategories: [
    QueryCategory.ENCRYPTION,
  ],
});
```

It is also possible to disable individual queries by providing the query id.

```ts
new KicsValidator({
  excludeQueries: [
    'a227ec01-f97a-4084-91a4-47b350c1db54', // S3 Bucket Without Versioning
  ],
});
```

### Severity

Kics queries can fall under 5 different severities, `high`, `medium`, `low`,
`info`, and `trace`. This plugin allows you to configure how the severities are
handled.

To completely exclude certain severities, use the `excludeSeverities` property.
Any queries that fall under these severities will not appear in the results,
even if they fail.

```ts
new KicsValidator({
  excludeSeverities: [
    Severity.INFO,
    Severity.TRACE,
  ],
});
```

The other option is to provide `failureSeverities` if you still want to show
the query in the results, but you don't want it to fail the execution.
By default this is set to `[Severity.HIGH, Severity.MEDIUM]`.

```ts
new KicsValidator({
  failureSeverities: [
    Severity.HIGH,
  ],
});
```


# API Reference <a name="API Reference" id="api-reference"></a>



## Classes <a name="Classes" id="Classes"></a>

### Hello <a name="Hello" id="@checkmarx/cdk-validator-kics.Hello"></a>

#### Initializers <a name="Initializers" id="@checkmarx/cdk-validator-kics.Hello.Initializer"></a>

```typescript
import { Hello } from '@checkmarx/cdk-validator-kics'

new Hello()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@checkmarx/cdk-validator-kics.Hello.sayHello">sayHello</a></code> | *No description.* |

---

##### `sayHello` <a name="sayHello" id="@checkmarx/cdk-validator-kics.Hello.sayHello"></a>

```typescript
public sayHello(): string
```
