# win32k hacks

These are some tools that I used in attempting to start the process of using the
"win32k deny policy" in Windows 8 and newer for Firefox.

The specific problem these tools attempt to solve is finding all of the existing
win32k usage in Firefox, so we could start working on moving those out of
process.

To that end, the rough way to use this is:

```shell
$ python generate-win32k-command-script.py win32k-syscall.txt generated-command-script.txt
```

This will give you a WinDbg command script which you can then use on WinDbg.

Next, start firefox with `./mach run`. Using Process Explorer, identity one that
is a content process (you may want to set the number of content processes used
to one for simplicity).

Now, attach to that process with WinDbg and setup the process:

```
$$<C:\Path\To\generated-command-script.txt
.logopen C:\Path\To\win32k-output-log.txt
g
```

Now you can browse around a log of all the win32k syscalls will be generated.

Once you're done, you can close the browser and WinDbg. And switch over to your
console:

```shell
python process-win32k-traces.py win32k-output-log.txt
```

This will show you a basic summary of the win32k syscalls. The default options
are to truncate each stack traces to include up to 3 frames above the first xul
frame. It then aggregates these and shows the top 5 stack traces by occurrences.

You can use `--xul-frames=N` to get more complete stack traces (at the risk of
causing similar stacks to no longer merge), and `--stacks=N` to show more
stacks.

You can also use `--filter=WORD` and `--exclude=WORD` to restrict yourself to
only stacks that do or do not include a frame containing the specified `WORD.`
