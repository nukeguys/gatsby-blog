---
title: "[번역] TypeScript의 Do's and Don'ts"
date: '2019-02-11T22:52:55'
description: "TypeScript 공식 documentation의 Do's and Don'ts를 번역해 보았다."
category: 'dev'
tags: [TIL, typscript]
---

# Do's and Don'ts

## General Types

### Number, String, Boolean, and Oject

**_Don't_**
`Number`, `String`, `Boolean` 또는 `Object` 타입을 절대 사용하지 마라. 이 타입들은 JavaScript 코드에서 대부분 적절하지 않게 사용되는 non-primitive boxed object[^1]들을 의미한다.

```ts
/* WRONG */
function reverse(s: String): String;
```

**_Do_**
`number`, `string` 그리고 `boolean`을 사용하라.

```ts
/* OK */
function reverse(s: string): string;
```

`Object` 대신 non-primitive인 `object` 타입을 사용하라 ([TypeScript 2.2](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#object-type)에 추가됨).

#### Generic

**_Don't_**
타입 매개변수를 사용하지 않는 generic 타입을 사용하지 마라. 더 자세한 내용은 [TypeScript FAQ page](https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-type-inference-work-on-this-interface-interface-foot---)에서 확인.[^2]

## Callback Types

### Return Types of Callbacks

**_Don't_**
값이 무시될 콜백의 리턴타입으로 `any`를 사용하지 마라.

```ts
/* WRONG */
function fn(x: () => any) {
  x();
}
```

**_Do_**
값이 무시될 콜백의 리턴타입으로 `void`를 사용하라.

```ts
/* OK */
function fn(x: () => void) {
  x();
}
```

**_Why_**
확인되지 않는 방법으로 `x`의 리턴타입을 사용하는 실수를 방지해주기 때문에 `void`를 사용하는 것이 더 안전하다.

```ts
function fn(x: () => void) {
  var k = x(); // oops! meant to do something else
  k.doSomething(); // error, but would be OK if the return type had been 'any'
}
```

### Optional Paameters in Callbacks

**_Don't_**
의도한 경우를 제외하고는 선택적 매개변수를 사용하지 마라.

```ts
/* WRONG */
interface Fetcher {
  getObject(done: (data: any, elapsedTime?: number) => void): void;
}
```

이것은 매우 분명한 의미를 갖는다. : `done` 콜백은 1개 또는 2개의 매개변수를 가지고 호출된다. 작성자는 아마 콜백이 `elapsedTime` 매개변수에 대해 신경쓰지 않는다는 것을 의도했을 것이다. 그러나 그것을 위해 선택적 매개변수로 만들 필요는 없다. - 더 적은 매개변수를 받는 콜백을 전달하는 것은 언제나 적합하다.[^3]

**_Do_**
콜백의 파라미터를 필수(non-optional) 파라미터로 작성하라.

```ts
/* OK */
interface Fetcher {
  getObject(done: (data: any, elapsedTime: number) => void): void;
}
```

### Overloads and Callbacks

**_Don't_**
콜백만 다른 별도의 타입 시그니처(overload)를 작성하지 마라.

```ts
/* WRONG */
declare function beforeAll(action: () => void, timeout?: number): void;
declare function beforeAll(
  action: (done: DoneFn) => void,
  timeout?: number
): void;
```

**_Do_**
모든 것을 포함하는 타입 시그니처 하나만 작성하라.

```ts
/* OK */
declare function beforeAll(
  action: (done: DoneFn) => void,
  timeout?: number
): void;
```

**_Why_**
콜백에서 매개변수를 무시하는 것은 언제나 적합하다.(역자:[^3]과 같은 의미이다.) 따라서 더 간단한 타입 시그니처는 필요하지 않다. 간단한 타입 시그니처를 제공하는 것은 타입이 잘못된 함수가 첫번째 함수 시그니처와 매칭되어 전달되는 것을 허용한다.[^4]

### Function Overloads

#### Ordering

**_Don't_**
더 구체적인 시그니처 전에 일반적인 시그니처를 두지 마라.

```ts
/* WRONG */
declare function fn(x: any): any;
declare function fn(x: HTMLElement): number;
declare function fn(x: HTMLDivElement): string;

var myElem: HTMLDivElement;
var x = fn(myElem); // x: any, wat?
```

**_Do_**
더 구체적인 시그니처 다음에 일반적인 시그니처를 두도록 정렬하라.

```ts
/* OK */
declare function fn(x: HTMLDivElement): string;
declare function fn(x: HTMLElement): number;
declare function fn(x: any): any;

var myElem: HTMLDivElement;
var x = fn(myElem); // x: string, :)
```

**_Why_**
TypeScript는 함수 호출을 결정할 때 처음 매칭되는 시그니처를 서낵한다. 먼저 나오는 시그니처가 뒤의 시그니처보다 더 일반적일 경우, 뒤에 나오는 것은 완벽히 가려지고 호출될 수 없다.

### Use Optional Parameters

**_Don't_**
뒤에 나오는 매개변수들만 다른 경우 여러 시그니처를 작성하지 마라.

```ts
/* WRONG */
interface Example {
  diff(one: string): number;
  diff(one: string, two: string): number;
  diff(one: string, two: string, three: boolean): number;
}
```

**_Do_**
가능한 경우에는 선택적 매개변수를 사용하라.

```ts
/* OK */
interface Example {
  diff(one: string, two?: string, three?: boolean): number;
}
```

이 방법은 모든 시그니처의 리턴타입이 같은 경우에만 가능하다는 것을 주의하라.

**_Why_**
여기엔 두 가지 중요한 이유가 있다.

TypeScript는 source의 매개변수로 target의 시그니처 호출할 수 있는지, 그리고 관련없는 매개변수가 허용되는지를 보고 시그니처 호환성을 결정한다. 예를 들어, 이 코드는 시그니처가 선택적 매개변수를 사용하여
정확히 작성된 경우에만 버그를 발생시킨다.

```ts
function fn(x: (a: string, b: number, c: number) => void) {}
var x: Example;
// 오버로딩으로 작성되어 있으면, OK -- 첫 번째 시그니처를 사용
// 선택적 매개변수로 작성되어 있으면, 에러
fn(x.diff);
```

두 번째 이유는 TypeScript의 `stric null checking` 기능을 사용하는 경우이다. JavaScript에서 명시되지 않은 매개변수는 `undefined`로 표현되기 때문에, 일반적으로 선택적 매개변수를 가진 함수에 `undefined`를 명시적으로 전달하는 것이 좋다. 예를 들어 이 코드는 strict null을 사용하는 경우에도 문제없다.

```ts
var x: Example;
// 오버로딩으로 작성되어 있으면, `undefined`를 `string` 타입으로 전달하기 때문에 에러
// 선택적 매개변수로 작성되어 있으면, 정상
x.diff('something', true ? undefined : 'hour');
```

### Use Union Types

**_Don't_**
오직 하나의 매개변수 타입이 다른 경우에는 오버로딩을 사용하지 마라.

```ts
/* WRONG */
interface Moment {
  utcOffset(): number;
  utcOffset(b: number): Moment;
  utcOffset(b: string): Moment;
}
```

**_Do_**
가능한 경우에는 유니온 타입을 사용하라.

```ts
/* OK */
interface Moment {
  utcOffset(): number;
  utcOffset(b: number | string): Moment;
}
```

시그니처의 리턴타입이 다르기 때문에 `b`를 선택적 매개변수로 하지 않은 것을 주의하라.

**_Why_**
이것은 함수에 값을 그대로 전달하는 사람들에게 중요하다.

```ts
function fn(x: string): void;
function fn(x: number): void;
function fn(x: number | string) {
  // 오버로딩으로 작성되어 있으면, 에러
  // 유니온 타입으로 작성되어 있으면, 정상
  return moment().utcOffset(x);
}
```

[^1]: primitive타입이 아닌 boxing된 object형 타입. 따라서 `Numer.MAX_VALUE`나 `Number.isSafeInteger()`등으로 사용가능하다.
[^2]: generic으로 선언하고 내부에서 사용하지 않는 경우를 만들지 말라는 의미로, FAQ 페이지를 보면 해당 타입 매개변수를 사용하는 부분이 없으면 타입추론이 제대로 이루어지지 않는다고 한다.
[^3]: 매개변수의 개수에 대한 함수의 타입 호환성에서 할당받는 함수의 매개변수가 더 많은 경우는 호환이 가능하기 때문이다. 자주 사용하는 `map()`,`filter()` 같은 함수에 매개변수 하나만 사용하는 콜백을 넘기는 경우를 생각하면 쉽다.
[^4]: 호출하는 쪽에서는 항상 정해진 수의 매개변수를 전달하고 콜백에서 필요한 만큼만 받아서 사용해야 하는데, 매개변수 개수가 적은 시그니처가 있으면 호출하는 쪽에서 매개변수를 적게 전달하는 실수가 허용된다.
