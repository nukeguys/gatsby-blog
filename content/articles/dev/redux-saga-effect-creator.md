---
title: 'takeEvery vs takeLatest vs takeLeading'
date: '2020-05-16T23:25:10'
description: 'redux-saga에서 자주 쓰는 effect creator 비교'
category: 'dev'
tags: [redux-saga, jest, test]
---

`redux-saga` API는 편의성을 위해서 여러 `Effect Creator`들을 제공한다. 그 중 액션을 감지하기 위한 목적으로 자주 사용하는 헬퍼인 `takeEvery`, `takeLatest`, `takeLeading`가 있다. 이 함수들은 정확하게 사용하지 않으면 예상치 못하게 동작하는 경우를 만나게 된다. 덕분에 나도 한동안 재현하기 힘든 버그를 잡느라 오랜시간을 헤맸는데 그러면서 사용해야하는 기준을 다시 한 번 명확하게 생각해 보게 된 적이 있다. 그래서 간단히 각각의 기능과 사용을 해야 하는 상황들에 대해 정리해 본다.

어떤 걸 써도 괜찮은 경우가 있을 수도 있을진 모르겠지만 의도하는 바에 맞게 적절한 것을 골라서 사용해 주는 것이 좋다. `redux-saga`를 주로 api 호출에 사용하는 경우가 많은데, 호출하는 api가 어떤지에 따라 판단해 보면 된다.

### takeEvery

액션이 dispatch될 때 마다 새로운 task를 실행한다. 항상 fork하기 때문에 동시에 호출될 수 있고, 실행 순서가 보장되지 않는다.

```js
const takeEvery = (patternOrChannel, saga, ...args) =>
  fork(function*() {
    while (true) {
      const action = yield take(patternOrChannel);
      yield fork(saga, ...args.concat(action));
    }
  });
```

dispatch된 액션에 대한 처리가 동시에 발생하기 때문에 해당 task가 동시에 중복으로 발생해도 문제가 없는 경우에 사용하면 된다. 예를 들어 클릭을 할 때 마다 서버로 클릭을 보내야 하는 이벤트가 있고, 동시에 전송이 되어 처리하는데 문제가 없는 상황이라면 적절하다.  
하지만 파라미터에 따라 결과가 달라지는 api가 있고, 파라미터를 다르게 해서 api를 중복으로 호출 하는 경우가 있어 takeEvery를 사용하면 주의해야 한다. 구현에 따라 다르겠지만 의도와 다르게 동일한 파라미터를 가진 요청이 중복으로 발생할 가능성도 있기 때문이다. 예를 들어 한 화면에 탭으로 구분된 레이아웃에서 데이터를 불러올 때 동일 api에 파라미터만 변경해서 사용한다면 하나의 액션으로 `takeEvery`를 사용할 수도 있겠지만, 개인적으로 이런 경우엔 액션을 분리해서 `takeLatest`나 `takeLeading`로 처리하고 task를 공통으로 사용하는 것도 괜찮을 것 같다.

### takeLatest

액션이 dispatch 됐을 때 이전에 이미 실행 중인 task가 있다면 취소하고 새로운 task를 실행(fork)한다. 즉 항상 최신 액션이 처리되는 것을 보장한다.

```js
const takeLatest = (patternOrChannel, saga, ...args) =>
  fork(function*() {
    let lastTask;
    while (true) {
      const action = yield take(patternOrChannel);
      if (lastTask) {
        yield cancel(lastTask); // cancel is no-op if the task has already terminated
      }
      lastTask = yield fork(saga, ...args.concat(action));
    }
  });
```

이미 처리 중인 상황이라도 동일한 액션이 dispatch되면 취소되고 다시 호출이 된다. 즉 이전 api 요청은 무시되고 최신 data를 받아올 수 있다. 상황에 따라 다르겠지만 대부분 데이터를 가져오는 요청(GET)은 최신 데이터를 받는 것이 좋다. 페이지 전환 또는 새로고침 기능 등을 통해 동일한 api 요청이 발생하는 경우에는 이전 요청은 받아도 의미가 없고 최신 요청을 빠르게 처리해서 보여주는 것이 좋기 때문이다.  
하지만 액션이 dispatch 될 때 마다 취소되고 새로운 요청이 가기 때문에 결과가 같거나 동기화 자체가 그닥 중요하지 않은 api 요청이 중복으로 발생하는 경우에는 불필요한 딜레이가 생길 수 있다. 이럴 땐 `takeLeading`으로 처리해 주는 것이 좋다.  
보통 GET 요청이면서 파라미터에 따라 결과가 달라지는 api라면 `takeLatest`를 사용해주면 적절했다.

### takeLeading

액션이 dispatch되고 task가 실행되면 끝날 때 까지 동일한 액션에 대해서 감지를 하지 않는다. 즉 먼저 호출된 액션이 처리되는 것을 보장한다.

```js
const takeLeading = (patternOrChannel, saga, ...args) =>
  fork(function*() {
    while (true) {
      const action = yield take(patternOrChannel);
      yield call(saga, ...args.concat(action));
    }
  });
```

처리 순서가 중요하거나 중복으로 호출되면 안되는 경우, 위에서 언급한 것 처럼 항상 같은 결과를 반환하는 api를 호출하는 경우(또는 바뀔 가능성이 많지 않고, 바뀌더라도 동기화가 바로 처리될 필요 없는 경우)에 사용해주면 좋다. 데이터를 추가 또는 삭제 등의 경우에는 api에서 처리가 되어 있다면 상관없을 수 있겠지만 중복이 발생하지 않도록 순서대로 처리해 주는 것이 좋고, 고정된 어떤 값을 받아와야 하는 경우에는 이미 요청이 발생한 경우 굳이 다시 요청을 하지 않아도 되기 때문에 `takeLatest`에 비해 빠르게 응답을 할 수 있기 때문이다.
일반적으로 GET 요청이 아닌 경우나, GET 요청이면서 결과가 바뀌지 않는 경우들은 `takeLeading`을 사용해주면 괜찮았다.

내가 헤맸던 상황은 쿼리에 따라 결과가 달라지는 api를 호출할 때 `takeLeading`을 사용하고 있었다. 문제는 이 api가 중복해서 호출되는 경우를 예상하지 못했다는 것이다. 하지만 생각치 못하게 같은 api를 요청이 중복으로 발생하는 것이 가능했고 그러다 보니 유저 액션에 따른 화면은 최신 결과를 반영하려 하고 api는 이전의 결과를 받아와서 처리를 하는 상황이었다. 간단히 `takeLatest`로 바꾸고 해결됐다.  
현재 구현과 상황에 따라 의존적으로 처리 하거나 제약이 필요한 경우도 물론 있겠지만, 기본적으로는 외부상황(api요청 자체만 봤을 때 언제 어디서 호출되는지는 외적인 요인이다)을 배제하고 해당 기능에 대해서만 판단을 하고 구현을 해야 문제가 될 가능성이 줄어든다. 즉 의존성을 줄이는 것으로 볼 수 있다. 소프트웨어에서 어찌보면 당연한 말이지만, 때때로 놓치는 경우가 있다. 다시 한 번 기본의 중요성을 깨닫게 된다.
