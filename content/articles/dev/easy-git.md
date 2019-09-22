---
title: 'Git 사용 팁 정리'
date: '2019-09-21T10:55:19'
description: 'git cli를 사용하다 생긴 귀차니즘 없애기'
category: 'dev'
tags: [git, cli, git-hook, alias]
---

개발을 하다보니 너무나 당연하게도 git을 사용한다. 처음부터 git을 cli로만 사용하다보니 [Sourcetree](https://www.sourcetreeapp.com/)나 [Tower](https://www.git-tower.com) 같은 GUI client를 사용하는 것보다 직접 타이핑 하는게 오히려 더 편하게 느껴진다. 하지만 cli 특성상 타이핑이 많거나 반복되는 경우가 생긴다. 게으름이 기술의 발전을 이끈다고 하던가... 귀차니즘이 너무 심해질 때 마다 하나씩 해결했던 방법들을 몇가지 정리해 본다.

## 1. checkout의 귀차니즘

작업을 하다보면 새로 만들거나 혹은 리뷰를 위해 다른 브랜치를 pull 하거나 등등으로 여러 브랜치 사이를 이동하는 경우는 흔한 일이다. 그러나 브랜치명이 길다면 매번 입력하는건 여간 귀찮은 일이 아니다. 사실 [Zsh](https://ohmyz.sh/)을 사용하고 있어 탭과 방향키 만으로 브랜치를 선택할 수는 있지만 순간 손을 이동해야 한다. 타이핑을 하다가 방향키로 손을 움직이는 것도 번거로워 진 시점에 현재 로컬의 브랜치들의 리스트를 보여주고 번호 입력으로 checkout을 하는 python script([github](https://github.com/nukeguys/utils))를 작성했었다.
이외에도 python으로 일에 필요한 것들을 작성했었는데 지금은 사용하지 않고 있다. 동작은 아래에서 확인 할 수 있다.

[![asciicast](https://asciinema.org/a/270031.svg)](https://asciinema.org/a/270031)

## 2. alias 설정하기

option으로 command 자체가 길어지거나, 빈번하게 command를 연속해서 입력해야 하는 경우에는 축약하거나 한 번에 처리하고 싶어진다. 이런 경우에는 [alias](https://git-scm.com/book/ko/v2/Git%EC%9D%98-%EA%B8%B0%EC%B4%88-Git-Alias)를 설정할 수 있다. 간단한 git command 부터 bash 함수까지 실행이 가능하기 때문에 생각보다 많은 것들이 가능해진다.

내가 처음 사용했던건 log를 좀 더 이쁘게 보기 위한 alias 였다. 이후에 사용하면서 필요하다 싶은 것들을 하나씩 추가했다.

```bash
[alias]
	s = status
	a = !git add . && git status
	au = !git add -u . && git status
	aa = !git add . && git add -u . && git status
	c = commit
	cm = commit -m
	ca = commit --amend # careful
	ac = !git add . && git commit
	acm = !git add . && git commit -m
	l = log --graph --all --pretty=format:'%C(yellow)%h%C(cyan)%d%Creset %s %C(white)- %an, %ar%Creset'
	ll = log --stat --abbrev-commit
	lg = log --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
	llg = log --color --graph --pretty=format:'%C(bold white)%H %d%Creset%n%s%n%+b%C(bold blue)%an <%ae>%Creset %C(bold green)%cr (%ci)' --abbrev-commit
	d = diff
	lgdiff = "!f() { git log --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit $1..$2;}; f"
	lgraph = log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
	branch-name = !git rev-parse --abbrev-ref HEAD
	publish = !git push -u origin $(git branch-name)
	rm-remote = "!f() { git push origin --no-verify :$1; }; f"
	rb = "!f() { git branch -D $(git branch | grep -E $1); }; f"
	rt = "!f() { git tag -d $(git tag -l $1); }; f"
	rrt = "!f() { git push origin --no-verify -d $(git tag -l $1); }; f"
	aliases = !git config --list | grep 'alias\\.' | sed 's/alias\\.\\([^=]*\\)=\\(.*\\)/\\1\\\t => \\2/' | sort
	cb = "!f() { git checkout -b feature/KG-$1-$2; }; f"
```

아래는 내가 가장 빈번하게 사용하는 alias들이다.  
`publish` - remote에 현재 브랜치 push  
`rb` - 정규식에 매핑되는 로컬 브랜치 삭제 / `rm-remote` - remote 브랜치 삭제  
`cb` - 특정 포맷에 맞게 브랜치 생성 / `ca` - commit --amend 줄여쓰기  
`ac` - add, commit 한 번에 하기 / `lg` - log 이쁘게 보기

등록된 alias들이 기억나지 않을 땐 `git aliases`를 통해 list 확인이 가능하다. 구글링하면 유용한 alias들이 많으니 자신이 자주 사용하는 것들을 등록하고 사용하면 생각보다 많이 편리하다.

## 3. commit message에 이슈 번호 자동 입력하기

commit message는 어느정도 가이드라인을 지켜주는게 이력들을 볼 때 편하다. 하지만 매번 기억하기는 어렵기 때문에 commit시 템플릿을 사용하도록 설정해 놓으면 잊지 않고 지킬 수 있다. template 설정도 alias처럼 config 파일에 직접 추가하거나 `git config --global commit.template ~/.gitmessage.txt` command를 사용할 수 있다.(global 옵션을 사용하지 않으면 repository별로 설정도 가능하다.) 난 개인적으로 [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)를 참고해서 아래와 같은 template을 사용하고 있다.

```bash
# <type>: (If applied, this commit will...) <subject> (Max 50 char)
# |<----  Using a Maximum Of 50 Characters  ---->|
[ISSUE-NUMBER]

# Explain why this change is being made
# |<----   Try To Limit Each Line to a Maximum Of 72 Characters   ---->|


# Provide links or keys to any relevant tickets, articles or other resources
Resolves: ISSUE-NUMBER

# --- COMMIT END ---
# Type can be
#    feat     (new feature)
#    fix      (bug fix)
#    refactor (refactoring production code)
#    style    (formatting, missing semi colons, etc; no code change)
#    docs     (changes to documentation)
#    test     (adding or refactoring tests; no production code change)
#    chore    (updating grunt tasks etc; no production code change)
# --------------------
# Remember to
#    Capitalize the subject line
#    Use the imperative mood in the subject line
#    Do not end the subject line with a period
#    Separate subject from body with a blank line
#    Use the body to explain what and why vs. how
#    Can use multiple lines with "-" for bullet points in body
# --------------------
```

그런데 최근에 계속 작성을 하면서 issue 번호를 입력하는 부분이 너무 번거로웠다. 왜냐하면 기본적으로 branch 명에 이슈 번호를 포함해서 정해진 포맷으로 사용하고 있고(이것도 귀찮아서 만든게 `cb` alias다.) commit시 현재 브랜치명에서 issue 번호를 가져다 template을 자동으로 채워주면 좋겠다는 생각이 들었다.
그래서 `prepare-commit-msg` hook을 작성했다. hook은 git workflow의 전후로 script를 실행할 수 있게 해준다. (설정 방법과 자세한 설명은 [Git - Git 훅](https://git-scm.com/book/ko/v2/Git%EB%A7%9E%EC%B6%A4-Git-Hooks)을 참고)
직접 hook directory에 파일을 작성할 수도 있지만 [husky](https://github.com/typicode/husky)를 사용하면 hook을 좀 더 쉽게 관리할 수도 있다.

```bash
#!/bin/bash

COMMIT_MSG_FILE=$1
ISSUE_NUMBER_TAG='ISSUE-NUMBER'

branch_name=`git rev-parse --abbrev-ref HEAD`
issue_number=`echo ${branch_name} | sed -n 's/^feature\/\(.*-[0-9]*\)-.*/\1/p'`

if [ -n "$issue_number" ]; then
  sed -i ".bak" "s/${ISSUE_NUMBER_TAG}/${issue_number}/g" ${COMMIT_MSG_FILE}
fi
```

## 4. tig (text-mode interface for Git) 사용

[tig](https://github.com/jonas/tig)는 텍스트 기반의 git client다. 따라서 terminal 벗어나지 않아도 되고 커스터마이징이 가능하기 때문에 잘만 사용하면 상당히 유용하다. (나도 간단하게만 사용하고 있는데 좀 더 활용을 해보고 나중에 다시 정리해봐야겠다.)
tig 메뉴얼은 친절하게 한국어로 번역([[번역] Tig Manual](https://ujuc.github.io/2016/02/10/tig-manual/))된 것이 있으니 한 번 읽어보면 좋을 듯하다.

이외에도 github 사용을 편하게 만들어주는 [hub](https://hub.github.com/)도 있고, 간단한 설정이나 script를 작성하면 cli를 사용하는 불편함들을 많이 제거할 수 있다.
