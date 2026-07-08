Type "git init -q -b main"
Enter
Sleep 250ms
Type "echo 'hello git' > README.md"
Enter
Sleep 250ms
Type "git add README.md"
Enter
Sleep 250ms
Type "git commit -m init"
Enter
Sleep 1200ms
Type "git cat-file -t HEAD"
Enter
Sleep 450ms
Type "git cat-file -p HEAD --no-mailmap | sed -n '1,4p'"
Enter
Sleep 1500ms
