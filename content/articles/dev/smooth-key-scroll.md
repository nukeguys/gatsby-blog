---
title: 'smooth key scroll 구현하기'
date: '2020-03-01T18:38:49'
description: '키보드를 이용해 부드러운 스크롤 동작시키기'
category: 'dev'
tags: [scroll]
---

대개의 브라우저에서 방향키로 스크롤을 하면 뚝뚝 끊겨서 이동이 된다. 보통은 크게 상관이 없지만 컨텐츠를 소비하는 화면이라면 사용성 경험적으로 좋지 못하다.(물론 마우스로는 가능하나 키보드를 사용하는 경우에 한정된 경우다) 이를 개선하기 위해 뷰어에서 키보드로 이동하는 경우에도 smooth-scroll을 적용하기 위한 컴포넌트를 작성했었다. 시간은 좀 지났지만 정리해 본다.
(적용된 결과는 [여기](https://page.kakao.com/viewer?productId=50896822)에서 먼저 확인해보자.)

### 벤치마킹

역시나 바퀴의 재발명은 불필요하다는 생각에, 일단 smooth-scroll 기능을 제공하는 곳이 있는지 이미 구현되어 있는 오픈소스들이 있는지 확인 해 봤다. 여기저기 찾다가 도움이 될 만한 chrome extension 2개([smoothscroll](https://github.com/gblazex/smoothscroll), [smmothkeyscroll](https://github.com/franciscolourenco/smoothkeyscroll))를 발견했다. 하지만 extension으로만 제공해서 사용하기 불가능했기 때문에 참고해서 직접 구현하기로 결정하고 작업을 시작했다.

### 1. Queue를 사용한 가속도 처리

기본적인 아이디어는 키 이벤트가 발생하면 `발생 시간`과 `스크롤 거리`를 큐에 저장하고 `requestAnimationFrame`을 호출한다. 그러면 각 단계에서는 `스크롤 거리x(현재시간-발생시간)/한 번의 이벤트에 걸리는 시간`으로 현재 프레임에 이동할 거리를 구한 후 스크롤(`window.scrollBy`)한다. 그리고 최종적으로 해당 이벤트에 대한 이동이 끝났으면 큐에서 제거한다.  
이전 스크롤이 끝나기 전에 동일 방향의 이벤트가 다시 발생하면 큐에 새로 추가하고 각 프레임에서는 큐에 들어있는 모든 이벤트에 대해 위의 이동 거리를 계산 후 합해서 스크롤을 한다. 이렇게 되면 키를 계속 누르고 있는 경우에는 이벤트가 큐에 누적되기 때문에 가속이 발생하게 되고, 키를 다시 때게 되면 순차적으로 이벤트가 완료되면서 큐가 줄어들기 때문에 감속이 된다. 또한 한 번에 사용되는 시간이 정해져 있기 때문에 무한정 누적되지 않아 일정한 속도 이상은 늘어나지 않게 된다.

```ts
// ...
  _keydown = (event: KeyboardEvent) => {
    // ...

    let y: number = 0;

    switch (event.keyCode) {
      case KEY_CODE.UP:
        y = -scrollDistance;
        break;
      case KEY_CODE.DOWN:
        y = scrollDistance;
        break;
      default:
        return;
    }

    this._scrollArray(y);
    event.preventDefault();
  };

  _scrollArray(y: number) {
    this._directionCheck(y);

    this._que.push({
      scrollY: y,
      lastY: 0,
      start: Date.now(),
    });

    if (this._pending) {
      return;
    }

    const { animationTime } = this.props;

    const step = () => {
      const now = Date.now();
      let totalY = 0;

      for (let i = 0; i < this._que.length; i++) {
        const item = this._que[i];
        const elapsed = now - item.start;
        const finished = elapsed >= animationTime;

        const rate = finished ? 1 : elapsed / animationTime;
        const distY = (item.scrollY * rate - item.lastY) >> 0;

        totalY += distY;
        item.lastY += distY;

        if (finished) {
          this._que.splice(i, 1);
          i--;
        }
      }

      window.scrollBy(0, totalY);

      if (!y) {
        this._que = [];
      }

      if (this._que.length) {
        requestAnimationFrame(step);
      } else {
        this._pending = false;
      }
    };

    requestAnimationFrame(step);
    this._pending = true;
  }

  _directionCheck(y: number) {
    const direction = y > 0 ? DIRECTION.DOWN : DIRECTION.UP;
    if (this._direction !== direction) {
      this._direction = direction;
      this._que = [];
    }
  }
// ...
```

### 2. 고정거리 스크롤

위 방법으로 하면 가속도 처리가 되긴 하지만, 버벅임이 발생하는 문제가 있었다. 그래서 단순하게 테스트로 이벤트가 발생할 때 마다 일정한 거리를 이동하도록 해봤더니 훨씬 부드러운 스크롤이 됐다. 매 프레임마다 큐를 모두 확인하는 계산이 가볍지 않아서 일까 싶었고 부드러운 스크롤이 목표였기 때문에 가속은 굳이 필요하지 않았다.

최종적으로 키이벤트가 발생하면 방향에 따라 일정한 이동거리를 저장한다. 그리고 각 프레임에서는 저장된 거리만큼 스크롤을 시킨다. 훨씬 간단하지만 더 자연스럽게 동작했다.

참고로 처음 구현을 하고 나서도 가끔 끊기는 현상이 있었다. 아래에 주석처럼 키 이벤트에 대한 브라우저의 기본 스크롤 동작이 있기 때문에 함께 동작하면서 발생한 현상이었다. 기본 동작을 방지하기 위해서 `event.preventDefault();`를 호출해 주어야 한다.

```ts
// ...
  onKeyEvent = (event: KeyboardEventObject) => {
    // ...
    const newDirection =
      keyType === KeyboardKeyType.ArrowUp ? Direction.Up : Direction.Down;

    if (event.type === 'keydown') {
      // 호출하지 않으면 브라우저의 기본 스크롤 동작 때문에 끊기는 현상이 생긴다.
      event.preventDefault();
      this.scroll(newDirection);
    } else if (
      event.type === 'keyup' &&
      newDirection === this.scrollDirection
    ) {
      this.stop();
    }
  };

  scroll(direction: Direction) {
    this.scrollDirection = direction;
    const { scrollSpeed } = this.props;
    this.scrollDistance =
      this.scrollDirection === Direction.Up ? -scrollSpeed : scrollSpeed;
    if (!this.currentFrame) {
      this.currentFrame = requestAnimationFrame(this.step);
    }
  }

  stop() {
    this.scrollDirection = Direction.None;
    this.scrollDistance = 0;
    if (this.currentFrame) {
      cancelAnimationFrame(this.currentFrame);
      this.currentFrame = null;
    }
  }

  step = () => {
    this.currentFrame = requestAnimationFrame(this.step);
    if (window) {
      window.scrollBy(0, this.scrollDistance);
    }
  };
// ...
```

다시 최종 결과를 비교해서 확인해 보자.(참고로 내가 좋아하는 두 웹툰이다.)  
[네이버 만화, 신의 탑](https://comic.naver.com/webtoon/detail.nhn?titleId=183559&no=470) vs [카카오페이지, 나 혼자만 레벨업](https://page.kakao.com/viewer?productId=50896822)
