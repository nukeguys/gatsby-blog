---
title: '페이스북 댓글 플러그인 스크래핑하기'
date: '2019-08-25T00:25:07'
description: 'python + pyppeteer로 웹 스크래핑 맛 보기'
category: 'dev'
tags: [acrapping, crawling, python, pyppeteer, facebook, comment]
---

웹에 페이스북 플러그인을 붙여놓게 되면 데이터는 페이스북에 쌓이게 되고 다시 가져올 수가 없다. (데이터를 추출해서 별도로 저장하면 법적인 문제가 생긴다고 한다.)
그래서 페이스북 플러그인 대신 입맛에 맞게 UI를 변경하고 싶을 때는 페이스북에서 제공하는 [그래프 API](https://developers.facebook.com/docs/graph-api?locale=ko_KR)를 사용해야 한다.

```
https://graph.facebook.com/{object-id}/comments
or
https://graph.facebook.com/comments?id={object-id}
```

여기서 문제는 가져올 페이지의 `object-id`가 필요하다는 것이다.
별도로 알 수 있는 방법이 없어서(찾지 못했다...) 직접 찾아내야 한다. 플러그인에서 댓글의 작성시간을 누르면 새로운 페이지가 나오는데 여기에서 주소표시줄을 보면 `fb_comment_id`가 아래의 예시처럼 보인다.

```
&fb_comment_id=1234567890123456_2197257797049450
```

여기서 `_` 앞에 있는 `1234567890123456` 이 부분이 api 호출에 사용 할 `object-id`이다. 단순 하나라면 이정도면 충분하다. 하지만 플러그인이 붙어 있는 페이지가 수십 수백개가 넘는다면 일일히 손으로는 불가능하기 때문에 자동화를 할 필요가 생긴다.

위에서 말한 것 처럼 댓글의 작성일자를 눌렀을 때 `object_id`가 포함된 경로로 이동되기 때문에, 댓글의 작성일자 태그의 속성을 꺼내오면 될 것 같다. 그래서 간단히 해당 페이지를 긁어서 출력해보자.

```python
from urllib.request import urlopen

url = '...'
html = urlopen(url)
print(html.read().decode("utf-8"))
```

정작 댓글 내용은 보이지 않는다. 이유는 플러그인이 javascript가 실행되어야 하는데 request는 javascript 실행을 하지 못하기 때문이다. 코드를 조금 살펴보면 플러그인인 페이지에 iframe으로 추가되는 것을 알 수 있다. 그래서 iframe의 경로(`https://www.facebook.com/plugins/feedback.php?app_id=...`)로 다시 한 번 들어가 보면 정확하게 플러그인만 보이는 페이지가 나온다.

이 페이지를 긁어서 다시 출력해보면 역시나 댓글이 렌더링된 코드들이 보이지 않는다. 이 페이지에서도 로딩된 이후에 javascript를 통해 댓글을 렌더링 하고 있기 때문이다.(코드상 `requireLazy` 함수가 관련 있는 것으로 추측된다.)

그래서 렌더링이 될 때까지 기다려야 하는데 이를 위해서 [pyppeteer](https://miyakogi.github.io/pyppeteer/)를 사용한다. `pyppeteer`는 google에서 만든 headless chrome을 사용할 수 있게 해주는 node.js 라이브러리인 [puppeteer](https://pptr.dev/)를 python으로 porting한 모듈이다.
(대신 [Selenium](https://www.seleniumhq.org/)을 사용 할 수도 있다.)

```python
from pyppeteer import launch

url = '...'
browser = await launch()
page = await browser.newPage()
await page.goto(url)
await page.waitForSelector('.pluginSkinLight', {'timeout': 1000})
bodyHTML = await page.evaluate('() => document.body.innerHTML')
print(bodyHTML)
```

대략 위처럼 테스트해서 코드를 살펴보면 원하던 댓글들이 렌더링되어 있는 것을 볼 수 있다. 여기서 작성 시간에 있는 href만 찾아내면 된다.

가져온 html을 [Beautiful Soup](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)으로 파싱하면 손쉽게 원하는 태그에서 속성들을 추출할 수 있다.

하지만 잠시 wait하지 않던 코드를 살펴보자. `waitForSelector` 부분만 주석처리하고 출력된 코드를 보면, 댓글이 렌더링 되어 있지는 않지만 `script` 태그 안에 댓글들의 데이터가 얼핏 보인다. 그리고 혹시나 해서 object-id 값을 검색해보면 `targetFBID`라는 키로 값이 존재하는 것을 알 수 있다.

즉, 렌더링 되는 것을 기다리지 않고 필요한 데이터는 미리 알 수가 있는 것이다.(플러그인이 react로 작성되어 있는데 사용하는 상태값들이 아닐까 싶다.) 해당 값을 단순 string 매핑으로 찾아 낼 수도 있으나, 코드를 보면 javascript 함수(handleServerJS) 안에서 파라미터로 넘어가는 json 객체안에 데이터들이 포함되어 있다. 따라서 이 부분을 추출해서 json 객체로 변환하면 필요한 다른 데이터들도 추출하기가 쉬워진다.

```python
from pyppeteer import launch
import json
import re

pattern = re.compile(r'handleServerJS\(([^)]+)\)')

bodyHTML = await page.evaluate('() => document.body.innerHTML')
p = pattern.search(bodyHTML)
param = json.loads(p.group(1))
meta = param['require'][4][3][0]['props']['meta']
id = meta['targetFBID']
count = meta['totalCount']
```

간단히 정리한 코드기 때문에 자동화를 위한 입출력이나 예외처리, 속도를 조금 올리기 위해 asyncio등을 적용해주면 간단히 쓰기에는 충분해진다.
