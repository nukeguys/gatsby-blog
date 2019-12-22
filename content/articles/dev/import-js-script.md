---
title: '웹 페이지에 javascript 포함시키기'
date: '2019-12-22T20:24:58'
description: '외부 js파일을 로드하고 실행하는 여러가지 방법들'
category: 'dev'
tags: [script, async, defer]
---

웹 페이지들을 개발하다 보면 외부 라이브러리를 비롯한 여러 js파일들을 포함시켜야하는 경우가 많다. 크기자 작은 파일들은 문제가 되지 않을 수도 있지만, 조금이라도 웹의 성능을 높이기 위해서는 목적에 따라 로드하고 실행하는 시점을 다르게 가져가야 할 필요가 있다. 사용 목적에 따라 js 파일을 포함하는 방법을 정리해 본다.

## 1. 최우선으로 로드되어야 하는 경우

일반적으로 `<script>`태그로 포함된 js파일은 기술된 순서대로 로드가 된다. 문서를 파싱하는 과정에서 script 태그를 만나면 파싱을 멈추고 스크립트를 로드하고 실행한 후에 이어간다. 따라서 그 만큼 지연이 생기된다. 보통 렌더링 보다는 기능적인 부분을 담당하는 경우가 많을 것으로 예상되지만, 경우에 따라 웹페이지 로드보다 우선해서 실행되어야 한다면 이 스크립트는 `<head>`내에 정의하면 된다. 아래의 예를 보면 스크립트를 다운로드하고 실행하기 전까지 아래에 있는 내용이 화면에 표시되지 않는다. 즉, 그만큼 사용자에 대한 응답시간이 길어지게 되는 셈이다. 꼭 필요한 상황이 아니라면 다음에 나오는 방식으로 상황에 따라 적절한 지연으로 웹페이지 성능을 올려보자.
```js
<head>
<script src='https://external_script.js'/>
</head>
<body>
<p>스크립트 실행 후에 보이는 내용</p>
</body>
```

## 2. 웹 페이지 로드 전까지 지연 시키기

고전적인 방식으로 `<head>` 대신 `<body>`태그의 마지막에 `<script>`태그를 추가하게 되면 html 파싱이 완료된 후에 js의 로딩 및 실행이 이뤄진다. 따라서 병목없이 웹 페이지를 해석하고 빠르게 보여주게 된다.
```js
<body>
<script src='https://external_script.js'/>
</body>
```
이 방법은 오래됐지만 그 만큼 브라우저 호환 걱정 없이 효과적으로 사용할 수 있다. 굳이 빠르게 로드할 필요가 없는 파일이라면 이렇게만 해도 충분히 효과를 볼 수 있다. 하지만 위의 경우와 반대로 html을 모두 파싱하고 난 후에야 js파일이 로드되기 때문에 사용자와 인터랙션을 담당하는 역할을 하는 등의 스크립트라면 처음 그려지는 것만 빠를 뿐 반응 자체는 동일하게 딜레이가 생기게 된다. 인터넷이 빠른 환경에서는 괜찮지만 그렇지 않은 환경에서는 여전히 문제가 될 수 있다.


## 3. `defer` 다운은 빠르게 실행은 순서대로

`<script>`태그에 `defer` 속성을 사용하게 되면 파싱을 멈추지 않고 다운로드와 병행하게 된다. 이후 해석이 완료되고 `DOMContentLoaded` 이벤트 발생 전에 스크립트를 `순서대로` 실행한다.

```js
<head>
<script>
document.addEventListener('DOMContentLoaded', () => alert("defer 스크립트 실행 후 호출"));
</script>
<script defer src='https://external_script.js'/>
</head>
<body>
<p>스크립트 실행 전에 보인다.</p>
</body>
```
위의 코드에서는 아래 script 태그를 만나도 파싱이 그래도 이어지면서 다운로드를 받고, 파싱이 완료된 후에 스크립트를 실행한다. 그리고 나서 alert가 표시된다.
만약 스크립트가 두 개 이상 포함된다면 브라우저는 병렬적으로 스크립트를 다운로드 받는다. 그렇게 되면 순서에 상관없이 크기가 작은 스크립트의 다운로드가 먼저 완료된다. 하지만 실행 자체는 기술된 순서대로 이루어 진다. 즉 실행순서에 의존적인 스크립트들을 포함해야 한다면 `defer`를 사용하면된다. 주의할 점은 defer는 외부 스크립트에만 사용할 수 있다는 점이다.(src 속성이 없는 스크립트에서는 무시된다.)

## 4. `async` 비동기로 다운 받고 바로 실행

`async`속성을 주면 defer와 다르게 순서에 의존적이지 않고 `DOMContentLoaded` 이벤트와도 서로 의존적이지 않게 의미 그대로 비동기적으로 스크립트를 실행한다. 즉 파싱을 멈추지 않고 다운로드를 진행하고 다운이 완료된 스크립트를 바로 실행한다. 단, 실행하는 동안은 문서의 파싱이 멈추게 된다.
```js
<script async src='https://external_script_big.js'/>
<script async src='https://external_script_small.js'/>
```
위와 같은 경우에 defer라면 파싱이 모두 끝난 뒤에 `external_script_big.js`가 먼저 실행되고 이후 `external_script_small.js`가 실행된다. 하지만 async로 선언된 경우에는 크기가 작은 `external_script_small.js`가 먼저 다운로드가 끝나면 실행도 먼저 이루어진다.
따라서 `async`는 다른 스크립트에 종속적이지 않고 실행 시점을 정확하게 알 필요가 없는 파일의 경우에 유용하게 사용할 수 있다(예를 들면 ga나 광고 같은 경우). 만약 비동기로 로드하되 순서대로 실행하고 싶다면 `async=fase(기본값 true)`를 사용할 수 있다.
마찬가지로 외부 스크립트에만 적용된다.
추가로 동적으로 element를 생성해서 추가하는 경우에는 `async`가 기본적으로 적용된다. 따라서 순서에 의존적으로 실행되어야 하는 경우에는 `async=false`를 명시적으로 선언해 주자.

일반적으로 script가 `</body>`앞에 존재하는 경우라면 `async`나 `defer`효과가 크지 않을 수 있다. 그 때 쯤이면 문서의 모든 파싱이 끝난 상태이기 때문에 지연시키는 것이 큰 의미가 없을 수 있기 때문이다. 그러나 head에 모아 두거나 동적으로 추가하는 경우라면 적절하게 지연시킬 필요가 분명히 있다.
만약 다른 파일에 종속적이지 않고 DOM과 상관없이 실행되어도 괜찮다면 `async`를, DOM이 관련해 실행순서가 중요하다면 `defer`를 사용하면된다.  
한 가지 주의할 점은 대부분의 브라우저를 지원하긴 하지만 모든 브라우저에서 지원하지 않는다는 점이다.(역시나 IE가 한 몫 한다)  
만약 async와 defer가 모두 선언되어 있다면, `async > defer`의 순서로 적용이 된다. 즉 async가 지원되는 브라우저는 async로 동작하고 그렇지 않다면 defer로, 먄약 defer도 지원하지 않으면 동기적으로 스크립트를 실행하게 된다.

**참고**  
[async vs defer attributes - Growing with the Web](https://www.growingwiththeweb.com/2014/02/async-vs-defer-attributes.html#script)  
[\<script> - HTML: Hypertext Markup Language \| MDN](https://developer.mozilla.org/ko/docs/Web/HTML/Element/script)  
[Scripts: async, defer](https://javascript.info/script-async-defer)