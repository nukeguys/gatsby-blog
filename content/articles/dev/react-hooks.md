---
title: 'react hooks 복습하기'
date: '2019-07-28T10:35:46'
description: '익숙할 때 쯤 정리해보는 react hooks'
category: 'dev'
tags:
  [
    react,
    hooks,
    useState,
    useRef,
    useImperativeHandle,
    forwardRef,
    useEffect,
    useCallback,
    useMemo,
  ]
---

Frontend를 시작한지 얼마 되지 않았지만 그 짧은 사이에도 크고 작은 것들이 많이 변화했다. 정말 빠르구나 싶기도 하고 그런게 나름 또 이 세계의 재미가 아닌가 싶기도 하다.

React도 16.8이 릴리즈 되면서 hooks라는 api가 새롭게 등장했다. 익숙해 지려고 할 때 쯤 새로운 놈이 등장해서 다시 또 적응을 해야했고 지금은 나름 열심히 사용하고 있긴하지만 이쯤에서 자주 쓰는 hooks에 대해 정리를 한 번 해볼까한다. (물론 틀린 내용이 있을 수 있고, 주관적인 생각이 포함되어 있을 수 있다.)

우선 각 hook에 대해 정리하기 전에 hooks라는 이름에 대해 생각해 볼 필요가 있지 싶다. react 문서에서는 hook을 아래처럼 설명하고 있다.

> Hooks are functions that let you “hook into” React state and lifecycle features from function components. ([Hooks at a Glance – React](https://reactjs.org/docs/hooks-overview.html#but-what-is-a-hook))

state와 lifecycle을 `hook into`한다라는게 바로 와닿지는 않는다. 번역하면 연동한다/끌어드린다/밀어넣는다 정도로 될 듯하다.
hook이라는 단어는 `web-hook`이나 `hooking`처럼 흔하게 사용되는 말로 중간에 동작을 가로챈다는 의미로 보는게 이해가 빠를 것 같다. 따라서 react의 hook도 lifecycle 과정에서 state와 관련된 동작을 수행 할 수 있도록 해준다는 의미로 이해하면 될 것 같다.

## useState

class형 컴포넌트에서 `this.state`와 `setState`의 역할을 하는 hook이다.

```ts
const [state, setState] = useState(initialState);
```

공식문서에 나와있는 이전방식과 hook의 코드도 비교해보자.([Using the State Hook – React](https://reactjs.org/docs/hooks-state.html))

하나의 객체가 아니라 필요한 state를 개별로 접근하고 변경할 수 있다는 점에서 관리와 사용이 훨씬 깔끔해진 느낌이다. `useState`를 사용할 때 주의해야 할 부분도 있다. 우선 class형 컴포넌트 안에서는 사용할 수 없고, setState와 다르게 merge가 아닌 replace된다는 점이다. 두 번째는 setter의 인자로 값이 아닌 함수를 전달할 수 도 있다는 점이다. count를 증가시키는 코드를 예로 보면 일반적으로 아래처럼 할 수 있다.

```ts
const increaseCount = () => {
  setCount(count + 1);
};
```

하지만 setCount를 비동기 callback에서 호출하는 경우에 원하는 대로 count가 증가하지 않는 경우를 경험할 수 있다. 이유는 callback 등록 시점에 함수가 생성되면서 count 값이 고정되어 버리기 때문이다. 처음에 같은 문제를 겪고 한참을 헤맸던 기억이 있다. 이런 경우에는 아래처럼 setCount에 함수(이전 state값을 받아서 새로운 state를 반환하는)를 전달하면 해결 할 수 있다.

```ts
const increaseCount = () => {
  setCount(prevCount => prevCount + 1);
};
```

물론 위의 경우처럼 단순하게 처리가 불가능한 경우가 있을 수도 있다. 또 state 뿐 아니라 props에 대해서도 동일한 문제가 발생할 수 있다. 그런 경우에는 state를 객체로 변경해서 사용하거나, `useRef`를 사용해 state 또는 props를 별도의 변수로 저장해서 접근해야 한다.

추가로 useSate의 초기값으로도 함수를 전달할 수 있다. 이는 초기값 계산의 cost가 높은 경우에 초기화를 지연시키는 역할을 한다.

## useRef

위에서 언급한 `useRef`도 간단히 정리해본다.

```ts
const refContainer = useRef(initialValue);
```

이름에서 유추 가능한 것 처럼, 원하는 값을 객체로 warraping해서 `current`라는 속성으로 접근할 수 있게 해준다. 보통 DOM의 reference를 담아두는데 사용하지만 class의 멤버 변수처럼 사용하는 것이 가능하다.

어렵지 않지만 실제로 구현된 아래 코드를 보면 더 쉽게 이해가 된다. ([ReactFiberHooks.js · GitHub](https://github.com/facebook/react/blob/42b75ab007a5e7c159933cfdbf2b6845d89fc7f2/packages/react-reconciler/src/ReactFiberHooks.js#L856-L869))

```ts
function mountRef<T>(initialValue: T): { current: T } {
  const hook = mountWorkInProgressHook();
  const ref = { current: initialValue };
  if (__DEV__) {
    Object.seal(ref);
  }
  hook.memoizedState = ref;
  return ref;
}

function updateRef<T>(initialValue: T): { current: T } {
  const hook = updateWorkInProgressHook();
  return hook.memoizedState;
}
```

최초에는 ref라는 객체를 만들어 current 속성에 초기값을 설정해서 반환하고, 이후부터는 해당 객체를 반환한다.

참고로 react의 hooks는 `mountXXX`와 `updateXXX`라는 이름으로 최초 실행과 이후 업데이트에서 사용하는 함수가 각각 분리되어 구현 되어 있다.

## useImperativeHandle & forwardRef

```ts
useImperativeHandle(ref, createHandle, [deps]);
```

`useImperativeHandle`은 부모에게 원하는 interface를 통해 ref를 사용할 수 있게 해준다. 즉, 부모가 자식의 ref를 직접 받아서 접근할 수도 있지만, 제한하거나 커스터마이징해서 제공을 하고 싶을 때 사용하면 된다. `useImperativeHandle`은 `forwardRef`와 함께 사용해야 하는데 간단한 사용법은 아래와 같다.

```ts
function FancyInput(props, ref) {
  const inputRef = useRef();
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    }
  }));
  return <input ref={inputRef} ... />;
}
FancyInput = forwardRef(FancyInput);
```

## useEffect

`useState`와 더불어 가장 자주 사용하고 중요한 hook중의 하나이다.

```ts
useEffect(didUpdate);
```

공식문서의 정의는 아래처럼 되어있다.

> The Effect Hook lets you perform side effects in function components.

함수형 컴포넌트에서 `side effects`를 수행할 수 있게 해준다라는 의미가 바로 와닿지는 않는다. 그래서 문서를 조금 더 살펴보면 이런 내용도 있다.

> Data fetching, setting up a subscription, and manually changing the DOM in React components are all examples of side effects. Whether or not you’re used to calling these operations “side effects” (or just “effects”), you’ve likely performed them in your components before.

즉, 컴포넌트 내부에서 수행하던 `data fetching`, `subscription(이벤트 등록/해제 같은)`, `manaual한 DOM변경` 등과 같은 state를 직접 처리하는 이외의 동작이나 기능들을 `side effect` 또는 `effect`로 부르고 있다.

`useEffect`가 중요한 이유 중의 하나는 react의 `lifecycle`과 밀접하게 관련이 있기 때문이다.
기본적으로 렌더링이 완료된 이후에 실행 되는데 두번째 인자인 `deps`를 통해 실행 여부를 결정할 수 있기 때문에 class 컴포넌트에 있던 `componentDidMount`, `componentDidUpdate`, `componentWillUnmount`와 같은 lifecycle과 비슷한 역할을 할 수 있다.

기존 방식과의 차이점은 문서를 확인하면 명확하게 알 수 있다.([Using the Effect Hook – React](https://reactjs.org/docs/hooks-effect.html))

`useEffect`에서 함수를 리턴할 수 있는데 이 함수는 다음 effect발생하기 전에 호출이 되기 때문에 메모리 정리나 구독해제 같은 기능을 처리할 수 있다. (`componentDidMount`에서 등록하고 `componentWillUnmount`에서 해제하는 것과 유사한 동작)

```ts
useEffect(() => {
  const subscription = props.source.subscribe();
  return () => {
    subscription.unsubscribe();
  };
});
```

그런데 위의 코드를 수행하면 매 렌더링시마다 구독/해제가 일어나기 때문에 비효율적이다. 이런 문제를 해결하기 위해서 위에서 언급한 대로 두번째 인자로 `deps(dependencies)`를 전달할 수 있다. `deps`는 배열 형식으로 전달하고, 배열의 각 아이템을 shallow하게 비교해서 변경이 발생한 경우에만 effect가 실행된다. 위 코드처럼 전달하지 않으면 매번 실행이 되고, 빈배열(`[ ]`)을 전달하면 mount/unmount시에만 호출이 된다. 위 코드에서는 props의 source에 접근하고 있기 때문에 그 값이 변할 경우에만 구독/해제를 할 필요가 있다. 따라서 아래처럼 해주면 원하는 효과를 볼 수 있다.

```ts
useEffect(() => {
  const subscription = props.source.subscribe();
  return () => {
    subscription.unsubscribe();
  };
}, [props.source]);
```

여기서 주의할 점은, 컴포넌트 범위에서 변경될 수 있는 값(state나 props같은)을 누락하게 되면 원하는 동작을 하지 않을 수 있다는 점이다. 예로 위의 코드에서 deps에 []를 넣게 되면, props의 source가 변경되어도 구독은 계속 이전 source에 된 상태로 남아있게 된다.

`useEffect`에서 직접적인 접근이 없지만 호출하는 함수에서 변경되는 값이 존재하는 경우에도 마찬가지로 추가를 해줘야 하지만 쉽게 인지하기 어려울 수도 있기 때문에 react에서는 `eslint-plugin-react-hooks`의
[exhaustive-deps](https://github.com/facebook/react/issues/14920) lint rule을 사용하는 것을 권장하고 있다.

## useCallback

callback의 memoization을 만들어주는 hook이다. 즉, 매번 동일한 함수를 생성하는 것이 아니라 변경될 필요가 없는 경우 이전에 생성된 함수를 반환해주는 기능을 한다.

```ts
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

`useCallback`이 유용성은 react의 특성을 이해하면 알기 쉽다. 자식에게 callback을 전달하는 경우에 부모가 렌더링 되면서 매번 새로 생성된다면 자식입장에서는 props가 변경되기 때문에 함께 렌더링이 발생하게 되는 것이다. 이런 경우 사용하면 memoization된 callback을 전달함으로써 불필요한 렌더링을 방지할 수 있게 되는 것이다. 자식에서 `shouldComponentUpdate`를 통해 변경여부를 직접 비교해서 렌더링을 결정하는 효과를 간단히 볼 수 있게 된다. 마찬가지로 callback은 `deps`에 따라 변경여부를 결정하기 때문에 주의해서 사용할 필요가 있다.

## useMemo

`useCallback`이 memoization된 함수를 반환해 주었다면 `useMemo`는 memoization된 값을 반환해 준다.

```ts
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

`deps`가 변경된 경우에만 전달된 함수를 호출하여 결과를 반환하기 때문에 cost가 많은 처리를 필요할 때만 수행하도록 할 수 있다. 주의할 점은 `useMemo`는 렌더링 중에 실행되기 때문에 계산이 아닌 `sideEffect`(위에서 언급한)를 수행하면 안된다는 것이다. 또한 이후 버전에서는 매번 재계산하는 방식을 택할 수도 있기 때문에 `useMemo`는 성능 최적화의 목적으로만 사용해야 한다.

그 외에 `useContext`, `useReducer`, `useLayoutEffect` 등이 있지만 어렵지 않고 사용빈도도 많지 않기 때문에 생략한다. (공식문서를 보면 쉽게 이해할 수 있다.)

추가로 `customHook`을 만들어 사용할 수도 있는데, 공식문서([Building Your Own Hooks – React](https://reactjs.org/docs/hooks-custom.html))를 보면 간단하게 방법을 알 수 있다. 유용한 custom hook은 [useHooks - Easy to understand React Hook recipes](https://usehooks.com/)를 참고하면 작성과 사용법을 아는데 도움이 된다.

간단하게 hook의 내용과 사용법들을 정리해 봤다. 사실 각각 hook을 사용하면서 고민하거나 헤맸던 부분들에 대해서 정리를 하는게 목적이었으나 그 전에 간단히 기본적인 내용들을 먼저 정리해봤다. 이후에 시간이 되면 `useEffect`와 `useCallback`의 `deps`를 사용하면서 들었던 고민들이나 퍼포먼스를 올리기 위해 하고 있는 삽질들을 다시 한 번 정리해볼 예정이다.
