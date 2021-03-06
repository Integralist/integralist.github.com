---
title: "Git Tips"
date: 2012-12-16T13:00:00+01:00
categories:
  - "code"
  - "guide"
tags:
  - "bash"
  - "git"
  - "shell"
draft: false
---

I thought I would get down in a blog post the different [Git](http://git-scm.com) commands and tips that I find really useful, because every now and then it seems I need to refer back to these notes (which up until this point have been in a txt file in my Dropbox) if I've not used a particular command in a while. 

Hopefully you'll find them useful too.

1. <a href="#1">Show where Git is installed</a>
2. <a href="#2">Show the Git version installed</a>
3. <a href="#3">Update your global user details</a>
4. <a href="#4">Set-up a global ignore file</a>
5. <a href="#5">Adding all files (inc. those marked as deleted)</a>
6. <a href="#6">Writing a long commit</a>
7. <a href="#7">Viewing file changes while writing your commit</a>
8. <a href="#8">Viewing what files have been committed</a>
9. <a href="#9">Improving `git log` with `git lg`</a>
10. <a href="#10">Shorter `git status`</a>
11. <a href="#11">Finding a commit that includes a specific phrase</a>
12. <a href="#12">Only merging the files you want</a>
13. <a href="#13">Stashing changes you're not ready to commit</a>
14. <a href="#14">Revert all changes back to last commit</a>
15. <a href="#15">Unstaging files</a>
16. <a href="#16">Untrack a file without deleting it</a>
17. <a href="#17">Amend your last commit</a>
18. <a href="#18">Show the files within a commit</a>
19. <a href="#19">See any changes between current working directory and last commit</a>
20. <a href="#20">See changes between two commits</a>
21. <a href="#21">Creating a branch and moving to it at the same time</a>
22. <a href="#22">Deleting a branch</a>
23. <a href="#23">Viewing all branches of a remote</a>
24. <a href="#24">Checkout a remote branch</a>
25. <a href="#25">Remove a remote</a>
26. <a href="#26">Revert a specific file back to an earlier version</a>
27. <a href="#27">Viewing all commits for a file and who made those changes</a>
28. <a href="#28">Commiting only parts of a file rather than the whole file</a>
29. <a href="#29">Modifying your Git history with `rebase`</a>
30. <a href="#30">Push branch without specifying its name</a>

<div id="1"></div>
## Show where Git is installed

`which git`

<div id="2"></div>
## Show the Git version installed

`git version`

<div id="3"></div>
## Update your global user details

```
git config --global user.name "Your Name"
git config --global user.email "Your Email"
git config --global apply.whitespace nowarn # ignore white space changes!
```

<div id="4"></div>
## Set-up a global ignore file

First create the global ignore file…

`touch ~/.gitignore_global`

Then add the following content to it (*this is a standard ignore file but I've added some Sass CSS pre-processor files to it*)…

```
# Compiled source #
###################
*.com
*.class
*.dll
*.exe
*.o
*.so
*.sass-cache
*.scssc

# Packages #
############
# it's better to unpack these files and commit the raw source
# git has its own built in compression methods
*.7z
*.dmg
*.gz
*.iso
*.jar
*.rar
*.tar
*.zip

# Logs and databases #
######################
*.log
*.sql
*.sqlite

# OS generated files #
######################
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
Icon?
ehthumbs.db
Thumbs.db
```

You can let Git know about your global ignore file by editing your global `.gitconfig` file…

`nano ~/.gitconfig`

…then adding the following to it… 

```
[core]
    excludesfile = /Users/<home-directory>/.gitignore_global
```

…or once the `.gitignore_global` file is created you can just tell git by using this short-hand command…

`git config --global core.excludesfile ~/.gitignore_global`

<div id="5"></div>
## Adding all files (inc. those marked as deleted)

`git add -A`

<div id="6"></div>
## Writing a long commit

A short git commit message would look like this…

`git commit -m "My short commit message"`

…but you should really be writing longer more descriptive commit messages which you do like so:

`git commit`

…what this does is open up the default editor for commit messages (which for most is Vim). Now Vim is a bizarre editor with all sorts of odd shortcuts for adding text. I've only used Vim to write commit messages (nothing else) so I have a very focused set of commands to write my commands…

Press `i` which puts Vim into 'insert' mode (meaning you can actually write)

    This is my short description for this commit
    - Here is a break down of my changes
    - Another note about a particular change

After I've written my commit I just need to save the commit and exit Vim…

* Press `Esc`
* Press `:wq` (the colon means you can execute more commands, w = write, q = quit)

<div id="7"></div>
## Viewing file changes while writing your commit

`git commit -v`

<div id="8"></div>
## Viewing what files have been committed

`git ls-files`

<div id="9"></div>
## Improving `git log` with `git lg`

To get a better looking `git log` we need to write an alias called `git lg` that is just made up of standard Git commands/flags but when put together (along with specific colour settings) means we can have a short git command that provides us lots of useful information.

What we need to do is open the `~/.gitconfig` file and then add the following content… 

```
[alias]
    lg = log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit --date=relative
```

<div id="10"></div>
## Shorter `git status`

As per the above tip, we can create two extra alias' which give us a shorter command to type (I don't know about you but when typing really fast I seem to always misspell the word 'status') and doesn't show us all the unnecessary crap that someone new to Git needs to see.

What we need to do is open the `~/.gitconfig` file and then add the following content… 

```
[alias] 
    st = status
    sts = status -sb
```

…you don't need to specify `[alias]` if it's already in the file (see previous tip).

Now typing `git st` will be the same as `git status`, and typing `git sts` will be the same as `git status -sb`.

<div id="11"></div>
## Finding a commit that includes a specific phrase

`git log --grep=<your-phrase-here>`

For example, `git log --grep=CSS` will display all commits that contain the word 'CSS' in the message.

<div id="12"></div>
## Only merging the files you want

`git checkout <branch-name> <file1> <file2> <file3>`

<div id="13"></div>
## Stashing changes you're not ready to commit

If you make changes to your branch and then want to quickly change branches without first having to commit your current 'dirty state' then run:

`git stash`

To apply a stashed state (git assumes the most recent stashed state if none specified) use: 

`git stash apply`

To see which stashes you've stored (on any branch) use:

`git stash list`

When viewing a list of stashes it can be useful if the stashes had corresponding messages (so you know what each stash holds), for that to happen you'll need to create stashes with an associated message using the `save` command:  

`git stash save "my message here"`

If you have multiple stashes under a branch (e.g. `stash@{1}` `stash@{2}` `stash@{3}`) then you can reference a particular stash using:

`git stash apply stash@{2}` (pre 2.0 this would work `git stash apply@{2}`)

If you want to stash only specific changes then use the patch mode:

`git stash -p`

To view the contents of a stash use:

`git stash show -p stash@{n}`

…where 'n' is the numeric index of the stash (you can also use `git show stash@{n}`)

Applying the stash doesn't mean it's removed from your list of stashes though(!) so you need to run:

`git stash drop stash@{<index>}`

e.g. `git stash drop stash@{2}`

You can also apply and drop the stash at the same time:

`git stash pop`

You can also specify an exact stash to pop:

`git stash pop stash@{2}`

If you stash some work, leave it there for a while, and continue on the branch from which you stashed the work, you may have a problem reapplying the work. If the apply tries to modify a file that you’ve since modified, you’ll get a merge conflict and will have to try to resolve it. If you want an easier way to test the stashed changes again, you can run `git stash <branch>` which creates a new branch for you, checks out the commit you were on when you stashed your work, reapplies your work there, and then drops the stash if it applies successfully.

If you need to stash only specific files then first `git add` the files you don't want to stash, then run:

`git stash --keep-index`

...finally you can then `git reset` the files you originally added (if you don't plan on committing them yet).

<div id="14"></div>
## Revert all changes back to last commit

`git reset --hard`

Note: you can do a 'soft' reset `git reset --soft <hash>`. The difference between `--hard` and `--soft` is with `--hard` the specified commit hash's files are moved into the working directory and the staging area (as if there were no changes since that specified commit). But using `--soft` will leave whatever changes you've made in your working directory/staging area but will restore the specified commit you've selected.

<div id="15"></div>
## Unstaging files

To unstage files we've added to the staging area we need to run the command `reset HEAD` but that's a bit ugly and awkward to remember. What would be easier is if we could just say `git unstage`, so let's create an alias to help make that easier!

Open up the file `~/.gitconfig` and then add the following content… 

```
[alias]
    unstage = reset HEAD
```

Note: you don't need to specify `[alias]` if it's already in the `~/.gitconfig` file.

You can also unstage a single file using:

`git reset <file>`

If you've staged files before any commits have been set (e.g. right at the start of your project) then you'll find the above wont work because technically there are no commits to revert back to. So instead you'll need to remove the files like so…

`git rm --cached <file>`

<div id="16"></div>
## Untrack a file without deleting it

If you want to have Git stop tracking a file it's already tracking then you would think to run:

`git rm <file>`

…but the problem with that command is that Git will also delete the file altogether!? Something we usually don't want to have happen.

The work around to that issue is to use the `--cached` flag:

`git rm --cached <file>`

<div id="17"></div>
## Amend your last commit

If you make a commit and then realise that you want to amend the commit message then don't make any changes to the files and just run…

`git commit --amend`

…which will open up the default editor for handling commits (usually Vim) and will let you amend the commit message.

If on the other hand you decide that after you've written a commit that you want to amend the commit by adding some more files to it then just add the files as normal and run the same command as above and when Vim opens to let you edit the commit message you'll see the extra files you added as part of that commit.

<div id="18"></div>
## Show the files within a commit

`git show <hash> --name-only`

<div id="19"></div>
## See differences between files

To see the difference between the current working directory and the last commit:  

`git diff`

If your files have been added to the staging area already then you can use the `--cached` flag:  

`git diff --cached`

To show specific changes use the `--word-diff` flag:

`git diff --word-diff`

To see the diff between the working directory and a specific commit:  

`git diff <hash> <file-name>` (the file name is optional)

To see the difference between branches:

`git diff <branch-1>..<branch-2>`

<div id="20"></div>
## See changes between two commits

`git diff <more-recent-hash> <older-hash>`

<div id="21"></div>
## Creating a branch and moving to it at the same time

`git checkout -b <branch-name>`

<div id="22"></div>
## Deleting a branch

`git branch -D <branch-name>`

<div id="23"></div>
## Viewing all branches of a remote

`git branch -a`

<div id="24"></div>
## Checkout a remote branch

What normally happens is this: you clone down a repository from GitHub and this repo will have multiple branches, but if you run `git branch` locally all you see is the `master` branch.

If you run `git branch -a` you can see all the branches for that remote repository but you just can't access them or check them out?

So if you want to access the other branches within that repo then run the following command:

`git checkout -b <new-local-branch-name> origin/<remote-branch-name>`

…this will create a new branch named whatever you called it and contains the content of the remote branch you specified.

<div id="25"></div>
## Remove a remote

`git remove rm <remote>`

<div id="26"></div>
## Revert a specific file back to an earlier version

`git checkout <hash|tag|HEAD> <file-name>`

Note if you've staged your file and then started making changes to the file which you no longer want applied you can use: `git checkout -- <file-name>` to revert to the version of the file in the staging area.

<div id="27"></div>
## Viewing all commits for a file and who made those changes

`git blame <file>`

<div id="28"></div>
## Commiting only parts of a file rather than the whole file

If you have a file with lots of changes made, you might not want to have all the changes logged under one single commit.

To split the single file into multiple commits you need to use Git's `patch` mode… 

`git add <file> -p`

…Git will attempt to split a file into separate hunks (Git terminology for a chunk of code). You can then press `?` to see what options you have available, the most common being:

* `y` - yes
* `n` - no
* `d` - no to all remaining hunks
* `s` - split current hunk into more hunks

Sometimes you can't split a hunk into more hunks automatically, you have to do it manually. To do so you press `e` to edit and then use Vim to manually make changes.

So if you have a line removed that you want to keep as part of the commit then you'll remove the `-` so there is just a space instead, and if you have a line added that you want to not have included as part of the commit then you remove the entire line. BUT the most important part it also updating the line numbers at the top of the file so that the number of lines in the file match what you are looking to commit (otherwise the commit will fail). To make the edit to the hunk final (pre-commit) press `esc` then `:wq` and then you'll be able to commit the selected changes.

<div id="29"></div>
## Modifying your Git history with `rebase`

To change multiple commits you must use the interactive mode of the `rebase` command and you must tell Git how many commits back you want to go (because it'll start from there and keep moving through the commits until it reaches the `HEAD`).

REMEMBER: when using `rebase` every commit in the range specified is changed whether you change the message or not. So don't use `rebase` on commits that have already been pushed to a remote server as other users might have those commits pulled down and your changing of the commits will cause havoc for those users in the near future.

To amend the last 3 commits we use: `git rebase -i HEAD~3` and follow the instructions.

The principle is if you want to merge two commits then you'll need to have a commit to merge into and then change `pick` to `squash` on the other commits that you want to have squashed into the previous commit.

You can also re-order commits and other things like change commits (add files, rename the message) and remove commits completely.

<div id="30"></div>
## Push branch without specifying its name

If you have a long branch name then you'll know how tedious it is to type out:

```
git push origin bug-fix/cache-nodes-expiration
```

Instead you can rely on the fact that git will retrieve the current branch name from its head tag:

```
git push origin head
```
