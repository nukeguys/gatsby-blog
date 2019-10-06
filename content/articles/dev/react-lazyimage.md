---
title: 'react lazyloading 이미지 컴포넌트 구현하기'
date: '2019-10-06T11:39:02'
description: 'intersection observer와 CustomEvent 사용기'
category: 'dev'
tags: [react, lazyload, image, intersection-observer]
---

웹의 성능을 올리는 데는 다양한 방법들이 있다. 렌더링을 최적화 하거나 리소스 크기를 최소화 한다. 그리고 가능하다면 리소스의 사용이나 로딩을 필요한 시점까지 연기하거나 비동기로 처리한다. 웹에서 사용하는 리소스들 중 많은 크기를 차지하는 것 중의 하나가 이미지이다. 아무리 최적화를 하고 크기를 줄이더라도 이미지 수가 어느정도 증가하면 로딩에 오랜 시간이 걸릴 수 밖에 없다. 이를 방지하기 위해 ATF[^1] 영역만 먼저 로딩 하고 나머지는 필요한 시점에 로딩시키는 lazyloading을 많이 사용한다.

웹에서 이미지를 lazyloading 시키는 방법도 여러가지가 있는데 구글 개발자 사이트([이미지 및 동영상의 지연 로딩](https://developers.google.com/web/fundamentals/performance/lazy-loading-guidance/images-and-video/?hl=ko))에 보면 관련된 설명을 개념부터 방법까지 친절하게 해주고 있다.

이 중에서 적용이 쉽고 여러모로 편리한 `intersection observer`를 사용하는 방법을 정리해 본다.

`intersection observer`는 MDN([Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API))에서 확인해도 되고, 구글에 검색하면 친절하게 설명되어 있는 글들이 많다. 간단히 설명하면 이름에서 알 수 있듯이 지정된 영역에 대해 교차(intersection) 했는지를 감지하고 해당 시점에 원하는 작업을 할 수 있게 해준다. 안타깝게도 모든 버전의 브라우저에서 지원하지 않고 특히 IE에서는 지원조차 하지 않는다. 다행히 W3C에서 [polyfill](https://github.com/w3c/IntersectionObserver/tree/master/polyfill)을 지원해 준다. 하지만 브라우저마다 동작이 조금씩 다를 수 있다고 하니 주의해서 사용하자.

`intersection observer` 사용을 위해서는 observer 객체를 생성하고 lazyloading을 적용할 이미지를 등록 시켜야 한다. 지정된 영역안으로 들어올 때 뿐 아니라 나갈 때도 callback이 호출되기 때문에 `isIntersecting` 값이 true일 때만 처리 하고, 로드한 후에는 감시할 필요가 없기 때문에 등록을 해제해 주어야 한다.

```ts
const Image = ({ src }: IProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver>();
  const [isLoad, setIsLoad] = useState(false);

  function onIntersection(
    entries: IntersectionObserverEntry[],
    io: IntersectionObserver
  ) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        io.unobserve(entry.target);
        setIsLoad(true);
      }
    });
  }

  useEffect(() => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(onIntersection);
    }

    imgRef.current && observerRef.current.observe(imgRef.current);
  }, []);

  return <img ref={imgRef} src={isLoad ? src : placeHolder} />;
};
```

전체 코드와 동작은 아래에서 확인할 수 있다. 눈으로 확인할 수 있도록 `threshold`를 0.5로 설정했다. 즉 이미지의 절반이 화면에서 나타날 때 로드된다. 스크롤을 천천히 내리면서 확인해보자.

https://codesandbox.io/embed/lazyloading-image-59dxt?autoresize=1&fontsize=14&module=%2Fsrc%2FImage.tsx

위의 방식도 동작엔 문제가 없지만, 각 Image 컴포넌트 마다 `IntersectionObserver`를 생성하고 있다. 성능상 얼마나 큰 차이가 있을지는 벤치마킹을 해봐야겠지만 이미지가 많은 경우 매번 생성을 하는건 비효율 적으로 보인다. 따라서 전역적으로 하나만 두고 계속 사용하도록 수정하는 것이 좋아보인다.

우선 observer를 컴포넌트 밖으로 분리하자.

```ts
const Image = ({ src }: { src: string }) => {
  // ...
  useEffect(() => {
    if (!observer) {
      observer = new IntersectionObserver(onIntersection);
    }

    imgRef.current && observer.observe(imgRef.current);
  }, []);
  // ...
};
let observer: IntersectionObserver | null = null;
```

하지만 이렇게 하면 IntersectionObserver 생성시 사용한 `onIntersection` 함수는 첫번째 이미지 내부 함수기 때문에 다른 이미지들에 대해서는 제대로 동작하지 않는다. 따라서 onIntersection도 밖으로 분리한다. 이렇게 분리하다 보면 한가지 문제가 생긴다. `setIsLoad`는 컴포넌트의 내부에서만 사용가능하기 때문이다. 그래서 함수 외부에서도 호출가능한 방법을 찾아야 한다. 난 `CustomEvent`를 사용해서 처리했다. CustomEvent는 이름처럼 event를 직접 정의해서 사용할 수 있도록 해준다. 마찬가지로 모든 브라우저 버전에서 지원하지 않으니 주의하고, [MDN](https://developer.mozilla.org/ko/docs/Web/API/CustomEvent/CustomEvent)에서 IE에서 사용가능한 polyfill도 제공하니 확인 후 사용하자.
`CustomEvent`는 이벤트 타입을 정한 후에 다른 이벤트와 동일하게 `addEventListener`를 통해 callback을 등록하고, `dispatchEvent` 호출하면서 해당 이벤트 타입의 객체를 전달하면서 이벤트를 발생시킨다.

```ts
const Image = ({ src }: IProps) => {
  //  ...
  useEffect(() => {
    function loadImage() {
      setIsLoad(true);
    }
    const imgEl = imgRef.current;
    imgEl && imgEl.addEventListener(LOAD_IMG_EVENT_TYPE, loadImage);
    return () => {
      imgEl && imgEl.removeEventListener(LOAD_IMG_EVENT_TYPE, loadImage);
    };
  }, []);

  // ...
  return <img ref={imgRef} src={isLoad ? src : placeHolder} />;

  let observer: IntersectionObserver | null = null;
  const LOAD_IMG_EVENT_TYPE = 'loadImage';

  function onIntersection(
    entries: IntersectionObserverEntry[],
    io: IntersectionObserver
  ) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        io.unobserve(entry.target);
        entry.target.dispatchEvent(new CustomEvent(LOAD_IMG_EVENT_TYPE));
      }
    });
  }
};
```

최종 코드와 동작은 아래에서 확인하자.

https://codesandbox.io/embed/image2-v7ii7?autoresize=1&fontsize=14&module=%2Fsrc%2FImage.tsx

처음 lazyloading을 구현할 땐 라이브러리도 고려해보고 방법도 많이 찾아봤었다. 그리고 지금은 위의 방법과 비슷하게 직접 구현해서 사용하고 있다. 코드양은 얼마 되지 않지만 결과를 내는데 까지 적지 않은 시간과 노력을 들였고 그만큼 결과적으로 만족스럽다. (뭐든지 처음이 어렵지...) 조금 더 나은 웹을 위해 하나씩 더 알아가보자.

[^1]: Above-The-Fold의 약자로 가판대에 접혀있는 신문의 보이는 영역을 의미하는데서 시작되었다. 사용자가 처음 진입했을 때 보이는 기본 영역을 의미한다. (참고: [Above the Fold란?](https://m.blog.naver.com/PostView.nhn?blogId=beusable&logNo=220887404946&proxyReferer=https%3A%2F%2Fwww.google.com%2F))
