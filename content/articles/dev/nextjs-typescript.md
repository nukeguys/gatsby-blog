---
title: 'next.js에 커스텀 타입 사용'
date: '2020-09-27T23:29:50'
description: '_app과 페이지 컴포넌트에 타입 추가하기'
category: 'dev'
tags: [nextjs, typescript]
---

next.js는 기본적으로 typescript를 지원하고 있기 때문에 typescript를 설치하는 것만으로 쉽게 사용이 가능하다. next.js의 정해진 룰 안에서만 사용한다면 아무런 문제가 되지 않지만 만약 그렇지 않다면 type 또한 같이 수정이 필요하다.

해보면 어렵지 않지만 막상 하려면 살짝 귀찮음이 생긴다. [with-typescript](https://github.com/vercel/next.js/tree/canary/examples/with-typescript) 예제로 한 단계씩 수정을 하면서 커스텀 타입을 정의하는 법을 정리해 본다.

일단 예제 파일을 받아서 열어보자.

```bash
npx create-next-app --example with-typescript with-typescript-app
# or
yarn create next-app --example with-typescript with-typescript-app
```

작업을 할 대상은 pages/index.tsx 파일이다. 여기에 next에서 제공하는 [pre-rendering](https://nextjs.org/docs/basic-features/pages#pre-rendering)을 적용한다고 가정해보자. 여기선 `getInitialProps`를 사용한다.

```ts
import Link from 'next/link';
import Layout from '../components/Layout';

const IndexPage = () => (
  <Layout title="Home | Next.js + TypeScript Example">
    <h1>Hello Next.js 👋</h1>
    <p>
      <Link href="/about">
        <a>About</a>
      </Link>
    </p>
  </Layout>
);

IndexPage.getInitialProps = () => {};

export default IndexPage;
```

아직은 아무런 type이 적용되어 있지 않다. 그래서 `IndexPage.`을 입력해도 intellisense에 `getInitialProps`를 볼 수는 없다. 하지만 nextjs에서는 페이지를 담당하는 컴포넌트를 위한 `NextPage` 타입을 제공하고 있고 적용하고 다시 타이핑을 해보면 `getInitialProps`가 나오는 것을 볼 수 있다. 하지만 위의 코드는 에러가 나고 있다. 이유는 `getInitialProps`의 타입이 객체를 반환하도록 되어 있기 때문이다. 그래서 일단 빈 객체를 반환하도록 수정한다.

```ts
const IndexPage: NextPage = () => (
  <Layout title="Home | Next.js + TypeScript Example">
    <h1>Hello Next.js 👋</h1>
    <p>
      <Link href="/about">
        <a>About</a>
      </Link>
    </p>
  </Layout>
);

IndexPage.getInitialProps = () => ({});

export default IndexPage;
```

`NextPage`와 관련된 타입을 한 번 확인해보자.

```ts
export type NextPage<P = {}, IP = P> = NextComponentType<
  NextPageContext,
  IP,
  P
>;

export declare type NextComponentType<
  C extends BaseContext = NextPageContext,
  IP = {},
  P = {}
> = ComponentType<P> & {
  /**
   * Used for initial page load data population. Data returned from `getInitialProps` is serialized when server rendered.
   * Make sure to return plain `Object` without using `Date`, `Map`, `Set`.
   * @param ctx Context of `page`
   */

  getInitialProps?(context: C): IP | Promise<IP>;
};
```

`NextPage`는 다시 `NextComponentType`를 사용하고 `NextComponentType`는 `ComponentType`과 `getInitialProps`를 포함하고 있는 것을 알 수 있다. 조금 더 구체적으로 보면 컴포넌트의 props의 타입인 `P`, `getInitialProps`의 매개변수 타입 `C(NextPageContext)`와 반환 타입인 `IP`를 확인할 수 있다. 그리고 `NextPage`에서 props의 타입 `P`만 입력하면 이를 `IP`로도 함께 사용하는 것을 볼 수 있다. 즉 `getInitialProps`의 반환 타입을 컴포넌트 props의 타입과 동일하게 한다. (nextjs에서 기본적으로 `getInitialProps`의 반환 값을 각 페이지 컴포넌트에 `props`로 넣어준다.)

이제 위 예제에 있는 `title(Home | Next.js + TypeScript Example)`과 링크 텍스트인 `About`을 `getInitialProps`를 통해 받아온다고 가정하고 코드를 수정해보자.

```ts
interface Props {
  title: string;
  text: string;
}

const IndexPage: NextPage<Props> = ({ title, text }) => (
  <Layout title={title}>
    <h1>Hello Next.js 👋</h1>
    <p>
      <Link href="/about">
        <a>{text}</a>
      </Link>
    </p>
  </Layout>
);

IndexPage.getInitialProps = () => ({
  title: 'Home | Next.js + TypeScript Example',
  text: 'About',
});

export default IndexPage;
```

`Props` 인터페이스를 정의하고 이를 사용해서 `NextPage<Props>`로 지정해준다. 그러면 `getInitialProps`의 반환 타입과 `IndexPage`의 매개변수에 타입이 함께 잡히는 것을 볼 수 있다. 타입을 사용하지 않았을 때 보다 실수할 가능성이 없고 명확해졌다.

다음으로는 `title`의 일부를 `App`을 통해서 받아와서 사용해야 하는 경우라고 가정해보자. `redux`를 함께 사용한다면 `getInitialProps`에서 store에 접근해야 하는 경우가 잦은데, 이럴 때 여러 가지 방법이 있겠지만 [next-redux-wrapper](https://github.com/kirill-konshin/next-redux-wrapper)를 사용하면 편하다. 실제로 `next-redux-wrapper`는 `getInitialProps`의 파라미터로 `store`를 넘겨준다. 물론 타입 정의도 지원하는데 `declare module`을 사용해서 기존 `NextPageContext`에 `store`를 추가해주고 있다.

```ts
declare module 'next/dist/next-server/lib/utils' {
  interface NextPageContext<S = any, A extends Action = AnyAction> {
    /**
     * Provided by next-redux-wrapper: The redux store
     */
    store: Store<S, A>;
  }
}
```

지금은 `title`을 받는 경우를 대비해 타입을 정의해보자. 우선은 `getInitialProps`의 매개변수 타입을 확장해야 한다. 기존의 `NextPageContext`을 확장해서 `title`을 추가한다. (타입을 정의하는데 `interface`나 `type`을 사용할 수 있다. 지금은 `type`을 사용한다.)

```ts
export type MyPageContext = NextPageContext & {
  title: string;
};
```

다음으로는 해당 타입을 사용하는 컴포넌트의 타입을 정의한다. 여기서 `NextPage`를 확장할 수는 없다. 왜냐하면 `NextPage`는 `NextPageContext`를 사용하고 있고 변경할 수 없기 때문이다. 정의한 `MyPageContext`를 사용하려면 `NextComponentType`을 사용해야 한다. 기본적으로 동일한 형태에 `MyPageContext`만 변경했지만, getInitialProps 외에 추가적인 커스텀 속성을 정의해서 사용한다면 추가한다.

```ts
export type MyPage<P = {}, IP = P> = NextComponentType<MyPageContext, IP, P>;
```

이렇게 정의한 `MyPage`를 컴포넌트에 적용해보면, `getInitialProps`의 매개변수에도 `title`이 잡히는 걸 볼 수 있다.

```ts
interface Props {
  title: string;
  text: string;
}

const IndexPage: MyPage<Props> = ({ title, text }) => (
  <Layout title={title}>
    <h1>Hello Next.js 👋</h1>
    <p>
      <Link href="/about">
        <a>{text}</a>
      </Link>
    </p>
  </Layout>
);

IndexPage.getInitialProps = ({ title }) => ({
  title,
  text: 'About',
});

export default IndexPage;
```

하지만 실제로 동작하기 위해서는 `getInitialProps`로 `title`을 넣어주는 과정이 필요하다.

이를 위해서는 [Custom App](https://nextjs.org/docs/advanced-features/custom-app)을 정의해서 사용해야 한다.

```ts
function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);
  return { ...appProps };
};

export default MyApp;
```

위의 기본 예제를 변형해서 `App`에서 컴포넌트의 `getInitialProps`로 `title`을 넘겨주도록 해본다. 우선 `App.getInitialProps`대신 컴포넌트의 `getInitialProps`를 직접 호출한다. 그리고 `title`을 넘겨주면 된다. 하지만 타입 검사에서 실패한다.

이유를 알기 위해서는 `AppContext`를 확인할 필요가 있다.

```ts
export declare type AppContext = AppContextType<Router>;

export declare type AppContextType<R extends NextRouter = NextRouter> = {
  Component: NextComponentType<NextPageContext>;
  AppTree: AppTreeType;
  ctx: NextPageContext;
  router: R;
};
```

`AppContext`의 `Component`는 위에서 만든 `MyPageContext`를 사용하지 않고 있다. 이를 위해서는 `AppContext`대신 별도의 타입을 정의해 주어야 한다. 모두 다시 정의해도 되지만 기존 속성을 활용하기 위해 필요한 속성만 새로 정의한다.

```ts
export type MyAppContext = Omit<AppContext, 'Component' | 'ctx'> & {
  Component: MyPage;
  ctx: MyPageContext;
};
```

그리고 타입을 사용해서 `title`을 넣어준다.

```ts
MyApp.getInitialProps = async (appContext: MyAppContext) => {
  appContext.ctx.title = 'Home';
  const appProps = await App.getInitialProps(appContext);
  return { ...appProps };
};
```

주의할 점은 `App.getInitialProps`을 사용하고 `MyAppContext`에서 `ctx`의 타입을 변경하면서 `appContext`의 `ctx`에도 `title`이 있는 것으로 잡히기 때문에 실제로 추가 없이 그대로 전달해도 문제가 되지 않는다. `_app`에서 한 번만 처리하고 순서상으론 반대이기 때문에 누락될 위험이 크진 않지만 이것도 명확하게 해 주기 위해서는 `MyAppContext`에서 `ctx`를 그대로 사용하고 아래처럼 해줄 수 있다.

```ts
export type MyAppContext = Omit<AppContext, 'Component'> & {
  Component: MyPage;
};

MyApp.getInitialProps = async ({ Component, ctx }: MyAppContext) => {
  const pageProps = await Component.getInitialProps?.({
    ...ctx,
    title: 'Home',
  });

  return { pageProps };
};
```

실제로 이렇게 까지 사용하는 경우가 얼마나 될지는 모르겠지만, 필요한 경우라면 타입을 명확하게 정의해서 추가적인 검사 코드를 사용하지 않도록 할 수 있어 도움이 되지 않을까 싶다.
