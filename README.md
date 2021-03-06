# win32k hacks

These are some tools that I used in attempting to start the process of using the
"win32k deny policy" in Windows 8 and newer for Firefox.

The specific problem these tools attempt to solve is finding all of the existing
win32k usage in Firefox, so we could start working on moving those out of
process.

To that end, the rough way to use this is:

Run Firefox with (update paths as appropriate for your system; you'll need to
update `initialize-win32k-tracing.txt` as well):

```
./mach run \
    --debugger="C:\Program Files (x86)\Windows Kits\10\Debuggers\x64\windbg.exe" \
    --debugger-args="-c '\$\$<C:\Users\alex_gaynor\Desktop\win32k\initialize-win32k-tracing.txt'"
```

If you're using a 32-bit Firefox, you can replace `x64` with `x86`.

If you'd like to use the latest WinDbgX preview, you can instead pass:
`--debugger="C:\Users\alex_gaynor\AppData\Local\Microsoft\WindowsApps\WinDbgX.exe"`
(note that there's a bug that will cause the initial script to not run, so
you'll have to run it manually).

Now you can browse around a log of all the win32k syscalls will be generated.

Once you're done, you can close the browser and WinDbg and switch over to your
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

You can also use `--select=WORD` and `--exclude=WORD` to restrict yourself to
only stacks that do or do not include a frame containing the specified `WORD.`

This same strategy works with `./mach mochitest`.
