from __future__ import print_function

import click


BREAKPOINT_LINE = """bp {module}!{func} ".echo '===WIN32K-START===';k;.echo '===WIN32K-END===';g"\r\n"""
EXCLUDED_FUNCS = {
    # These are all called from the core event loop, and are thus incredibly
    # high volume, making the browser basically unusable if they're logged.
    # We're already aware that they're an issue, so don't log them for now.
    "NtUserPeekMessage", "NtUserValidateHandleSecure", "NtUserPostMessage"
}

@click.command()
@click.argument("input", type=click.File("r"), default="-")
@click.argument("output", type=click.File("w"))
def main(input, output):
    for line in input:
        func = line.strip()
        if func in EXCLUDED_FUNCS:
            continue
        # Write all of these out, since I can't figure out which module things
        # are in. windbg doesn't hard fail on non-existant things, so It's Fine
        # (tm)
        for module in ["USER32", "GDI32", "WIN32U"]:
            output.write(BREAKPOINT_LINE.format(module=module, func=func))


if __name__ == "__main__":
    main()
