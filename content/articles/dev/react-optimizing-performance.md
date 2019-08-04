---
title: 'react dev tool로 성능 측정 해보기'
date: '2019-08-04T11:08:52'
description: 'react 성능 측정 및 최적화'
category: 'dev'
tags:
  [
    react,
    performance,
    developer tool,
    useMemo,
    useCallback,
    reconciliation,
    layout,
    repaint,
  ]
---

최근 작업을 하면서 react 성능에 대해 신경을 써야 할 상황이 생겼다. 아직 정확하게는 모르지만 대충 눈치, 코치, 감으로 chrome과 react의 developer tool을 사용해서 성능을 측정하고 개선하는 작업을 했는데, 일단 이번엔 `React Developer Tools`을 사용해 성능을 측정하하고 개선하는 방법을 정리해본다.

## 성능 측정

우선 react와 browser의 렌더링 과정에 대해 간단히 알 필요가 있다. react는 DOM의 직접적인 변경을 방지하기 위해 virtual DOM을 사용하고 실제로 변경이 필요한 부분만 DOM에 반영함으로써 성능을 올린다. 브라우저는 변경이 발생하면 크게 두 과정을 필요에 따라 선택적으로 수행한다. DOM tree를 갱신하는 reflow(layout)와 이를 화면에 반영하는 repaint(painting)이다.([Introduction to Layout in Mozilla - Mozilla \| MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Introduction_to_Layout_in_Mozilla#Basic_Data_Flow))

브라우저의 DOM에 변경을 가하는 reflow와 repaint도 당연히 성능에 영향이 크지만, react의 virtual DOM을 재계산하는 reconciliation([Reconciliation – React](https://reactjs.org/docs/reconciliation.html))과정도 생각보다 성능에 많은 영향을 미친다. 따라서 성능을 올리기 위해서는 이 모든 과정에 대한 고려가 필요하다. react의 reconciliation는 react developer tools를 통해 확인할 수 있고, reflow 및 repaint는 chrome의 developer tool을 통해 확인이 가능하다.

### Highlight Updates

react는 컴포넌트의 state나 props가 변경되면 render를 수행하여 virtual DOM을 갱신한다. react의 developer tools에서 Highlight Updates 설정을 켜놓으면 interaction이 발생할 때 마다 리렌더링되는 컴포넌트의 테두리에 색이 변경되는 것을 볼 수 있다. 즉 변경될 필요가 없는데도 특정 부분의 테두리 색이 나타난다면 불필요한 컴포넌트 렌더링이 발생하고 있는 것이다.

### Profiler

위의 방법은 눈으로 쉽게 확인 가능하지만 상세한 내용은 알 수 가 없다. 경우에 따라 보다 정확하고 자세한 내용을 알고 싶다면 profiler를 사용하면 된다. 기본적인 사용법은 profiler 패널에서 record 버튼을 누르고 원하는 interaction을 하거나 시간이 흐른 뒤에 stop을 누르면 그 사이에 발생한 렌더링에 대해 확인 할 수 있다.

![stop-profiling-45619de03bed468869f7a0878f220586-53c76.png](https://reactjs.org/static/stop-profiling-45619de03bed468869f7a0878f220586-53c76.png)

#### Flame Chart

prifiling이 끝나면 그 동안에 발생한 commit[^1]별 flame chart를 보여준다. 각 commit은 패널의 우측 상단에서 표시가 되고 각 commit을 선택하면 해당 commit의 flame chart가 표시된다.

![commit-selector-bd72dec045515d59be51c944e902d263-8ef72.png](https://reactjs.org/static/commit-selector-bd72dec045515d59be51c944e902d263-8ef72.png)

commit이 많이 표시되는 것은 측정 시간동안 DOM의 변경이 그 만큼 발생했다는 것이고, 바의 색과 높이는 렌더링 소용된 시간을 나타낸다. (높고 노란색일 수록 오래 걸렸다는 의미이다.)

flame chart에서는 commit에서 각 컴포넌트들의 상태를 나타낸다. 바의 길이(너비)는 마지막 렌더링에 걸린 시간을 의미하고 색은 현재 commit에서 소요된 시간을 의미한다. (해당 컴포넌트와 자식컴포넌트를 포함한다.)

아래 사진에서보면 `App`과 `HashRouter` 컴포넌트의 경우 렌더링에 많은 시간이 걸리고 있으나 회색이기 때문에 현재 commit에서는 렌더링이 발생하지 않았다는 것을 알 수 있고, `Router` 컴포넌트는 렌더링이 발생했고 대부분의 시간이 자식 컴포넌트인 `Nav`와 `Route` 렌더링에 소요된 것을 알 수 있다.

![flame-chart-3046f500b9bfc052bde8b7b3b3cfc243-53c76.png](https://reactjs.org/static/flame-chart-3046f500b9bfc052bde8b7b3b3cfc243-53c76.png)

컴포넌트를 선택하면 이번 commit에서의 `state`나 `prpos`도 확인이 가능하고, 다른 commit을 선택하면 변경도 확인할 수 있어서 렌더링이 발생한 이유도 알 수 있다.

#### Ranked Chart

두 번째 ranked chart를 선택하면 현재 commit에서 렌더링이 오래걸린 순으로 컴포넌트를 정렬해서 확인 할 수 있다. 단, 자식 컴포넌트의 렌더링을 포함하기 때문에 표시되는 실제 오래걸리는 컴포넌트가 포함된 tree의 top이 표시될 수 있다는 점을 염두해야 한다.

#### Component Chart

전체 profiling 동안 특정 컴포넌트의 렌더링에 대해 알고 싶을 땐 component chart가 유용하다. 컴포넌트를 더블클릭하거나 오른쪽 x표시 옆에 있는 차트 모양 아이콘을 선택하면 볼 수 있다.

![component-chart-d71275b42c6109e222fbb0932a0c8c09-53c76.png](https://reactjs.org/static/component-chart-d71275b42c6109e222fbb0932a0c8c09-53c76.png)

바의 수는 렌더링 된 횟수를 의미하고 각 바의 높이와 색은 각 commit에서 다른 컴포넌트에 비해 상대적으로 해당 컴포넌트가 렌더링되는데 걸린 시간을 의미한다. 바를 선택하면 자세한 내용을 볼 수 있고, 더블 클릭하거나 x를 누르면 이전 화면으로 돌아갈 수 있다.

보다 상세한 사용법은 react 블로그를 참고하자. ([Introducing the React Profiler – React Blog](https://reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html))

## 개선 하기

profiling 결과를 보다보면 특정 컴포넌트가 렌더링에 시간을 오래 소요하거나 렌더링할 필요가 없는 데도 commit마다 렌더링이 발생하는 경우가 있다. 이런 경우 해당 컴포넌트를 찾아서 불필요한 렌더링이 발생하지 않도록 개선할 필요가 있다.

우선 렌더링이 발생하는 이유에 대해 생각해보자. react는 state나 props가 변경된 경우 컴포넌트의 변경이 발생할 것으로 예상하고 렌더링을 한다. 이 과정이 위에서 확인되는 렌더링 이다. 최종적으로 실제 DOM에 변경이 없다면 반영이 되지 않겠지만(이 부분은 다음에 정리할 내용에서 확인이 가능하다.) 이 자체만으로 경우에 따라 성능에 많은 영향을 주게 된다. 이 과정을 없애기 위해서는 react에게 렌더링을 할 필요가 없다는 것을 알려줄 필요가 있다. 예상했듯이 class형 컴포넌트에서는 `shouldComponentUpdate`를 사용하거나 `PureComponent`를 상속함으로서 미리 정의된 `shouldComponentUpdate`를 적용할 수 있다. function 컴포넌트에서도 비슷한 역할을 하는 `memo`라는 HOC가 존재한다.

### React.memo

```ts
const MyComponent = React.memo(function MyComponent(props) {
  /* render using props */
});
```

위 처럼 사용하면 `PureComponent` 처럼 shallow 한 비교를 직접 처리해준다. 하지만 좀 더 복잡하거나 예외적인 처리가 필요할 경우에는 두 번째 인자로 이전 props와 다음 props를 받아서 비교를 수행하는 함수를 전달할 수 있다. `shouldComponentUpdate`와 다른점이 있다면 반환값이 반대라는 점이다. 이름에서 알 수 있듯이 `shouldComponentUpdate`는 update여부를 반환하기 때문에 다른 경우에 true를 반환하지만 `areEqual`의 경우는 비교의 결과를 반환하면 된다.

```ts
function MyComponent(props) {
  /* render using props */
}
function areEqual(prevProps, nextProps) {
  /*
  return true if passing nextProps to render would return
  the same result as passing prevProps to render,
  otherwise return false
  */
}
export default React.memo(MyComponent, areEqual);
```

대부분의 경우에는 추가적인 비교함수 없이 대응이 가능하다. 이 때 주의할 점은 shallow하게 비교하기 때문에 `immutable`한 데이터를 `props`로 사용해야 한다는 점이다. 즉, 실제 같은 데이터지만 렌더링 마다 새로운 객체를 생성해서 전달한다면 memo의 의미가 없어지게 되는 것이다.

즉 부모 컴포넌트에서 `useMemo`나 `useCallback`을 사용해서 props를 전달하고 자식 컴포넌트에서 `memo`가 적용되어 있으면 손쉽게 불필요한 렌더링을 막을 수 있게 되는 것이다. ([react hooks 복습하기](https://nukeguys.github.io/dev/react-hooks/) 참고)

그렇다면 `memo`는 항상 사용하는 것이 좋겠다는 생각을 할 수도 있다. 물론 대부분의 경우에는 효과를 볼 수도 있겠지만 `memo`도 내부적으로는 `useMemo`와 같이 동작을 하기 때문에 추가적인 비용이 들게 된다. 즉 매번(또는 빈번하게) 변경되는 컴포넌트에 적용하게 되면 렌더링은 그대로 유지되면서 추가적인 비용만 더 가중시키는 셈이다. 대표적으로 prpos로 `children`을 받아서 사용하는 컴포넌트를 들 수 있는데, 일반적으로 children은 매번 변경되거나 별도로 memoization을 하는 경우가 많지 않기 때문이다.

그래서 일단 적용하지 않은 상태로 구현한 뒤에 propfiling을 통해 필요한 곳에 `memo`를 적용하는 것을 권장한다.

이번엔 react development tool을 사용해서 렌더링 성능을 측정하고 개선하는 방법을 간단히 정리해봤다. 다음엔 browser의 렌더링 과정과 측정하는 방법을 정리해 볼 예정이다.

[^1]: react의 lifecyle은 크게 render와 commit으로 나뉜다. render를 수행한 후 변경된 사항을 DOM에 반영하는 과정이다.([React lifecycle methods diagram](http://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/))
