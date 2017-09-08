"use strict";

const EXCLUDED_WIN32K_SYSCALLS = [
    // These are all called from the core event loop, and are thus incredibly
    // high volume, making the browser basically unusable if they're logged.
    // We're already aware that they're an issue, so don't log them for now.
    "NtUserPeekMessage",
    "NtUserValidateHandleSecure",
    "NtUserPostMessage"
];

// TODO: fill this out with all 1000+
const WIN32K_SYSCALLS = [
    "NtUserGetWindowDC",
    "NtUserCalloneParam",
    "NtGdiSetIcmMode",
    "NtUserCallNoParam",
    "NtUserSystemParametersInfo",
    "NtUserGetDisplayConfigBufferSizes",
    "NtUserDisplayConfigGetDeviceInfo"
];

function _executeCommand(cmd) {
    host.namespace.Debugger.Utility.Control.ExecuteCommand(cmd);
}

function invokeScript() {
    var cl = host.currentProcess.Environment.EnvironmentBlock.ProcessParameters.CommandLine.ToDisplayString();
    // If the process is not a content process (e.g. parent or GPU), don't set
    // up our breakpoints.
    if (cl.slice(-5, -1) !== " tab") {
        return;
    }
    for (var syscall of WIN32K_SYSCALLS) {
        if (EXCLUDED_WIN32K_SYSCALLS.includes(syscall)) {
            continue;
        }
        _executeCommand(
            `bp WIN32U! ${syscall} ".echo '===WIN32K-START==='; k; .echo '===WIN32K-END==='; g"`
        );
    }
}
