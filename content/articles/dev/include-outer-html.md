---
title: '리액트에 외부에서 만든 웹페이지 삽입하기'
date: '2020-01-06T00:18:39'
description: '외부 웹페이지 로딩 & 자바스크립트 실행하기'
category: 'dev'
tags: [react, js, dangerouslySetInnerHTML, createContextualFragment, eval]
---

일정을 맞추기 위해 일부 웹페이지에 외부의 도움을 받기로 했다. 프로젝트를 공유해서 작업하는 방식이 아닌 별도의 웹페이지를 제작하면 현재 프로젝트의 특정 화면에 html을 그대로 삽입해서 보여주는 방식이다. 이를 처리하는 과정에서 직면한 문제와 돌고돌아 생각보다 간단하게 해결만 방법을 정리해본다.

추가해야 할 페이지(outer_html)는 이미 알고 있다고 하면 현재 페이지의 하나의 탭 화면으로 추가해야 한다면 어떻게 해야 할까.

첫 번째 구현방식은 [shadow DOM](https://developer.mozilla.org/ko/docs/Web/Web_Components/Using_shadow_DOM)을 사용하는 것이었다. `shadow DOM`은 간단히 DOM안에 포함되어 있지만 캡슐화 된 DOM이라고 할 수 있다. 예를 들어 다른 누군가가 만든 컴포넌트 또는 코드를 가져다 사용한다고 하면 겹침이 발생할 가능성이 있다. 이럴 때 class명에 prefix를 지정한다거나 하는 방식으로 가능하겠지만 shadow DOM을 사용하면 해당 DOM에서 사용된 style은 외부에 영향을 주지 않도록 하면서 자유롭게 작업이 가능하다. 처음 이 방법을 적용했을 때 `<script>` 태그의 실행이 되지 않아 별도 처리가 필요했다.(마지막 방식을 적용해면서, 다시 해보면 될 것 같다는 생각을 했다.) 그리고 다음 방법을 적용해봤다.
아래처럼 React에 shadow DOM을 만들어주는 component를 만들고 필요한 곳에서 가져다 사용하도록 했다.

```ts
<ShadowDom html={outer_html} />
```

두 번째는 `dangerouslySetInnerHTML`를 상용해서 코드를 그대로 표시할 DOM하위에 추가하는 것이었다. 물론 위에서 언급한 것 처럼 style의 중첩 등이 발생할 수 있지만 내부에서 진행한데다 크게 문제되지 않을 것 같다는 판단에 간단한 방법으로 처리했다. 위와 비슷한 정도지만 `ShadowDom` 컴포넌트를 사용하지 않는다는 점이 다르다.

```ts
<div dangerouslySetInnerHTML={{ __html: outer_html }} />
```

하지만 여기에도 문제가 하나 있었다. 동일하게 CSR(Client Side Rendering)시에 외부 페이지에 있는 `<script>`가 실행되지 않는 것이었다. 하지만 SSR(Server Side Rendering)시에는 정상적으로 실행이 되고 있었다. 원인을 찾다가 알게 된 것들을 정리해 본다. (대부분 보안상의 이유로, 정확한 내용들은 찾아보면 금방 알 수 있다.)

> 1. innerHTML로 추가하면 script는 동작하지 않는다.
> 2. script태그에 dangerouslySetInnerHTML로 스크립트를 입력하면 동작하지만, DOM을 추가하면 그 내부의 스크립트는 실행되지 않는다.
> 3. 동적으로 추가한 DOM 내부의 script를 수행하려면 `createContextualFragment`라는 것을 사용하면 된다.

세 번째는 위에서 알게 된 [createContextualFragment](https://developer.mozilla.org/en-US/docs/Web/API/Range/createContextualFragment)를 사용하는 것이었다. 아직 정확한 내용은 파악하지 못했지만 비슷한 상황에서 사용하면 된다는 [내용](https://github.com/facebook/react/issues/8838#issuecomment-348860974)을 보고 적용해 봤다. 리액트에 적용하는 것이어서 마운트 된 이후에 처리되도록 `useEffecrt`내에서 적용헀다. `containerRef`는 코드를 추가하기 위해 미리 만들어 둔 element의 reference이다.

```ts
const range = document.createRange();
const containerEl = containerRef.current;
if (containerEl) {
  range.selectNode(containerEl);
  const fragment = range.createContextualFragment(outer_html);
  containerEl.appendChild(fragment);
}
```

web API인데다 사용하는 코드들도 발견했고 호환성도 충분한 듯해서 적용했고 동작도 정상적으로 됐다. 허나 고려하지 못한 부분이 하나 있었다. 외부 코드를 추가하는 페이지를 정적파일을 생성해서 서비스하고 있다는 것이었다. 마운트 된 이후에 DOM을 추가하다보니 SSR시에는 서버에서 빈페이지를 보내는데 이 결과가 정적파일로 만들어지고 있기 때문에 굳이 정적파일로 서비스하는 의미가 없어진 것이다. 그래서 SSR과 CSR을 구분해서 처리할 필요가 있었다. 그래서 SSR시에는 두 번째 방법을 유지하고 CSR시에는 마운트 이후에 해당 DOM을 제거하고 세 번째 방법으로 새로 추가하는 것이다. 적용하고 동작하는 것은 확인까지 했으나 아직 확실하게 파악하지 못한데다 곧 실서비스가 되어야 하는 상황에 좀 더 안전한 방법을 찾았다.

마지막으로는 좀 더 간단하게 방법을 찾았다. 문제가 되는 부분은 해당 CSR시 DOM의 `<script>`태그가 실행이 되지 되지 않는다는 것이다. (SSR시에는 server에서 이미 DOM에 포함되어 내려오기 때문에 브라우저 입장에서는 원래 있는 코드와 다르지 않기 때문에 정상적으로 실행되는 것이다.) 그래서 단순히 CSR시에 해당 마운트 된 이후에 DOM에 있는 script를 수동으로 호출해 주면 해결될 수 있었다.(좀 더 복잡한 상황에서는 어떨지 모르겠다.)

```ts
const containerEl = containerRef.current;
if (containerEl) {
  const scripts = containerEl.getElementsByTagName('script');
  for (const script of scripts) {
    window.eval(script.innerHTML);
  }
}
...
return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: outer_html }}
    />
  );
```

useEffect에서 CSR인 경우에 `containerRef`의 하위에 있는 script를 찾아서 `eval`을 호출해 주는 것으로 실행해주는 효과를 본다.(eval 대신 new Function(script)를 실행할 수도 있다.)

최종적으로 적용해 놓고 보니 생각보다 간단한 방법인데 돌고 돌아 왔다는 생각이 들었다. 물론 삽질로 많이 배우듯이 짧은 시간 그 과정에서 많은걸 알게 되었기 때문에 좋은 경험이었다. 아직 좀 더 다양한 경우와, 정확하게 이해를 하지 못해 부족한 부분이 있을 수도 있겠지만 일단은 동작은 충분했고, 결과는 곧 나올 예정이다.

어느 덧 2019년이 지나고 2020년도 빠르게 지나고 있다. 하루라도 빨리 2019년의 회고를 작성하고 싶지만 워낙 바쁜데다 급하게 작성하고 싶지 않아, 조금 더 뒤로 미루기로 했다. 어서 프로젝트가 잘 마무리되고 여유가 생겨서 찬찬히 돌아볼 수 있는 시간을 가질 수 있었으면 좋겠다.
