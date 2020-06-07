---
title: '쓸 때 마다 찾아보는 CSS selector'
date: '2020-06-07T22:37:47'
description: '알아두면 쓸모있는 신기한(?) CSS selector'
category: 'dev'
tags: [css, selctor]
---

자주 사용하지 않다보니, 더 정확히는 FE를 한지 오래되지 않아서 사용할 일도 많지 않아서 항상 사용할 때 마다 찾아보게 되는 것 중의 하나가 CSS selector다. 필요하면 이것저것 써보고 외워놓다가 안쓰면 또 잊어버리기를 반복한다.
최근 이것저것 작업을 하면서 또 찾아보게 된 CSS selector 들이 있다. 이제 머릿속에 넣어보자는 생각으로 기본적인 것들을 포함해 알아두어야 할 selector들을 정리해 본다.

만약 selector를 연습하고 싶을 땐 [CSS Diner](https://flukeout.github.io/)를 해보면 재미있다.

#### 기본적인 Selector

`selector-list`: 선택자들을 `,`로 구분해서 나열하면 매칭되는 모든 엘리먼트들을 선택한다.

```css
/* 태그로 선택 */
element {
}

/* 클래스로 선택 */
.class_name {
}
/* [class~=class_name] { }도 가능 */

/* id로 선택 */
#id_value {
}
/* [id=id_value] { }도 가능 */

/* 전체 선택 */
* {
}
```

#### Attribute Selector

attribute의 존재 여부 또는 값에 따라 선택한다. 다른 selector 뒤에 붙여서 함께 쓸 수 있다.

```css
/* 해당 attribute가 존재하는 경우 */
[attr] {
}

/* 값이 정확히 일치하는 경우(전체가 일치) */
[attr='value'] {
}

/* 값이 정확히 일치하는 경우(공백으로 구분되는 여러 값 중 일치하는 값이 존재) */
[attr~='value'] {
}

/* 값이 일치하거나, 위에 값이 -로 이어져 있는 경우 */
[attr|='value'] {
}

/* value로 시작하는 경우 */
[attr^='value'] {
}

/* value로 끝나는 경우 */
[attr$='value'] {
}

/* value(문자열)을 포함하는 경우 */
[attr*='value'] {
}
```

#### Combinator

seletor들을 결합해서 사용한다.

```css
/* former_element 다음에 바로 다음에 나오는 target_element*/
former_element + target_element {
}

/* former_element 다음에 나오는 target_element  */
former_element ~ target_element {
}

/* parent 바로 아래 자식인 child */
parent > child {
}

/* 의 자손인 descendant */
parent descendant {
}
```

#### Pseudo Class

특정한 상태를 만족할 때 선택된다. 워낙 다양해서 유용하지만 외우기 힘든 것들만 모아본다.

```css
/* 형제들 중 가장 먼저 나오는 엘리먼트(모든 자식들 중 첫번재) */
:first-child

/* 같은 타입의 형제들 중 가장 먼저 나오는 엘리먼트 */
:first-of-type

/* 형제들 중 가장 나중에 나오는 엘리먼트(모든 자식들 중 마지막) */
:last-child

/* 같은 타입의 형제들 중 가장 나중에 나오는 엘리먼트 */
:last-of-type

/* selector-list와 매칭 되지 않는 엘리먼트 */
:not(selector-list)

/* 형제들 중 위치가 nth(1부터 시작하는 정수, odd, even, an+b등)인 엘리먼트 */
:nth-child(nth)

/* 같은 타입의 형제들 중 위치가 nth인 엘리먼트 */
:nth-of-type(nth)

/* 형제들 중 뒤에서 부터의 위치가 nth인 엘리먼트 */
:nth-last-child(nth)

/* 같은 타입의 형제들 중 뒤에서 부터의 위치가 nth인 엘리먼트 */
:nth-last-of-type(nth)

/* 형제가 없는 엘리먼트(:first-child:last-child, :nth-child(1):nth-last-child(1)와 동일) */
:only-child

/* 같은 타입의 형제가 없는 엘리먼트 */
:only-of-type
```

#### 참고

[CSS selectors - MDN](https://developer.mozilla.org/ko/docs/Web/CSS/CSS_Selectors)  
[CSS Selectors - w3schools](https://www.w3schools.com/cssref/css_selectors.asp)  
[Selectors - css trikcs](https://css-tricks.com/almanac/selectors/)
https://code.tutsplus.com/ko/tutorials/  
[반드시 기억해야 하는 CSS 선택자 30개](the-30-css-selectors-you-must-memorize--net-16048)
