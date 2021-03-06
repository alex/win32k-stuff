from __future__ import print_function

import collections
import pprint

import click


STACK_TRACE_HEADER = "'===WIN32K-START==='"
STACK_TRACE_FOOTER = "'===WIN32K-END==='"


def extract_frames(stack, xul_frames):
    # Skip the first two lines, which aren't frames at all.
    idx = 2
    # Set to true once we see our first `xul` frame.
    xul_found = False
    frames = []
    while (xul_frames is None or xul_frames > 0) and idx < len(stack):
        line = stack[idx].split()
        idx += 1
        if line[1:3] == ['(Inline', 'Function)']:
            frames.append(line[4])
        else:
            frames.append(line[3])
        if frames[-1].startswith("xul!"):
            xul_found = True
        if xul_found and xul_frames is not None:
            xul_frames -= 1
    return frames


@click.command()
@click.argument("path")
@click.option("--xul-frames", default=None, type=click.INT)
@click.option("--stacks", default=None, type=click.INT)
@click.option("--select", default=None, multiple=True)
@click.option("--exclude", default=None, multiple=True)
def main(path, xul_frames, stacks, select, exclude):
    with open(path) as f:
        lines = [line.strip() for line in f]

    idx = -1
    sections = []
    while True:
        try:
            start_idx = lines.index(STACK_TRACE_HEADER, idx + 1)
            end_idx = lines.index(STACK_TRACE_FOOTER, start_idx + 1)
        except ValueError:
            break
        else:
            sections.append(lines[start_idx:end_idx])
            idx = end_idx

    c = collections.Counter()
    for section in sections:
        if select and not any(any(f in s for f in select) for s in section):
            continue
        if exclude and any(any(e in s for e in exclude) for s in section):
            continue
        c[tuple(extract_frames(section, xul_frames))] += 1

    for stack, count in c.most_common(stacks):
        print("{} - {}".format(count, stack[0]))
        print("\n".join("    " + s for s in stack))
        print()
        print()


if __name__ == "__main__":
    main()
