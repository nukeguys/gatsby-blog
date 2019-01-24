---
title: '[TIL] GoAccess로 nginx access 로그 분석 겉핥기'
date: '2019-01-24T22:50:41'
description: '브라우저별 접속 통계 확인을 위한 GoAccess 사용기'
category: 'dev'
tags: [TIL, GoAccess, nginx, IE10]
---

MS에서도 엣지에 크로미움을 사용한다고 발표한 상황에서, 팀에서도 IE10을 더이상 지원하지 않기 위한 근거로 서비스 접속 대한 브라우저 통계가 필요했다.  
가이드를 통해 nginx의 access 로그와 [GoAccess](https://goaccess.io/)에 대해 알게 되었고 이를 사용하여 간단하게 로그 분석을 해봤다.
단순하게 사용만 해본 터라 깊이는 없지만 오랜만에 사용해본 쉘 명령어도 되짚어 볼 겸 간단하게 정리해 본다.

우선 서버에서 원격으로 접근 가능한 위치에 받아올 로그 파일을 미리 복사해 두고 scp를 통해 내려 받아 압축을 해제한다. (회사에서는 일주일 단위로 로그를 압축하여 백업하고 있었고, 실 서비스 서버이므로 로컬 PC로 로그파일을 내려 받아서 진행했다.)

```bash
# scp로 로그파일 내려받기
scp 계정@호스트:파일경로 저장할파일이름   # 원하는 파일만
scp -r 계정@호스트:폴더경로 ./ # 폴더 통째로

# gzip/gunzip으로 압축 해제하기
gzip -d access.log-xxxxxxxx.gz # (gunzip access.log-xxxxxxxx.gz) 원하는 파일만
gunzip -r ./accesslog # 폴더의 압축파일들을 한 번에 해제

```

로그파일이 준비됐으니 GoAccess를 설치한다.

```bash
brew install goaccess
```

GoAccess로 분석을 하기위해 로그파일의 포맷을 설정파일에 명시해야 한다. `time-format`, `date-format`, `log-format` 세 가지만 설정 해주고, 로그가 표준화된 형식일 경우 실행시에 옵션으로 넣어줘도 되는 듯 하다.  
미리 정의된 형식이 주석으로 있으니 해제하여 사용하거나 없으면 맞게 작성해주면 된다. 내 PC의 설정파일의 위치는 `/usr/local/Cellar/goaccess/1.2_1/etc/goaccess.conf`였다.

```bash
######################################
# Time Format Options (required)
######################################
time-format %H:%M:%S

######################################
# Date Format Options (required)
######################################
date-format %d/%b/%Y

######################################
# Log Format Options (required)
######################################
log-format %h - %^ [%d:%t %^]  "%r" %s %b "%R" "%u" %T "%^"
```

GoAccess를 사용하기 전에 필요한 로그를 가공 할 필요가 있었다.
[카카오페이지 웹](https://page.kakao.com)의 경우 PC와 모바일 버전이 다르고(당연히), 모바일의 경우 앱 내에서 호출하는 경우가 있어 제외시켜야 했다. 추가로 리다이렉션(응답코드 30X) 되는 경우도 로그가 중복이기 때문에 제외 시켰다.

```bash
# 앱에서 호출하는 경우 userAgent에 KakaoPage가 포함된다.
sed '/KaKaoPage/d' access.log-xxxxxxxx > 1_only_web
# 응답코드 30X인 레코드를 제외시킨다.(더 정확하게 할 수 있겠지만 이 정도만 해도 충분했다.)
sed '/" 30. /d' 1_only_web > 2_delete_redirect
```

GoAccess를 실행시켜 로그 파일을 분석하고 결과를 html파일로 만든다. (결과 화면은 [https://goaccess.io/](https://goaccess.io/)를 참고)

```bash
goaccess 2_delete_redirect -a -o 2_delete_redirect.html
```

결과를 대략 정리해 보면 크롬이 대부분을 차지했고, IE와 엣지는 통틀어 3%가 되지 않았다. IE10은 약 20명 내외였으며 서버 수를 고려한다 해도 절대치가 미미한 수준이었다. 아마도 이제 IE10 지원에 대한 고민은 하지 않아도 될 듯 하다.
