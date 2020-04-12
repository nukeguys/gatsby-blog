---
title: 'redux-saga 테스트 하기 (feat. jest)'
date: '2020-04-12T22:50:29'
description: 'redux-saga generator 함수 순차 테스트 하기'
category: 'dev'
tags: [redux-saga, jest, test]
---

`redux-saga`는 비동기 처리(data fetching이나 browser cache접근 등) 같은 사이드 이펙트를 좀 더 쉽게 관리하고 사용할 수 있도록 도와주는 라이브러리이다. redux-saga는 `redux middleware`이기 때문에 일반적인 redux action을 통해 동작을 제어할 수 있다. 그리고 비동기 처리를 위해 ES6의 `generator`를 사용하는데, 바로 이 점 때문에 테스트를 쉽게 작성할 수 있다.

redux-saga를 사용하면서 작성하는 generator 함수는 내부에서 yield를 사용한다. 그리고 이는 `effect`라고 부르는 객체를 반환하는데 이 객체를 `middleware`에서 받아 실행하고 그 결과를 다시 반환한다. 즉 어떤 작업을 생성하는 곳과 실제로 실행하는 곳이 분리되어 있는 것이다. 실행은 middleware에서 하기 때문에 우리는 직접 작성한 코드(생성을 담당하는)를 테스트해야 하는데, 두 부분이 분리되어 있는 덕분에 중간에 끼어들어 실행하지 않고도 테스트를 할 수 있게 되는 것이다.

목적에 따라 redux-saga의 generator 함수를 테스트 하는 방법이 다를 수 있다. 예를 들면 함수의 각 실행 단계를 테스트 하는 것이다. 다른 방법으로는 함수 최종 결과만 테스트 하는 것이다. 현재 구현을 정확하게 테스트 하는데 있어서는 첫 번째 방법이 좋을 수 있지만 이는 내부 구현에 의존적이기 때문에 같은 기능을 하더라도 구현이 바뀌면 테스트도 함께 수정을 해야 하고, 테스트 코드 작성시 작성자의 개입이 상대적으로 많이 발생한다(테스트를 위한 코드에 개입이 많으면 그 코드에 의해 문제를 발견하지 못하는 경우가 생길 수도 있다). 반대로 두번째 방법은 함수 자체의 기능만 검증하기 때문에 구현에 덜 의존적이고 따라서 테스트 코드를 수정하는 일이 생기진 않겠지만 부가적으로 처리해줘야 하는 것들이 생긴다(중간 개입이 적기 때문에). 또 보다 정확한 테스트를 위해서는 내부에서 사용하는 각 함수들의 테스트도 함께 작성 해주는 것이 좋을 수 있다.

우선은 간단하면서도 쉽게 적용할 수 있는 첫 번째 방법에 대해 정리해 본다.
아래와 같은 saga 함수에 4가지를 테스트 한다고 가정해보자.(코드가 실제로 동작하려면 좀 더 필요하지만 간단한 설명을 위해 코드를 간략하게 했다.)

```ts
function* fetchUser(action) {
  const { id } = action.payload;
  const { secret } = yield call(getSecret, id);
  const additionalParams = getParams(secret);
  const user = yield call(callApiForFetchUser, {
    ...additionalParams,
  });

  const userInfo = {
    login: true,
    user,
  };

  yield put(setUserInfoAction(userInfo));
}
```

1. secret를 가져오는 effect(`getSecret`) 생성
2. api호출을 하는 effect(`callApiForFetchUser`) 생성
3. redux에 저장하기 위한 effect(`setUserInfo`) 생성
4. 실행 완료

이 테스트 코드는 아래처럼 작성할 수 있다.

```ts
describe('Saga Test', () => {
  describe('fetchUser', () => {
    it('사용자 정보를 가져오는 api를 호출하고, redux에 userInfo를 저장하고, 정상 종료한다.', () => {
      const id = '19870605';
      const iterator = fetchUser(fetchUserAction(id));

      // 1. secret를 가져오는 effect(`getSecret`) 생성
      expect(iterator.next().value).toEqual(call(getSecret, id));
      // 2. api호출을 하는 effect(`callApiForFetchUser`) 생성
      expect(iterator.next({ secret: 't4lz0mf4lt' }).value).toEqual(
        call(callApiForFetchUser, { param1: 'param1', param2: 'param2' })
      );
      // 3. redux에 저장하기 위한 effect(`setUserInfo`) 생성
      expect(iterator.next({ name: 'nukeguys', level: 'vip' }).value).toEqual(
        put(
          setUserInfoAction({
            login: true,
            user: { name: 'nukeguys', level: 'vip' },
          })
        )
      );
      // 4. 실행 완료
      expect(iterator.next().done).toBeTruthy();
    });
  });
});
```

단계별로 나눠보자.

**우선 테스트 할 generator 함수를 호출해서 iterator를 받아온다.**  
generator이기 때문에 iterator가 반환된다. 따라서 각 실행 단계별로 테스트를 할 수 있다.

```ts
const iterator = fetchUser(fetchUserAction(id));
```

**1. secret를 가져오는 effect(`getSecret`) 생성**  
위에서 말한 것 처럼 실행 결과가 아닌 effect를 비교한다.

```ts
expect(iterator.next().value).toEqual(call(getSecret, id));
```

**2. api호출을 하는 effect(`callApiForFetchUser`) 생성**  
**3. redux에 저장하기 위한 effect(`setUserInfo`) 생성**  
동일하게 effect를 비교한다. 하지만 계속 진행하기 위해서는 이전 실행의 결과가 필요하다. 이를 실제 실행 결과가 아니라 직접 주입시켜서 사용하도록 하는 것이다. 따라서 실제 실행 없이 테스트가 가능하고, 이부분이 테스트 작성자가 개입하게 되는 부분이다.

```ts
expect(iterator.next({ secret: 't4lz0mf4lt' }).value).toEqual(
  call(callApiForFetchUser, { param1: 'param1', param2: 'param2' })
);
expect(iterator.next({ name: 'nukeguys', level: 'vip' }).value).toEqual(
  put(
    setUserInfoAction({
      login: true,
      user: { name: 'nukeguys', level: 'vip' },
    })
  )
);
```

**4. 실행 완료**  
done값으로 generator가 최종적으로 이상없이 완료되었음을 확인한다.

```ts
expect(iterator.next().done).toBeTruthy();
```

위에서 언급한 것처럼 이런 방식은 구현 자체에 의존적이기 때문에 구현이 변경되면 테스트도 함께 수정이 필요해진다. 또 주입된 코드에 의해 문제가 있어도 테스트를 통과하는 경우가 발생할 수도 있다. 따라서 필요시에는 최종 결과만을 확인하는 테스트가 필요할 수 있다. 이 경우에는 mocking을 통해 saga를 실제로 실행하고 완료한 후에 확인을 한다. 하지만 saga 내부 로직을 대체하기가 생각보다 까다로운 경우가 많다. 장단이 있기 때문에 두 가지 방법을 적절히 조합해서 사용하는 것이 좋아 보인다. 기회가 되면 두번째 방법도 정리해 볼 예정이다.

### 참고

[3.10 Examples of Testing Sagas · Redux-Saga](https://redux-saga.js.org/docs/advanced/Testing.html)
